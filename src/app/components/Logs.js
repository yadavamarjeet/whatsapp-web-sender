// components/Logs.js
import React, { useState, useEffect } from 'react';
import { Download, Trash2, Eye, RotateCcw, FileText, XCircle, CheckCircle } from 'lucide-react';
import { apiService } from '../services/apiService';

const Logs = ({ campaigns }) => {
    const [selectedCampaign, setSelectedCampaign] = useState('');
    const [logs, setLogs] = useState([]);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (selectedCampaign) {
            loadLogs(selectedCampaign);
        }
    }, [selectedCampaign]);

    const loadLogs = async (campaignId) => {
        try {
            const response = await apiService.getCampaignLogs(campaignId);
            setLogs(response.data);
        } catch (error) {
            console.error('Error loading logs:', error);
        }
    };

    const exportLogs = async () => {
        try {
            const response = await apiService.exportLogs(selectedCampaign || undefined);

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setDownload(`message_logs_${selectedCampaign || 'all'}_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error exporting logs:', error);
        }
    };

    const filteredLogs = logs.filter(log => {
        if (filter === 'all') return true;
        return log.status === filter;
    });

    return (
        <div className="logs-page">
            <div className="page-header">
                <h2>Message Logs</h2>
                <div className="header-actions">
                    <button onClick={exportLogs} className="btn-secondary">
                        <Download size={20} />
                        <span>Export CSV</span>
                    </button>
                    <button
                        onClick={() => setLogs([])}
                        className="btn-danger"
                    >
                        <Trash2 size={20} />
                        <span>Clear Logs</span>
                    </button>
                </div>
            </div>

            {/* Campaign Selection */}
            <div className="section-card">
                <h3>Select Campaign</h3>
                <select
                    value={selectedCampaign}
                    onChange={(e) => setSelectedCampaign(e.target.value)}
                    className="form-select"
                >
                    <option value="">All Campaigns</option>
                    {campaigns.map(campaign => (
                        <option key={campaign.id} value={campaign.id}>
                            {campaign.name} ({new Date(campaign.created_at).toLocaleDateString()})
                        </option>
                    ))}
                </select>
            </div>

            {/* Filters */}
            <div className="section-card">
                <h3>Filters</h3>
                <div className="filter-buttons">
                    {['all', 'sent', 'failed'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`filter-btn ${filter === f ? 'active' : ''}`}
                        >
                            {f} ({f === 'all' ? logs.length : logs.filter(log => log.status === f).length})
                        </button>
                    ))}
                </div>
            </div>

            {/* Logs Table */}
            <div className="section-card">
                <h3>Message Logs</h3>

                {filteredLogs.length === 0 ? (
                    <div className="empty-state">
                        <FileText size={48} />
                        <h3>No logs available</h3>
                        <p>Select a campaign to view logs</p>
                    </div>
                ) : (
                    <div className="logs-table">
                        <div className="table-header">
                            <div className="table-cell">Contact</div>
                            <div className="table-cell">Status</div>
                            <div className="table-cell">Time</div>
                            <div className="table-cell">Message</div>
                            <div className="table-cell">Actions</div>
                        </div>

                        {filteredLogs.map(log => (
                            <div key={log.id} className="table-row">
                                <div className="table-cell">{log.contact_number}</div>
                                <div className="table-cell">
                                    <span className={`status-badge ${log.status}`}>
                                        {log.status === 'sent' ? (
                                            <>
                                                <CheckCircle size={12} />
                                                <span>Sent</span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle size={12} />
                                                <span>Failed</span>
                                            </>
                                        )}
                                    </span>
                                </div>
                                <div className="table-cell">
                                    {new Date(log.sent_at).toLocaleString()}
                                </div>
                                <div className="table-cell">
                                    {log.error_message || 'Message sent successfully'}
                                </div>
                                <div className="table-cell">
                                    <div className="action-buttons">
                                        {log.status === 'failed' && (
                                            <button className="icon-btn">
                                                <RotateCcw size={16} />
                                            </button>
                                        )}
                                        <button className="icon-btn">
                                            <Eye size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {filteredLogs.length > 10 && (
                    <div className="pagination">
                        <span>Showing 1 to 10 of {filteredLogs.length} entries</span>
                        <div className="pagination-buttons">
                            <button className="pagination-btn">Previous</button>
                            <button className="pagination-btn">Next</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Logs;