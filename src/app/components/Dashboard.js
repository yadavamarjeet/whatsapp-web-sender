// components/Dashboard.js
import React from 'react';
import {
    Smartphone,
    CheckCircle,
    XCircle,
    Clock,
    Users,
    MessageSquare
} from 'lucide-react';

const Dashboard = ({ stats, campaigns }) => {
    return (
        <div className="dashboard">
            <div className="page-header">
                <h2>Dashboard</h2>
                <p>Manage your WhatsApp bulk messaging campaigns</p>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-content">
                        <div>
                            <p className="stat-label">Connected Devices</p>
                            <p className="stat-value">{stats.connectedDevices}</p>
                        </div>
                        <div className="stat-icon">
                            <Smartphone className="text-blue-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-content">
                        <div>
                            <p className="stat-label">Messages Sent</p>
                            <p className="stat-value">{stats.totalSent}</p>
                        </div>
                        <div className="stat-icon">
                            <CheckCircle className="text-green-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-content">
                        <div>
                            <p className="stat-label">Failed Messages</p>
                            <p className="stat-value">{stats.totalFailed}</p>
                        </div>
                        <div className="stat-icon">
                            <XCircle className="text-red-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-content">
                        <div>
                            <p className="stat-label">Active Campaigns</p>
                            <p className="stat-value">{stats.activeCampaigns}</p>
                        </div>
                        <div className="stat-icon">
                            <Clock className="text-yellow-600" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Campaigns */}
            <div className="section-card">
                <h3>Active Campaigns</h3>
                {campaigns.filter(c => c.status === 'running').length === 0 ? (
                    <p className="text-muted">No active campaigns</p>
                ) : (
                    campaigns.filter(c => c.status === 'running').map(campaign => (
                        <div key={campaign.id} className="campaign-item">
                            <div className="campaign-header">
                                <h4>{campaign.name}</h4>
                                <span className={`status-badge ${campaign.status}`}>
                                    {campaign.status}
                                </span>
                            </div>
                            <div className="campaign-stats">
                                <div className="stat">
                                    <p className="stat-number text-green-600">{campaign.sent_count || 0}</p>
                                    <p className="stat-label">Sent</p>
                                </div>
                                <div className="stat">
                                    <p className="stat-number text-red-600">{campaign.failed_count || 0}</p>
                                    <p className="stat-label">Failed</p>
                                </div>
                                <div className="stat">
                                    <p className="stat-number text-yellow-600">
                                        {(campaign.total_contacts || 0) - (campaign.sent_count || 0) - (campaign.failed_count || 0)}
                                    </p>
                                    <p className="stat-label">Pending</p>
                                </div>
                                <div className="stat">
                                    <p className="stat-number text-blue-600">{campaign.total_contacts || 0}</p>
                                    <p className="stat-label">Total</p>
                                </div>
                            </div>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{
                                        width: `${((campaign.sent_count + campaign.failed_count) / campaign.total_contacts) * 100}%`
                                    }}
                                ></div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Dashboard;