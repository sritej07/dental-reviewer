import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import StatusBadge from '../components/StatusBadge';
import axios from 'axios';
import { 
  Upload, 
  Eye, 
  FileText, 
  Users, 
  Calendar, 
  BarChart3,
  Filter,
  AlertCircle 
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({});
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    page: 1,
    limit: 10
  });

  useEffect(() => {
    fetchDashboardData();
    fetchSubmissions();
  }, [filters]);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/admin/dashboard/stats');
      setStats(response.data.stats);
      setRecentSubmissions(response.data.recentSubmissions);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Failed to load dashboard statistics');
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await axios.get('/api/admin/submissions', {
        params: filters
      });
      setSubmissions(response.data.submissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setError('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filter changes
    }));
  };

  if (loading && submissions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="loading-spinner"></div>
        <span className="ml-2">Loading admin dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome, Dr. {user?.name}</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText size={24} className="text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Upload size={24} className="text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">{stats.uploaded || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Eye size={24} className="text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Annotated</p>
              <p className="text-2xl font-bold text-gray-900">{stats.annotated || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <BarChart3 size={24} className="text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Reports Generated</p>
              <p className="text-2xl font-bold text-gray-900">{stats.reported || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Submissions */}
      {recentSubmissions.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Submissions</h2>
          <div className="space-y-3">
            {recentSubmissions.slice(0, 5).map((submission) => (
              <div key={submission._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{submission.patientName}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(submission.submittedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={submission.status} />
                  <Link
                    to={`/admin/submission/${submission._id}`}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Review
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Submissions */}
      <div className="card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-900">All Submissions</h2>
          
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-600" />
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Status</option>
              <option value="uploaded">Pending Review</option>
              <option value="annotated">Annotated</option>
              <option value="reported">Reported</option>
            </select>
          </div>
        </div>

        {submissions.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
            <p className="text-gray-600">
              {filters.status === 'all' 
                ? 'No submissions have been uploaded yet.'
                : `No submissions with status "${filters.status}" found.`
              }
            </p>
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
                      {submission.reviewedBy && (
                        <p>Reviewed by: {submission.reviewedBy.name}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/admin/submission/${submission._id}`}
                      className="btn-primary"
                    >
                      <Eye size={16} />
                      {submission.status === 'uploaded' ? 'Review' : 'View Details'}
                    </Link>
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

export default AdminDashboard;