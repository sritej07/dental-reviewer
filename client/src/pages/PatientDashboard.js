import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import StatusBadge from '../components/StatusBadge';
import { Upload, Eye, Download, Calendar, FileText, AlertCircle } from 'lucide-react';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await axios.get('/api/submissions/my-submissions');
      setSubmissions(response.data.submissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setError('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (submissionId, fileName) => {
    try {
      const submission = submissions.find(s => s._id === submissionId);
      if (submission?.reportUrl) {
        // Open report URL in new tab
        window.open(submission.reportUrl, '_blank');
      }
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="loading-spinner"></div>
        <span className="ml-2">Loading your dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patient Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.name}</p>
        </div>
        <Link to="/upload" className="btn-primary">
          <Upload size={20} />
          New Upload
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Upload size={24} className="text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Uploads</p>
              <p className="text-2xl font-bold text-gray-900">{submissions.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Calendar size={24} className="text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">
                {submissions.filter(s => s.status === 'uploaded').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Eye size={24} className="text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Reviewed</p>
              <p className="text-2xl font-bold text-gray-900">
                {submissions.filter(s => s.status === 'annotated').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText size={24} className="text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Reports Ready</p>
              <p className="text-2xl font-bold text-gray-900">
                {submissions.filter(s => s.status === 'reported').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Your Submissions</h2>
        </div>

        {error && (
          <div className="alert alert-error mb-6">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {submissions.length === 0 ? (
          <div className="text-center py-12">
            <Upload size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
            <p className="text-gray-600 mb-6">
              Upload your first dental photo to get started with professional screening.
            </p>
            <Link to="/upload" className="btn-primary">
              <Upload size={20} />
              Upload Photos
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div
                key={submission._id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {submission.patientName}
                      </h3>
                      <StatusBadge status={submission.status} />
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Email: {submission.patientEmail}</p>
                      <p>Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</p>
                      {submission.note && <p>Note: {submission.note}</p>}
                      }
                    </div>

                    {submission.reviewedAt && (
                      <p className="text-sm text-gray-600 mt-2">
                        Reviewed: {new Date(submission.reviewedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/submission/${submission._id}`}
                      className="btn-secondary"
                    >
                      <Eye size={16} />
                      View Details
                    </Link>
                    
                    {submission.status === 'reported' && submission.reportUrl && (
                      <button
                        onClick={() => downloadReport(submission._id, `report_${submission.patientName}.pdf`)}
                        className="btn-primary"
                      >
                        <Download size={16} />
                        Download Report
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;