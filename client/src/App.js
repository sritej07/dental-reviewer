import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PatientDashboard from './pages/PatientDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UploadPage from './pages/UploadPage';
import SubmissionView from './pages/SubmissionView';
import AdminSubmissionView from './pages/AdminSubmissionView';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/upload" element={<UploadPage />} />
              
              {/* Protected Patient Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute roles={['patient']}>
                  <PatientDashboard />
                </ProtectedRoute>
              } />
              <Route path="/submission/:id" element={
                <ProtectedRoute roles={['patient']}>
                  <SubmissionView />
                </ProtectedRoute>
              } />
              
              {/* Protected Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute roles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/submission/:id" element={
                <ProtectedRoute roles={['admin']}>
                  <AdminSubmissionView />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;