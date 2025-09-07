import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Members from './pages/Members';
import Payments from './pages/Payments';
import Navigation from './components/Navigation';
import dataService from './services/dataService';
import './App.css';

function App() {
  useEffect(() => {
    // Initialize with sample data if needed
    dataService.initializeSampleData();
  }, []);

  return (
    <Router>
      <div className="App">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/members" element={<Members />} />
            <Route path="/payments" element={<Payments />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
