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
  Eye,
  Plus,
  Trash2
} from 'lucide-react';

const problemTypes = {
  'Inflammed/Red gums': '#A855F7',
  'Malaligned': '#EAB308',
  'Receded gums': '#78716C',
  'Stains': '#EF4444',
  'Attrition': '#22D3EE',
  'Crowns': '#EC4899'
};

const AdminSubmissionView = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [treatmentRecommendations, setTreatmentRecommendations] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [detectedProblems, setDetectedProblems] = useState([]);

  useEffect(() => {
    fetchSubmission();
  }, [id]);

  useEffect(() => {
    // Extract unique problems from annotations
    const problems = [...new Set(annotations.map(ann => ann.problem))];
    setDetectedProblems(problems);
    
    // Initialize recommendations for new problems
    const newRecommendations = { ...treatmentRecommendations };
    problems.forEach(problem => {
      if (!newRecommendations[problem]) {
        newRecommendations[problem] = '';
      }
    });
    
    // Remove recommendations for problems that no longer exist
    Object.keys(newRecommendations).forEach(problem => {
      if (!problems.includes(problem)) {
        delete newRecommendations[problem];
      }
    });
    
    setTreatmentRecommendations(newRecommendations);
  }, [annotations]);

  const fetchSubmission = async () => {
    try {
      const response = await axios.get(`/api/submissions/${id}`);
      const submissionData = response.data.submission;
      setSubmission(submissionData);
      setAnnotations(submissionData.annotations || []);
      setTreatmentRecommendations(submissionData.treatmentRecommendations || {});
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

  const handleRecommendationChange = (problem, value) => {
    setTreatmentRecommendations(prev => ({
      ...prev,
      [problem]: value
    }));
  };

  const addCustomRecommendation = () => {
    const problemName = prompt('Enter problem name:');
    if (problemName && !treatmentRecommendations[problemName]) {
      setTreatmentRecommendations(prev => ({
        ...prev,
        [problemName]: ''
      }));
    }
  };

  const removeRecommendation = (problem) => {
    const newRecommendations = { ...treatmentRecommendations };
    delete newRecommendations[problem];
    setTreatmentRecommendations(newRecommendations);
  };

  const saveTreatmentRecommendations = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.put(`/api/admin/submissions/${id}/recommendations`, {
        treatmentRecommendations
      });

      setSubmission(response.data.submission);
      setSuccess('Treatment recommendations saved successfully!');
    } catch (error) {
      console.error('Error saving recommendations:', error);
      setError('Failed to save treatment recommendations');
    } finally {
      setSaving(false);
    }
  };

  const generateReport = async () => {
    const hasRecommendations = Object.values(treatmentRecommendations).some(rec => rec.trim());
    if (!hasRecommendations) {
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Treatment Recommendations</h2>
          <div className="flex gap-2">
            <button
              onClick={addCustomRecommendation}
              className="btn-secondary text-sm"
            >
              <Plus size={16} />
              Add Custom Problem
            </button>
            <button
              onClick={saveTreatmentRecommendations}
              disabled={saving}
              className="btn-primary text-sm"
            >
              {saving ? (
                <>
                  <div className="loading-spinner"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Recommendations
                </>
              )}
            </button>
          </div>
        </div>

        {detectedProblems.length === 0 && Object.keys(treatmentRecommendations).length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">No problems detected yet</p>
            <p className="text-sm text-gray-500">Add annotations to the image above to generate problem-specific recommendations</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Auto-detected problems from annotations */}
            {detectedProblems.map(problem => (
              <div key={problem} className="bg-gray-50 rounded-lg p-4 border-l-4" style={{ borderLeftColor: problemTypes[problem] }}>
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: problemTypes[problem] }}
                  />
                  <h3 className="font-semibold text-gray-900">{problem}</h3>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    From Annotations
                  </span>
                </div>
                <textarea
                  value={treatmentRecommendations[problem] || ''}
                  onChange={(e) => handleRecommendationChange(problem, e.target.value)}
                  className="form-input form-textarea w-full"
                  rows={4}
                  placeholder={`Enter treatment recommendations for ${problem}...`}
                />
              </div>
            ))}

            {/* Custom problems not from annotations */}
            {Object.keys(treatmentRecommendations).filter(problem => !detectedProblems.includes(problem)).map(problem => (
              <div key={problem} className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-yellow-400 border-2 border-white shadow-sm" />
                    <h3 className="font-semibold text-gray-900">{problem}</h3>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      Custom Problem
                    </span>
                  </div>
                  <button
                    onClick={() => removeRecommendation(problem)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Remove this recommendation"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <textarea
                  value={treatmentRecommendations[problem] || ''}
                  onChange={(e) => handleRecommendationChange(problem, e.target.value)}
                  className="form-input form-textarea w-full"
                  rows={4}
                  placeholder={`Enter treatment recommendations for ${problem}...`}
                />
              </div>
            ))}
          </div>
        )}

        {/* Generate Report Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-4">
            <button
              onClick={generateReport}
              disabled={generating || Object.values(treatmentRecommendations).every(rec => !rec.trim()) || submission.status !== 'annotated'}
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
      </div>

      {/* Problem Summary */}
      {detectedProblems.length > 0 && (
        <div className="card bg-blue-50">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle size={20} className="text-blue-600" />
            Detected Problems Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {detectedProblems.map(problem => (
              <div key={problem} className="flex items-center gap-2 bg-white rounded-lg p-3 shadow-sm">
                <div 
                  className="w-3 h-3 rounded-full border border-white shadow-sm"
                  style={{ backgroundColor: problemTypes[problem] }}
                />
                <span className="text-sm font-medium text-gray-700">{problem}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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

export default AdminSubmissionView