import React, { useState, useEffect, useRef } from 'react';
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
  FileText
} from 'lucide-react';

const WhatsAppBulkSender = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [devices, setDevices] = useState([
    { id: 1, name: 'Device 1', status: 'online', phone: '+1234567890', lastSeen: '2 minutes ago' },
    { id: 2, name: 'Device 2', status: 'offline', phone: '+0987654321', lastSeen: '1 hour ago' }
  ]);
  const [campaigns, setCampaigns] = useState([
    {
      id: 1,
      name: 'Campaign 1',
      status: 'running',
      sent: 45,
      failed: 2,
      pending: 53,
      total: 100,
      startTime: '2024-01-15 10:30',
    }
  ]);
  const [showQR, setShowQR] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [sendingStatus, setSendingStatus] = useState({
    sent: 0,
    failed: 0,
    pending: 0,
    total: 0,
    isRunning: false
  });
  const [logs, setLogs] = useState([
    { id: 1, contact: '+1234567890', status: 'sent', time: '10:30:45', message: 'Message sent successfully' },
    { id: 2, contact: '+1234567891', status: 'failed', time: '10:30:50', message: 'Failed to send: Network error' },
    { id: 3, contact: '+1234567892', status: 'sent', time: '10:30:55', message: 'Message sent successfully' }
  ]);
  
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // Simulate QR code generation
  const generateQR = () => {
    setShowQR(true);
    // Simulate QR code (this would be actual QR in real implementation)
    setQrCode('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    
    // Simulate QR scan after 5 seconds
    setTimeout(() => {
      setShowQR(false);
      const newDevice = {
        id: devices.length + 1,
        name: `Device ${devices.length + 1}`,
        status: 'online',
        phone: `+${Math.floor(Math.random() * 10000000000)}`,
        lastSeen: 'Just now'
      };
      setDevices([...devices, newDevice]);
    }, 5000);
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const contacts = content.split('\n').filter(line => line.trim());
        setSelectedContacts(contacts.map((contact, index) => ({ 
          id: index, 
          phone: contact.trim(), 
          name: `Contact ${index + 1}` 
        })));
      };
      reader.readAsText(file);
    }
  };

  // Handle image upload
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImages(prev => [...prev, {
          id: Date.now() + Math.random(),
          name: file.name,
          url: e.target.result
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Simulate sending messages
  const startSending = () => {
    if (!selectedContacts.length || !messageText.trim()) return;
    
    setSendingStatus({
      sent: 0,
      failed: 0,
      pending: selectedContacts.length,
      total: selectedContacts.length,
      isRunning: true
    });

    // Simulate sending process
    let sent = 0, failed = 0;
    const interval = setInterval(() => {
      if (sent + failed >= selectedContacts.length) {
        clearInterval(interval);
        setSendingStatus(prev => ({ ...prev, isRunning: false }));
        return;
      }

      const success = Math.random() > 0.1; // 90% success rate
      if (success) {
        sent++;
      } else {
        failed++;
      }

      setSendingStatus(prev => ({
        ...prev,
        sent,
        failed,
        pending: selectedContacts.length - sent - failed
      }));

      // Add to logs
      const newLog = {
        id: Date.now() + Math.random(),
        contact: selectedContacts[sent + failed - 1]?.phone || 'Unknown',
        status: success ? 'sent' : 'failed',
        time: new Date().toLocaleTimeString(),
        message: success ? 'Message sent successfully' : 'Failed to send: Network error'
      };
      setLogs(prev => [newLog, ...prev]);
    }, 500);
  };

  // Navigation items
  const navItems = [
    { id: 'dashboard', icon: MessageSquare, label: 'Dashboard' },
    { id: 'devices', icon: Smartphone, label: 'Devices' },
    { id: 'sender', icon: Send, label: 'Bulk Sender' },
    { id: 'logs', icon: FileText, label: 'Logs' }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full transition-all duration-300 z-30 ${
        sidebarOpen ? 'w-64' : 'w-16'
      } ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r`}>
        <div className="flex items-center justify-between p-4">
          <h1 className={`font-bold text-xl transition-opacity duration-300 ${
            sidebarOpen ? 'opacity-100' : 'opacity-0 w-0'
          } ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            WhatsApp Bulk
          </h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-lg hover:bg-opacity-10 hover:bg-gray-500 transition-colors ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            <Menu size={20} />
          </button>
        </div>
        
        <nav className="mt-8 px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 mb-2 ${
                  activeTab === item.id
                    ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                    : darkMode
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={20} />
                <span className={`transition-opacity duration-300 ${
                  sidebarOpen ? 'opacity-100' : 'opacity-0 w-0'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-full flex items-center justify-center space-x-2 p-3 rounded-xl transition-colors ${
              darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span className={`transition-opacity duration-300 ${
              sidebarOpen ? 'opacity-100' : 'opacity-0 w-0'
            }`}>
              {darkMode ? 'Light' : 'Dark'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'} p-6`}>
        {/* Header */}
        <div className={`mb-8 p-6 rounded-2xl shadow-sm ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {navItems.find(item => item.id === activeTab)?.label}
          </h2>
          <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
            Manage your WhatsApp bulk messaging campaigns
          </p>
        </div>

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className={`p-6 rounded-2xl shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Connected Devices</p>
                    <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {devices.filter(d => d.status === 'online').length}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Smartphone className="text-blue-600" size={24} />
                  </div>
                </div>
              </div>
              
              <div className={`p-6 rounded-2xl shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Messages Sent</p>
                    <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {campaigns.reduce((acc, campaign) => acc + campaign.sent, 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-xl">
                    <CheckCircle className="text-green-600" size={24} />
                  </div>
                </div>
              </div>
              
              <div className={`p-6 rounded-2xl shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Failed Messages</p>
                    <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {campaigns.reduce((acc, campaign) => acc + campaign.failed, 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-xl">
                    <XCircle className="text-red-600" size={24} />
                  </div>
                </div>
              </div>
              
              <div className={`p-6 rounded-2xl shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active Campaigns</p>
                    <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {campaigns.filter(c => c.status === 'running').length}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-xl">
                    <Clock className="text-yellow-600" size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Active Campaigns */}
            <div className={`p-6 rounded-2xl shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Active Campaigns
              </h3>
              {campaigns.map(campaign => (
                <div key={campaign.id} className={`p-4 rounded-xl mb-4 ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {campaign.name}
                    </h4>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      campaign.status === 'running' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 mb-2">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{campaign.sent}</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sent</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{campaign.failed}</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Failed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">{campaign.pending}</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pending</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{campaign.total}</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(campaign.sent / campaign.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Devices Tab */}
        {activeTab === 'devices' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Device Management
              </h3>
              <button
                onClick={generateQR}
                className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors"
              >
                <Plus size={20} />
                <span>Add Device</span>
              </button>
            </div>

            {/* QR Code Modal */}
            {showQR && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className={`p-8 rounded-2xl shadow-xl max-w-md w-full mx-4 ${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <div className="text-center">
                    <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Scan QR Code
                    </h3>
                    <div className="w-64 h-64 mx-auto mb-4 bg-gray-200 rounded-xl flex items-center justify-center">
                      <div className="w-48 h-48 bg-black opacity-10 rounded grid grid-cols-8 gap-1 p-2">
                        {Array.from({length: 64}).map((_, i) => (
                          <div key={i} className={`${Math.random() > 0.5 ? 'bg-black' : 'bg-white'} rounded-sm`}></div>
                        ))}
                      </div>
                    </div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Open WhatsApp on your phone and scan this QR code
                    </p>
                    <div className="flex items-center justify-center mt-4">
                      <RefreshCw className="animate-spin text-blue-500" size={20} />
                      <span className={`ml-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Waiting for scan...
                      </span>
                    </div>
                    <button
                      onClick={() => setShowQR(false)}
                      className={`mt-4 px-4 py-2 rounded-lg ${
                        darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Devices List */}
            <div className="grid gap-4">
              {devices.map(device => (
                <div key={device.id} className={`p-6 rounded-2xl shadow-sm ${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl ${
                        device.status === 'online' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <Smartphone className={
                          device.status === 'online' ? 'text-green-600' : 'text-red-600'
                        } size={24} />
                      </div>
                      <div>
                        <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {device.name}
                        </h4>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {device.phone}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Last seen: {device.lastSeen}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        device.status === 'online' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {device.status}
                      </span>
                      <button className={`p-2 rounded-lg hover:bg-opacity-10 hover:bg-gray-500 ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        <Eye size={16} />
                      </button>
                      <button className={`p-2 rounded-lg hover:bg-opacity-10 hover:bg-gray-500 ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        <RotateCcw size={16} />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-opacity-10 hover:bg-red-500 text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bulk Sender Tab */}
        {activeTab === 'sender' && (
          <div className="space-y-6">
            {/* Contact Upload */}
            <div className={`p-6 rounded-2xl shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Upload Contacts
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".txt,.csv"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full p-6 border-2 border-dashed rounded-xl transition-colors ${
                      darkMode 
                        ? 'border-gray-600 hover:border-blue-400 text-gray-300' 
                        : 'border-gray-300 hover:border-blue-400 text-gray-600'
                    }`}
                  >
                    <Upload size={32} className="mx-auto mb-2" />
                    <p className="font-medium">Upload Contact List</p>
                    <p className="text-sm opacity-75">.txt or .csv files</p>
                  </button>
                </div>
                <div>
                  <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Contacts ({selectedContacts.length})
                  </h4>
                  <div className={`max-h-32 overflow-y-auto p-3 rounded-lg ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    {selectedContacts.map(contact => (
                      <div key={contact.id} className="flex justify-between items-center py-1">
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {contact.phone}
                        </span>
                      </div>
                    ))}
                    {selectedContacts.length === 0 && (
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        No contacts uploaded
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Message Composition */}
            <div className={`p-6 rounded-2xl shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Compose Message
              </h3>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Enter your message here..."
                className={`w-full h-32 p-4 rounded-xl border transition-colors resize-none ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
              
              {/* Image Upload */}
              <div className="mt-4">
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
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Camera size={20} />
                  <span>Add Images</span>
                </button>
                
                {selectedImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 gap-4">
                    {selectedImages.map(image => (
                      <div key={image.id} className="relative">
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => setSelectedImages(prev => prev.filter(img => img.id !== image.id))}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
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
            <div className={`p-6 rounded-2xl shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Sending Status
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={startSending}
                    disabled={!selectedContacts.length || !messageText.trim() || sendingStatus.isRunning}
                    className="flex items-center space-x-2 bg-green-500 text-white px-6 py-2 rounded-xl hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Play size={20} />
                    <span>Start Sending</span>
                  </button>
                  <button
                    onClick={() => setSendingStatus(prev => ({ ...prev, isRunning: false }))}
                    disabled={!sendingStatus.isRunning}
                    className="flex items-center space-x-2 bg-red-500 text-white px-6 py-2 rounded-xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Pause size={20} />
                    <span>Stop Sending</span>
                  </button>
                </div>
              </div>

              {/* Live Stats */}
              {sendingStatus.total > 0 && (
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <p className="text-3xl font-bold text-green-600">{sendingStatus.sent}</p>
                    <p className="text-sm text-green-700">Sent</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-xl">
                    <p className="text-3xl font-bold text-red-600">{sendingStatus.failed}</p>
                    <p className="text-sm text-red-700">Failed</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-xl">
                    <p className="text-3xl font-bold text-yellow-600">{sendingStatus.pending}</p>
                    <p className="text-sm text-yellow-700">Pending</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <p className="text-3xl font-bold text-blue-600">{sendingStatus.total}</p>
                    <p className="text-sm text-blue-700">Total</p>
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              {sendingStatus.total > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Progress</span>
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      {Math.round(((sendingStatus.sent + sendingStatus.failed) / sendingStatus.total) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${((sendingStatus.sent + sendingStatus.failed) / sendingStatus.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Sending Animation */}
              {sendingStatus.isRunning && (
                <div className="flex items-center justify-center space-x-2 py-4">
                  <RefreshCw className="animate-spin text-blue-500" size={20} />
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Sending messages...
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Message Logs
              </h3>
              <div className="flex space-x-2">
                <button className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors">
                  <Download size={20} />
                  <span>Export CSV</span>
                </button>
                <button 
                  onClick={() => setLogs([])}
                  className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition-colors"
                >
                  <Trash2 size={20} />
                  <span>Clear Logs</span>
                </button>
              </div>
            </div>

            {/* Logs Filter */}
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <div className="flex flex-wrap gap-2">
                {['all', 'sent', 'failed'].map(filter => (
                  <button
                    key={filter}
                    className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                      filter === 'all' 
                        ? 'bg-blue-500 text-white' 
                        : darkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter} ({filter === 'all' ? logs.length : logs.filter(log => log.status === filter).length})
                  </button>
                ))}
              </div>
            </div>

            {/* Logs Table */}
            <div className={`rounded-2xl shadow-sm overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                    <tr>
                      <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                        darkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        Contact
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                        darkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        Status
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                        darkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        Time
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                        darkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        Message
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                        darkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {logs.map((log) => (
                      <tr key={log.id} className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                          darkMode ? 'text-gray-300' : 'text-gray-900'
                        }`}>
                          {log.contact}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            log.status === 'sent'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {log.status === 'sent' ? (
                              <div className="flex items-center space-x-1">
                                <CheckCircle size={12} />
                                <span>Sent</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-1">
                                <XCircle size={12} />
                                <span>Failed</span>
                              </div>
                            )}
                          </span>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                          darkMode ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                          {log.time}
                        </td>
                        <td className={`px-6 py-4 text-sm ${
                          darkMode ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                          <div className="max-w-xs truncate">
                            {log.message}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2">
                            {log.status === 'failed' && (
                              <button className="text-blue-600 hover:text-blue-900 transition-colors">
                                <RotateCcw size={16} />
                              </button>
                            )}
                            <button className={`hover:text-red-900 transition-colors ${
                              darkMode ? 'text-red-400' : 'text-red-600'
                            }`}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {logs.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} size={48} />
                    <p className={`text-lg font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No logs available
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      Start sending messages to see logs here
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Pagination */}
            {logs.length > 10 && (
              <div className="flex justify-between items-center">
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Showing 1 to 10 of {logs.length} entries
                </p>
                <div className="flex space-x-2">
                  <button className={`px-4 py-2 rounded-lg ${
                    darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                  } hover:bg-opacity-80 transition-colors`}>
                    Previous
                  </button>
                  <button className={`px-4 py-2 rounded-lg ${
                    darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                  } hover:bg-opacity-80 transition-colors`}>
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Template Manager - Bonus Feature */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Message Templates
              </h3>
              <button className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors">
                <Plus size={20} />
                <span>New Template</span>
              </button>
            </div>

            <div className="grid gap-4">
              {[
                { id: 1, name: 'Welcome Message', content: 'Hello {name}, welcome to our service!', variables: ['name'] },
                { id: 2, name: 'Promotion Alert', content: 'Hi {name}, check out our {discount}% off sale!', variables: ['name', 'discount'] },
                { id: 3, name: 'Reminder', content: 'Dear {name}, don\'t forget about your appointment on {date}.', variables: ['name', 'date'] }
              ].map(template => (
                <div key={template.id} className={`p-6 rounded-2xl shadow-sm ${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {template.name}
                      </h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Variables: {template.variables.join(', ')}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button className={`p-2 rounded-lg hover:bg-opacity-10 hover:bg-gray-500 ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        <Eye size={16} />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-opacity-10 hover:bg-blue-500 text-blue-500">
                        <Send size={16} />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-opacity-10 hover:bg-red-500 text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {template.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings - Additional Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Settings
            </h3>

            {/* Message Settings */}
            <div className={`p-6 rounded-2xl shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h4 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Message Settings
              </h4>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Message Delay (seconds)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    defaultValue="3"
                    className={`w-full p-3 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Max Retry Attempts
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    defaultValue="2"
                    className={`w-full p-3 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className={`p-6 rounded-2xl shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h4 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Notifications
              </h4>
              <div className="space-y-4">
                {[
                  'Campaign completion alerts',
                  'Device disconnection notifications',
                  'Error notifications',
                  'Daily summary emails'
                ].map((setting, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      {setting}
                    </span>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform translate-x-6"></span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* API Settings */}
            <div className={`p-6 rounded-2xl shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h4 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                API Configuration
              </h4>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    API Key
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="password"
                      value="••••••••••••••••"
                      readOnly
                      className={`flex-1 p-3 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                    <button className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                      Regenerate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {!sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-20"
          onClick={() => setSidebarOpen(true)}
        ></div>
      )}

      {/* Success Toast */}
      <div className="fixed bottom-4 right-4 space-y-2 z-40">
        {sendingStatus.isRunning && (
          <div className={`p-4 rounded-xl shadow-lg animate-bounce ${
            darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}>
            <div className="flex items-center space-x-2">
              <RefreshCw className="animate-spin text-blue-500" size={20} />
              <span>Sending in progress...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppBulkSender;