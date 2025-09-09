// server.js (updated with missing endpoints)
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const csv = require('csv-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:3000',  // Allow frontend origin
        methods: ['*'],
        credentials: true
    }
});

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',  // Allow your React frontend
    methods: ['*'],
    credentials: true
}));

app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

// Database setup
const db = new sqlite3.Database('./whatsapp_bulk.db');


db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS devices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sessionName TEXT UNIQUE,
        phoneNumber TEXT DEFAULT 'disconnected',
        status TEXT,
        lastSeen DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS campaigns (
        id TEXT PRIMARY KEY,
        name TEXT,
        deviceSessionName TEXT,
        messageText TEXT,
        images TEXT,
        status TEXT,
        sentCount INTEGER DEFAULT 0,
        failedCount INTEGER DEFAULT 0,
        totalContacts INTEGER,
        createdAt DATETIME
    )`);
});

// Store active WhatsApp sessions
const activeSessions = new Map();
const campaigns = new Map();

// API Routes

// Get all devices
app.get('/api/devices', (req, res) => {

    db.all('SELECT * FROM devices ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        const devices = Array.from(rows).map(session => ({
            id: session.id,
            session_name: session.sessionName,
            phone_number: session.phoneNumber || null,
            status: session.status ? 'connected' : 'disconnected',
            last_seen: new Date()
        }));

        res.json(devices);
    });
});

// Add a new device
app.post('/api/devices', async (req, res) => {
    const { sessionName } = req.body;

    if (!sessionName || sessionName.length < 5) {
        return res.status(400).json({ error: 'Session name is required and should be at least 5 characters long' });
    }
    
    try {
        const client = new Client({
            authStrategy: new LocalAuth({ clientId: sessionName }),
            puppeteer: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            }
        });

        // Store client reference
        activeSessions.set(sessionName, { client, sessionName });

        client.on('qr', async (qr) => {
            console.log('QR Code generated for session:', sessionName);
            let qrCodeData = await qrcode.toDataURL(qr);

            io.emit('qr_generated', { sessionName, qrCode: qrCodeData });
        });

        // Authentication successful
        client.on('authenticated', () => {
            console.log(`Client ${sessionName} authenticated`);
        });

        // Authentication failed
        client.on('auth_failure', (msg) => {
            console.error(`Authentication failed for ${sessionName}:`, msg);
            io.emit('device_auth_failure', { sessionName, error: msg });
        });

        // Client ready
        client.on('ready', () => {
            console.log(`Client ${sessionName} is ready!`);
            activeSessions.set(sessionName, { client, sessionName });

            db.run(
                'INSERT OR REPLACE INTO devices (sessionName, phoneNumber, status, lastSeen) VALUES (?, ?, ?, ?)',
                [sessionName, client.info.wid.user, 'connected', new Date().toISOString()],
                function (err) {
                    if (err) {
                        console.error('Database error:', err);
                        return;
                    }

                    io.emit('device_connected', {
                        sessionName,
                        phoneNumber: client.info.wid.user
                    });
                }
            );
        });

        // Client disconnected
        client.on('disconnected', (reason) => {
            console.log(`Client ${sessionName} disconnected:`, reason);

            // Update database
            db.run(
                'UPDATE devices SET status = ? WHERE sessionName = ?',
                ['disconnected', sessionName]
            );

            activeSessions.delete(sessionName);
            io.emit('device_disconnected', { sessionName, reason });
        });

        // Initialize client
        await client.initialize();
        res.json({ sessionName, message: 'Device session created' });

    } catch (error) {
        console.error('Error initializing WhatsApp client:', error);
        res.status(500).json({ error: 'Failed to initialize WhatsApp client' });
    }
});

// Delete a device
app.delete('/api/devices/:sessionName', async (req, res) => {
    const { sessionName } = req.params;

    // Disconnect WhatsApp client
    const client = activeSessions.get(sessionName);
    if (client) {
        await client.destroy();
        activeSessions.delete(sessionName);
    }

    //load the device before starting campaign
    db.run(`DELETE FROM devices WHERE sessionName = ?`, [sessionName], (err) => {
        if (err) {
            console.error('Error querying device:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }

    });

    res.json({ message: 'Device disconnected and session removed' });
});

// Upload contacts
app.post('/api/upload/contacts', upload.single('contacts'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const contacts = [];
    const filePath = req.file.path;
    const fileExtension = path.extname(filePath).toLowerCase();

    if (fileExtension === '.csv') {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                const phone = row.phone || row.number || row.Phone || row.Number;
                const name = row.name || row.Name;
                if (phone) {
                    contacts.push({ phone: phone.replace(/\D/g, ''), name });
                }
            })
            .on('end', () => {
                fs.unlinkSync(filePath); // Clean up file
                res.json({ contacts, count: contacts.length });
            })
            .on('error', (error) => {
                fs.unlinkSync(filePath);
                res.status(500).json({ error: 'Error parsing CSV file' });
            });
    } else if (fileExtension === '.txt') {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                fs.unlinkSync(filePath);
                return res.status(500).json({ error: 'Error reading file' });
            }

            const lines = data.split('\n');
            lines.forEach(line => {
                const trimmed = line.trim();
                if (trimmed) {
                    const phone = trimmed.replace(/\D/g, '');
                    if (phone) {
                        contacts.push({ phone, name: '' });
                    }
                }
            });

            fs.unlinkSync(filePath);
            res.json({ contacts, count: contacts.length });
        });
    } else {
        fs.unlinkSync(filePath);
        res.status(400).json({ error: 'Unsupported file format' });
    }
});

// Upload images
app.post('/api/upload/images', upload.array('images', 10), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No images uploaded' });
    }

    const images = req.files.map(file => ({
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        name: file.originalname,
        url: `/uploads/${file.filename}`,
        path: file.path
    }));

    res.json({ images, count: images.length });
});

// Start a campaign
app.post('/api/campaigns', async (req, res) => {
    const { deviceSessionName, messageText, contacts, images } = req.body;

    const campaignId = `campaign-${Date.now()}`;

    const campaign = {
        id: campaignId,
        name: `Campaign ${new Date().toLocaleString()}`,
        deviceSessionName,
        messageText,
        contacts,
        images,
        status: 'running',
        sent_count: 0,
        failed_count: 0,
        total_contacts: contacts.length,
        created_at: new Date()
    };

    campaigns.set(campaignId, campaign);

    //check if activeSession has the device
    if (!activeSessions.has(deviceSessionName)) {
        //load the device before starting campaign
        db.get(`SELECT * FROM devices WHERE sessionName = ?`, [deviceSessionName], (err, device) => {
            if (err) {
                console.error('Error querying device:', err.message);
                res.status(500).json({ error: err.message });
                return;
            }

            if (device) {
                console.log('Device found:', device);
                loadSavedSessions(device.sessionName, () => {
                    console.log('Device session loaded, starting campaign...');
                    // Start sending messages in background
                    sendMessages(campaign);
                });
            } else {
                console.log('No device found with sessionName:', sessionName);
                res.status(400).json({ error: 'Device not connected' });
                return;
            }
        });
    } else {
        console.log('Device session already active, starting campaign...');
        // Start sending messages in background
        sendMessages(campaign);
    }

    res.json({ campaignId, message: 'Campaign started' });
});

// Get all campaigns
app.get('/api/campaigns', (req, res) => {
    const campaignList = Array.from(campaigns.values());
    res.json(campaignList);
});

// Get campaign logs
app.get('/api/logs/:campaignId', (req, res) => {
    const { campaignId } = req.params;
    // This would typically query a database
    // For now, return mock data
    const logs = [
        // {
        //     id: 1,
        //     campaignId: campaignId || 'campaign-1',
        //     contact_number: '+1234567890',
        //     status: 'sent',
        //     sent_at: new Date(),
        //     error_message: null
        // },
        // {
        //     id: 2,
        //     campaignId: campaignId || 'campaign-1',
        //     contact_number: '+0987654321',
        //     status: 'failed',
        //     sent_at: new Date(),
        //     error_message: 'Invalid number'
        // }
    ];
    res.json(logs);
});

// Export logs
app.get('/api/logs/export/:campaignId', (req, res) => {
    const { campaignId } = req.params;
    // Generate CSV content
    const headers = 'Campaign ID,Contact Number,Status,Sent At,Error Message\n';
    const rows = [
        // 'campaign-1,+1234567890,sent,2023-01-01 12:00:00,',
        // 'campaign-1,+0987654321,failed,2023-01-01 12:01:00,Invalid number'
    ].join('\n');

    const csvContent = headers + rows;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=logs-${campaignId || 'all'}.csv`);
    res.send(csvContent);
});

// Get dashboard stats
app.get('/api/dashboard/stats', (req, res) => {
    const connectedDevices = Array.from(activeSessions.values()).filter(
        session => session.client.info
    ).length;

    const allCampaigns = Array.from(campaigns.values());
    const totalSent = allCampaigns.reduce((sum, camp) => sum + (camp.sent_count || 0), 0);
    const totalFailed = allCampaigns.reduce((sum, camp) => sum + (camp.failed_count || 0), 0);
    const activeCampaigns = allCampaigns.filter(camp => camp.status === 'running').length;

    res.json({
        connectedDevices,
        totalSent,
        totalFailed,
        activeCampaigns
    });
});

// Helper function to send messages
async function sendMessages(campaign) {
    const session = activeSessions.get(campaign.deviceSessionName);
    if (!session) return;

    const { client } = session;
    const { contacts, messageText, images } = campaign;

    for (let i = 0; i < contacts.length; i++) {
        if (campaign.status !== 'running') break;

        const contact = contacts[i];
        try {
            const chatId = `91${contact.phone}@c.us`;

            // Send message with optional images
            if (images && images.length > 0) {
                for (const image of images) {
                    let media = MessageMedia.fromFilePath(`.${image.url}`);
                    await client.sendMessage(chatId, media, {
                        caption: image === images[0] ? messageText : ''
                    });
                }
            } else {
                await client.sendMessage(chatId, messageText);
            }

            campaign.sent_count = (campaign.sent_count || 0) + 1;
            io.emit('campaign_progress', {
                campaignId: campaign.id,
                sent: campaign.sent_count,
                failed: campaign.failed_count,
                pending: contacts.length - campaign.sent_count - campaign.failed_count
            });
        } catch (error) {
            console.error(`Failed to send message to ${contact.phone}:`, error);
            campaign.failed_count = (campaign.failed_count || 0) + 1;
            io.emit('campaign_progress', {
                campaignId: campaign.id,
                sent: campaign.sent_count,
                failed: campaign.failed_count,
                pending: contacts.length - campaign.sent_count - campaign.failed_count
            });
        }

        // Add a delay between messages to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    campaign.status = 'completed';
    io.emit('campaign_completed', {
        campaignId: campaign.id,
        sent: campaign.sent_count,
        failed: campaign.failed_count,
        total: contacts.length
    });
}

function loadSavedSessions(sessionName, callback) {
    console.log(`Loading saved session: ${sessionName}`);

    const client = new Client({
        authStrategy: new LocalAuth({ clientId: sessionName }),
        puppeteer: {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
    });

    client.on('ready', () => {
        console.log(`Restored session ${sessionName} is ready!`);
        activeSessions.set(sessionName, { client, sessionName });

        db.run(
            `UPDATE devices SET status = 'connected', lastSeen = ? WHERE sessionName = ?`,
            [new Date().toISOString(), sessionName]
        );

        callback();

        io.emit('device_connected', {
            sessionName,
            phoneNumber: client.info.wid.user
        });
    });

    client.on('disconnected', (reason) => {
        console.log(`Session ${sessionName} disconnected:`, reason);
        activeSessions.delete(sessionName);

        db.run(
            `UPDATE devices SET status = 'disconnected' WHERE sessionName = ?`,
            [sessionName]
        );

        io.emit('device_disconnected', { sessionName, reason });
    });

    client.initialize();

    activeSessions.set(sessionName, { client, sessionName });
}

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 WhatsApp Bulk Sender Server running on port ${PORT}`);
    console.log(`📊 Dashboard: http://localhost:3000`);
    console.log(`🔌 API: http://localhost:${PORT}/api`);
});