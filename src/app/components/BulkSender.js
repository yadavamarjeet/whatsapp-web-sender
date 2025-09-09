// components/BulkSender.js
import React, { useState, useRef } from 'react';
import { Upload, Camera, Play, Pause, X, RefreshCw } from 'lucide-react';
import { apiService } from '../services/apiService';

const BulkSender = ({ devices, socket }) => {
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [messageText, setMessageText] = useState('');
    const [selectedImages, setSelectedImages] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState('');
    const [sendingStatus, setSendingStatus] = useState({
        sent: 0,
        failed: 0,
        pending: 0,
        total: 0,
        isRunning: false,
        campaignId: null
    });

    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                const formData = new FormData();
                formData.append('contacts', file);
                const response = await apiService.uploadContacts(formData);
                setSelectedContacts(response.data.contacts);
            } catch (error) {
                console.error('Error uploading contacts:', error);
                alert('Failed to upload contacts file');
            }
        }
    };

    const handleImageUpload = async (event) => {
        const files = Array.from(event.target.files);
        if (files.length > 0) {
            try {
                const formData = new FormData();
                files.forEach(file => formData.append('images', file));
                const response = await apiService.uploadImages(formData);
                setSelectedImages(response.data.images);
            } catch (error) {
                console.error('Error uploading images:', error);
                alert('Failed to upload images');
            }
        }
    };

    const startSending = async () => {
        if (!selectedDevice || !selectedContacts.length || !messageText.trim()) {
            alert('Please select a device, upload contacts, and write a message');
            return;
        }

        try {
            const campaignData = {
                deviceSessionName: selectedDevice,
                messageText,
                contacts: selectedContacts,
                images: selectedImages
            };

            const response = await apiService.startCampaign(campaignData);

            setSendingStatus({
                sent: 0,
                failed: 0,
                pending: selectedContacts.length,
                total: selectedContacts.length,
                isRunning: true,
                campaignId: response.data.campaignId
            });

            // Listen for progress updates
            socket.on('campaign_progress', (data) => {
                if (data.campaignId === response.data.campaignId) {
                    setSendingStatus(prev => ({
                        ...prev,
                        sent: data.sent,
                        failed: data.failed,
                        pending: data.pending
                    }));
                }
            });

            socket.on('campaign_completed', (data) => {
                if (data.campaignId === response.data.campaignId) {
                    setSendingStatus(prev => ({
                        ...prev,
                        isRunning: false,
                        sent: data.sent,
                        failed: data.failed
                    }));
                }
            });

        } catch (error) {
            console.error('Error starting campaign:', error);
            alert('Failed to start campaign');
        }
    };

    return (
        <div className="bulk-sender">
            <div className="page-header">
                <h2>Bulk Message Sender</h2>
            </div>

            {/* Device Selection */}
            <div className="section-card">
                <h3>Select Device</h3>
                <select
                    value={selectedDevice}
                    onChange={(e) => setSelectedDevice(e.target.value)}
                    className="form-select"
                >
                    <option value="">Select a device</option>
                    {devices
                        .filter(device => device.status === 'connected')
                        .map(device => (
                            <option key={device.id} value={device.session_name}>
                                {device.session_name} ({device.phone_number})
                            </option>
                        ))
                    }
                </select>
            </div>

            {/* Contact Upload */}
            <div className="section-card">
                <h3>Upload Contacts</h3>
                <div className="upload-section">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".txt,.csv"
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="upload-btn"
                    >
                        <Upload size={20} />
                        <span>Upload Contact List</span>
                    </button>

                    {selectedContacts.length > 0 && (
                        <div className="contacts-preview">
                            <h4>Contacts ({selectedContacts.length})</h4>
                            <div className="contacts-list">
                                {selectedContacts.slice(0, 5).map((contact, index) => (
                                    <div key={index} className="contact-item">
                                        {contact.phone} {contact.name && `(${contact.name})`}
                                    </div>
                                ))}
                                {selectedContacts.length > 5 && (
                                    <div className="contact-more">
                                        +{selectedContacts.length - 5} more...
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Message Composition */}
            <div className="section-card">
                <h3>Compose Message</h3>
                <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Enter your message here..."
                    className="message-textarea"
                    rows="6"
                />

                {/* Image Upload */}
                <div className="image-upload-section">
                    <input
                        type="file"
                        ref={imageInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        multiple
                        className="hidden"
                    />
                    <button
                        onClick={() => imageInputRef.current?.click()}
                        className="btn-secondary"
                    >
                        <Camera size={20} />
                        <span>Add Images</span>
                    </button>

                    {selectedImages.length > 0 && (
                        <div className="images-preview">
                            {selectedImages.map(image => (
                                <div key={image.id} className="image-preview">
                                    <img src={image.url} alt={image.name} />
                                    <button
                                        onClick={() => setSelectedImages(prev => prev.filter(img => img.id !== image.id))}
                                        className="remove-image"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Send Controls */}
            <div className="section-card">
                <h3>Sending Controls</h3>

                <div className="send-controls">
                    <button
                        onClick={startSending}
                        disabled={!selectedDevice || !selectedContacts.length || !messageText.trim() || sendingStatus.isRunning}
                        className="btn-primary"
                    >
                        <Play size={20} />
                        <span>Start Sending</span>
                    </button>

                    <button
                        onClick={() => setSendingStatus(prev => ({ ...prev, isRunning: false }))}
                        disabled={!sendingStatus.isRunning}
                        className="btn-danger"
                    >
                        <Pause size={20} />
                        <span>Stop Sending</span>
                    </button>
                </div>

                {/* Progress Display */}
                {sendingStatus.total > 0 && (
                    <div className="sending-progress">
                        <div className="progress-stats">
                            <div className="progress-stat">
                                <span className="stat-value text-green-600">{sendingStatus.sent}</span>
                                <span className="stat-label">Sent</span>
                            </div>
                            <div className="progress-stat">
                                <span className="stat-value text-red-600">{sendingStatus.failed}</span>
                                <span className="stat-label">Failed</span>
                            </div>
                            <div className="progress-stat">
                                <span className="stat-value text-yellow-600">{sendingStatus.pending}</span>
                                <span className="stat-label">Pending</span>
                            </div>
                            <div className="progress-stat">
                                <span className="stat-value text-blue-600">{sendingStatus.total}</span>
                                <span className="stat-label">Total</span>
                            </div>
                        </div>

                        <div className="progress-bar-container">
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{
                                        width: `${((sendingStatus.sent + sendingStatus.failed) / sendingStatus.total) * 100}%`
                                    }}
                                ></div>
                            </div>
                            <span className="progress-percentage">
                                {Math.round(((sendingStatus.sent + sendingStatus.failed) / sendingStatus.total) * 100)}%
                            </span>
                        </div>

                        {sendingStatus.isRunning && (
                            <div className="sending-indicator">
                                <RefreshCw className="spinning" size={16} />
                                <span>Sending messages...</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BulkSender;