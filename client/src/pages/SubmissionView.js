import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import StatusBadge from '../components/StatusBadge';
import axios from 'axios';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Mail, 
  FileText, 
  Download,
  AlertCircle,
  Eye 
} from 'lucide-react';

const SubmissionView = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubmission();
  }, [id]);

  const fetchSubmission = async () => {
    try {
      const response = await axios.get(`/api/submissions/${id}`);
      setSubmission(response.data.submission);
    } catch (error) {
      console.error('Error fetching submission:', error);
      if (error.response?.status === 403) {
        setError('You do not have permission to view this submission');
      } else if (error.response?.status === 404) {
        setError('Submission not found');
      } else {
        setError('Failed to load submission details');
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (submission?.reportUrl) {
      window.open(submission.reportUrl, '_blank');
    }
  };

  const viewAnnotatedImage = () => {
    if (submission?.annotatedImageUrl) {
      window.open(submission.annotatedImageUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="loading-spinner"></div>
        <span className="ml-2">Loading submission details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-secondary mt-4"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Submission not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-secondary"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
        <StatusBadge status={submission.status} />
      </div>

      {/* Patient Information */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Patient Information</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User size={20} className="text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Patient Name</p>
                <p className="font-medium text-gray-900">{submission.patientName}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Mail size={20} className="text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Email Address</p>
                <p className="font-medium text-gray-900">{submission.patientEmail}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar size={20} className="text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Submitted On</p>
                <p className="font-medium text-gray-900">
                  {new Date(submission.submittedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            {submission.reviewedAt && (
              <div className="flex items-center gap-3">
                <Calendar size={20} className="text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Reviewed On</p>
                  <p className="font-medium text-gray-900">
                    {new Date(submission.reviewedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {submission.note && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-start gap-3">
              <FileText size={20} className="text-gray-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Patient Notes</p>
                <p className="text-gray-900 mt-1">{submission.note}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Original Image */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Original Image</h2>
        <div className="bg-gray-50 rounded-lg p-4">
          <img
            src={submission.originalImageUrl}
            alt="Original submission"
            className="max-w-full h-auto rounded-lg shadow-sm mx-auto"
            style={{ maxHeight: '500px' }}
          />
        </div>
      </div>

      {/* Annotated Image (if available) */}
      {submission.annotatedImageUrl && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Annotated Review</h2>
            <button
              onClick={viewAnnotatedImage}
              className="btn-secondary"
            >
              <Eye size={16} />
              View Full Size
            </button>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <img
              src={submission.annotatedImageUrl}
              alt="Annotated review"
              className="max-w-full h-auto rounded-lg shadow-sm mx-auto"
              style={{ maxHeight: '500px' }}
            />
          </div>
        </div>
      )}

      {/* Treatment Recommendations */}
      {submission.treatmentRecommendations && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Treatment Recommendations</h2>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
              {submission.treatmentRecommendations}
            </p>
          </div>
        </div>
      )}

      {/* Report Download */}
      {submission.status === 'reported' && submission.reportUrl && (
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Final Report</h2>
              <p className="text-gray-600 mt-1">
                Your comprehensive oral health screening report is ready for download.
              </p>
            </div>
            <button
              onClick={downloadReport}
              className="btn-primary"
            >
              <Download size={20} />
              Download Report
            </button>
          </div>
        </div>
      )}

      {/* Status Information */}
      <div className="card bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-2">Status Information</h3>
        <div className="text-sm text-gray-600">
          {submission.status === 'uploaded' && (
            <p>Your submission has been received and is pending professional review.</p>
          )}
          {submission.status === 'annotated' && (
            <p>Your submission has been reviewed by a dental professional. The report is being prepared.</p>
          )}
          {submission.status === 'reported' && (
            <p>Your comprehensive report is ready for download. Please review the recommendations provided.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmissionView;