// components/Sidebar.js
import React from 'react';
import {
    Smartphone,
    Plus,
    Send,
    Upload,
    Play,
    Pause,
    RotateCcw,
    Trash2,
    Eye,
    Download,
    Users,
    MessageSquare,
    CheckCircle,
    XCircle,
    Clock,
    RefreshCw,
    Moon,
    Sun,
    Menu,
    X,
    Image as ImageIcon,
    FileText,
    Home
} from 'lucide-react';

const Sidebar = ({ darkMode, setDarkMode, sidebarOpen, setSidebarOpen, activeTab, setActiveTab }) => {
    const navItems = [
        { id: 'dashboard', icon: Home, label: 'Dashboard' },
        { id: 'devices', icon: Smartphone, label: 'Devices' },
        { id: 'sender', icon: Send, label: 'Bulk Sender' },
        { id: 'logs', icon: FileText, label: 'Logs' }
    ];

    return (
        <div className={`sidebar ${darkMode ? 'dark' : 'light'} ${sidebarOpen ? 'open' : 'closed'}`}>
            <div className="sidebar-header">
                <h1 className={sidebarOpen ? '' : 'hidden'}>WhatsApp Bulk</h1>
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="menu-toggle"
                >
                    <Menu size={20} />
                </button>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                        >
                            <Icon size={20} />
                            <span className={sidebarOpen ? '' : 'hidden'}>{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="theme-toggle"
                >
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                    <span className={sidebarOpen ? '' : 'hidden'}>
                        {darkMode ? 'Light' : 'Dark'} Mode
                    </span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;