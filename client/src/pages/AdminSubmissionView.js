import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import StatusBadge from '../components/StatusBadge';
import AnnotationCanvas from '../components/AnnotationCanvas';
import axios from 'axios';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Mail, 
  FileText, 
  Save,
  Download,
  AlertCircle,
  CheckCircle,
  Eye
} from 'lucide-react';

const AdminSubmissionView = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [treatmentRecommendations, setTreatmentRecommendations] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSubmission();
  }, [id]);

  const fetchSubmission = async () => {
    try {
      const response = await axios.get(`/api/submissions/${id}`);
      const submissionData = response.data.submission;
      setSubmission(submissionData);
      setAnnotations(submissionData.annotations || []);
      setTreatmentRecommendations(submissionData.treatmentRecommendations || '');
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

  const handleAnnotationsChange = async (newAnnotations, annotatedImageData) => {
    setAnnotations(newAnnotations);
    
    if (annotatedImageData) {
      setSaving(true);
      setError('');
      setSuccess('');

      try {
        const response = await axios.put(`/api/admin/submissions/${id}/annotations`, {
          annotations: newAnnotations,
          annotatedImageData
        });

        setSubmission(response.data.submission);
        setSuccess('Annotations saved successfully!');
      } catch (error) {
        console.error('Error saving annotations:', error);
        setError('Failed to save annotations');
      } finally {
        setSaving(false);
      }
    }
  };

  const generateReport = async () => {
    if (!treatmentRecommendations.trim()) {
      setError('Please provide treatment recommendations before generating the report');
      return;
    }

    setGenerating(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`/api/admin/submissions/${id}/generate-report`, {
        treatmentRecommendations
      });

      setSubmission(response.data.submission);
      setSuccess('Report generated successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      setError(error.response?.data?.message || 'Failed to generate report');
    } finally {
      setGenerating(false);
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

  if (error && !submission) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
        <button
          onClick={() => navigate('/admin')}
          className="btn-secondary mt-4"
        >
          <ArrowLeft size={16} />
          Back to Admin Panel
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
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin')}
          className="btn-secondary"
        >
          <ArrowLeft size={16} />
          Back to Admin Panel
        </button>
        <StatusBadge status={submission.status} />
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircle size={20} />
          <span>{success}</span>
        </div>
      )}

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

      {/* Annotation Interface */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Image Annotation</h2>
          {submission.annotatedImageUrl && (
            <button
              onClick={viewAnnotatedImage}
              className="btn-secondary"
            >
              <Eye size={16} />
              View Saved Annotation
            </button>
          )}
        </div>
        
        <AnnotationCanvas
          imageUrl={submission.originalImageUrl}
          annotations={annotations}
          onAnnotationsChange={handleAnnotationsChange}
        />
        
        {saving && (
          <div className="mt-4 flex items-center gap-2 text-blue-600">
            <div className="loading-spinner"></div>
            <span>Saving annotations...</span>
          </div>
        )}
      </div>

      {/* Treatment Recommendations */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Treatment Recommendations</h2>
        <textarea
          value={treatmentRecommendations}
          onChange={(e) => setTreatmentRecommendations(e.target.value)}
          className="form-input form-textarea"
          rows={8}
          placeholder="Provide detailed treatment recommendations based on your analysis..."
        />
        
        <div className="mt-4 flex items-center gap-4">
          <button
            onClick={generateReport}
            disabled={generating || !treatmentRecommendations.trim() || submission.status !== 'annotated'}
            className="btn-primary"
          >
            {generating ? (
              <>
                <div className="loading-spinner"></div>
                Generating Report...
              </>
            ) : (
              <>
                <FileText size={16} />
                Generate PDF Report
              </>
            )}
          </button>
          
          {submission.status === 'reported' && submission.reportUrl && (
            <button
              onClick={downloadReport}
              className="btn-secondary"
            >
              <Download size={16} />
              Download Report
            </button>
          )}
        </div>

        {submission.status !== 'annotated' && submission.status !== 'reported' && (
          <p className="text-sm text-gray-600 mt-2">
            Please save annotations before generating the report.
          </p>
        )}
      </div>

      {/* Workflow Status */}
      <div className="card bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-3">Workflow Progress</h3>
        <div className="space-y-2">
          <div className={`flex items-center gap-2 ${submission.status !== 'uploaded' ? 'text-green-600' : 'text-gray-600'}`}>
            <div className={`w-4 h-4 rounded-full ${submission.status !== 'uploaded' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span>Image uploaded by patient</span>
          </div>
          <div className={`flex items-center gap-2 ${submission.status === 'annotated' || submission.status === 'reported' ? 'text-green-600' : 'text-gray-600'}`}>
            <div className={`w-4 h-4 rounded-full ${submission.status === 'annotated' || submission.status === 'reported' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span>Image annotated by professional</span>
          </div>
          <div className={`flex items-center gap-2 ${submission.status === 'reported' ? 'text-green-600' : 'text-gray-600'}`}>
            <div className={`w-4 h-4 rounded-full ${submission.status === 'reported' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span>Report generated and available for patient</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSubmissionView;