"use client"

import Image from "next/image";
import WhatsAppBulkSender from "./components/WhatsAppBulkSender";
import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Devices from './components/Devices';
import BulkSender from './components/BulkSender';
import Logs from './components/Logs';
import { apiService } from './services/apiService';

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [devices, setDevices] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState({
    connectedDevices: 0,
    totalSent: 0,
    totalFailed: 0,
    activeCampaigns: 0
  });
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    // Load initial data
    loadDevices();
    loadCampaigns();
    loadStats();

    // Set up socket event listeners
    newSocket.on('device_connected', (data) => {
      setDevices(prev => [...prev, data]);
      setStats(prev => ({ ...prev, connectedDevices: prev.connectedDevices + 1 }));
    });

    newSocket.on('device_disconnected', (data) => {
      setDevices(prev => prev.map(d =>
        d.sessionName === data.sessionName ? { ...d, status: 'disconnected' } : d
      ));
      setStats(prev => ({ ...prev, connectedDevices: Math.max(0, prev.connectedDevices - 1) }));
    });

    newSocket.on('campaign_progress', (data) => {
      setCampaigns(prev => prev.map(c =>
        c.id === data.campaignId ? { ...c, ...data } : c
      ));
    });

    newSocket.on('campaign_completed', (data) => {
      setCampaigns(prev => prev.map(c =>
        c.id === data.campaignId ? { ...c, ...data, status: 'completed' } : c
      ));
      loadStats(); // Refresh stats
    });

    return () => newSocket.close();
  }, []);

  const loadDevices = async () => {
    try {
      const response = await apiService.getDevices();
      console.log('Devices loaded:', response.data);
      setDevices(response.data);
    } catch (error) {
      console.error('Error loading devices:', error);
    }
  };

  const loadCampaigns = async () => {
    try {
      const response = await apiService.getCampaigns();
      setCampaigns(response.data);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiService.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard stats={stats} campaigns={campaigns} />;
      case 'devices':
        return <Devices devices={devices} onRefresh={loadDevices} socket={socket} />;
      case 'sender':
        return <BulkSender devices={devices} socket={socket} />;
      case 'logs':
        return <Logs campaigns={campaigns} />;
      default:
        return <Dashboard stats={stats} campaigns={campaigns} />;
    }
  };

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <Sidebar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <main className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {renderActiveTab()}
      </main>
    </div>
  );
}
