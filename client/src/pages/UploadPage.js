import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Upload, Image, X, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

const UploadPage = () => {
  const [formData, setFormData] = useState({
    patientName: '',
    patientEmail: '',
    note: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    if (error) setError('');
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select an image file');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const submitData = new FormData();
      submitData.append('patientName', formData.patientName);
      submitData.append('patientEmail', formData.patientEmail);
      submitData.append('note', formData.note);
      submitData.append('image', selectedFile);

      const response = await axios.post('/api/submissions', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Upload successful! Your submission has been received.');
      
      // Reset form
      setFormData({ patientName: '', patientEmail: '', note: '' });
      removeFile();
      
      // Redirect to dashboard after success
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      const message = error.response?.data?.message || 'Upload failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Upload Dental Photos</h1>
          <p className="text-gray-600 mt-2">
            Share your dental photos for professional screening and analysis
          </p>
        </div>

        {error && (
          <div className="alert alert-error mb-6">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success mb-6">
            <CheckCircle size={20} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="patientName"
              value={formData.patientName}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="patientEmail"
              value={formData.patientEmail}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your email address"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Additional Notes (Optional)</label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              className="form-input form-textarea"
              placeholder="Any specific concerns or information you'd like to share..."
              rows={4}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Dental Photo</label>
            
            {!selectedFile ? (
              <div
                {...getRootProps()}
                className={`dropzone ${isDragActive ? 'active' : ''}`}
              >
                <input {...getInputProps()} />
                <Image size={48} className="text-gray-400 mx-auto mb-4" />
                {isDragActive ? (
                  <p className="text-blue-600 font-medium">Drop the image here...</p>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-900 font-medium mb-2">
                      Drop your dental photo here, or click to select
                    </p>
                    <p className="text-sm text-gray-600">
                      Supports JPG, PNG files up to 10MB
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative border-2 border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{selectedFile.name}</h3>
                    <p className="text-sm text-gray-600">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="mt-2 text-red-600 hover:text-red-700 flex items-center gap-1 text-sm"
                    >
                      <X size={16} />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Tips for Better Results:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Ensure good lighting when taking photos</li>
              <li>• Take clear, focused images of your teeth</li>
              <li>• Include both front and side views if possible</li>
              <li>• Avoid blurry or poorly lit images</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading || !selectedFile}
            className="btn-primary w-full justify-center"
          >
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload size={20} />
                Submit for Review
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadPage;