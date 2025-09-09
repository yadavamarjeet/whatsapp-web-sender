// components/Devices.js
import React, { useState } from 'react';
import { Smartphone, Plus, Eye, RotateCcw, Trash2, X } from 'lucide-react';
import { apiService } from '../services/apiService';

const Devices = ({ devices, onRefresh, socket }) => {
    const [showQR, setShowQR] = useState(false);
    const [qrCode, setQrCode] = useState('');
    const [sessionName, setSessionName] = useState('');
    const [currentSession, setCurrentSession] = useState(null);

    // Listen for QR code from socket
    socket.on('qr_generated', (data) => {
        setQrCode(data.qrCode);
        setShowQR(true);
    });

    // Set up socket event listeners
    socket.on('device_connected', (data) => {
        setShowQR(false);
        setQrCode('');
    });

    const addDevice = async () => {
        if (!sessionName || sessionName.length <= 5) {
            alert('Please enter a session name');
            return;
        }

        setShowQR(true);

        const deviceData = {
            sessionName: sessionName,
        };

        try {
            const response = await apiService.addDevice(deviceData);
            setCurrentSession(response.data.sessionName);
        } catch (error) {
            console.error('Error adding device:', error);
        }
    };

    const deleteDevice = async (sessionName) => {
        try {
            await apiService.deleteDevice(sessionName);
            onRefresh();
        } catch (error) {
            console.error('Error deleting device:', error);
        }
    };

    return (
        <div className="devices-page">
            <div className="page-header">
                <h2>Device Management</h2>
                <input
                    type="text"
                    placeholder="Enter Session Name"
                    className="block w-xs px-4 py-2 mb-2 border rounded-lg bg-gray-50 "
                    required={true}
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                />
                <button
                    onClick={addDevice}
                    className="btn-primary"
                >
                    <Plus size={20} />
                    <span>Add Device</span>
                </button>
            </div>

            {/* QR Code Modal */}
            {showQR && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Scan QR Code</h3>
                            <button onClick={() => setShowQR(false)} className="close-btn">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="qr-container">
                                <img src={qrCode} alt="WhatsApp QR Code" />
                            </div>
                            <p>Open WhatsApp on your phone and scan this QR code</p>
                            <div className="loading-indicator">
                                <RotateCcw className="spinning" size={20} />
                                <span>Waiting for scan...</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Devices List */}
            <div className="devices-list">
                {devices.length === 0 ? (
                    <div className="empty-state">
                        <Smartphone size={48} />
                        <h3>No devices connected</h3>
                        <p>Add a device to start sending messages</p>
                    </div>
                ) : (
                    devices.map(device => (
                        <div key={device.id} className="device-card">
                            <div className="device-info">
                                <div className="device-icon">
                                    <Smartphone className={device.status === 'connected' ? 'connected' : 'disconnected'} size={24} />
                                </div>
                                <div className="device-details">
                                    <h4>{device.session_name}</h4>
                                    <p>{device.phone_number || 'Not connected'}</p>
                                    <p>Last seen: {new Date(device.last_seen).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="device-actions">
                                <span className={`status-badge ${device.status}`}>
                                    {device.status}
                                </span>
                                <button className="icon-btn">
                                    <Eye size={16} />
                                </button>
                                <button className="icon-btn">
                                    <RotateCcw size={16} />
                                </button>
                                <button
                                    className="icon-btn danger"
                                    onClick={() => deleteDevice(device.session_name)}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Devices;