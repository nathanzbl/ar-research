import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SurveyContainer } from './components/Survey';
import { AdminDashboard } from './pages/AdminDashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<SurveyContainer />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}

export default App;
