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

  const openAnnotated = (url) => {
    if (url) window.open(url, '_blank');
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
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/dashboard')} className="btn-secondary">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <StatusBadge status={submission.status} />
      </div>

      {/* Patient Information */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Patient Information</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User size={20} className="text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{submission.patientName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={20} className="text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{submission.patientEmail}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar size={20} className="text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Submitted On</p>
                <p className="font-medium">
                  {new Date(submission.submittedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            {submission.reviewedAt && (
              <div className="flex items-center gap-3">
                <Calendar size={20} className="text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Reviewed On</p>
                  <p className="font-medium">
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
                <p className="text-sm text-gray-600">Notes</p>
                <p className="mt-1">{submission.note}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Images (Upper, Front, Lower) */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Submitted Images</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {Object.entries(submission.images).map(([key, image]) => (
            <div key={key} className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-center font-semibold capitalize mb-2">
                {key.replace(/([A-Z])/g, ' $1')}
              </h3>
              <img
                src={image.originalImageUrl}
                alt={`${key} original`}
                className="rounded-lg shadow-sm mx-auto"
              />
              {image.annotatedImageUrl && (
                <button
                  onClick={() => openAnnotated(image.annotatedImageUrl)}
                  className="btn-secondary mt-3 w-full"
                >
                  <Eye size={16} /> View Annotated
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Treatment Recommendations */}
      {submission.treatmentRecommendations &&
        Object.keys(submission.treatmentRecommendations).length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Treatment Recommendations</h2>
          <div className="bg-blue-50 rounded-lg p-4 space-y-2">
            {Object.entries(submission.treatmentRecommendations).map(([problem, rec]) => (
              <div key={problem}>
                <span className="font-semibold">{problem}:</span>
                <span className="ml-2">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Final Report */}
      {submission.status === 'reported' && submission.reportUrl && (
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Final Report</h2>
              <p className="text-gray-600 mt-1">Download your generated report below.</p>
            </div>
            <button onClick={downloadReport} className="btn-primary">
              <Download size={20} /> Download
            </button>
          </div>
        </div>
      )}

      {/* Status Information */}
      <div className="card bg-gray-50">
        <h3 className="font-semibold mb-2">Status Information</h3>
        <div className="text-sm text-gray-600">
          {submission.status === 'uploaded' && <p>Pending review.</p>}
          {submission.status === 'annotated' && <p>Reviewed. Report being prepared.</p>}
          {submission.status === 'reported' && <p>Report ready for download.</p>}
        </div>
      </div>
    </div>
  );
};

export default SubmissionView;
