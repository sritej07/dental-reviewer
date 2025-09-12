import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Upload, 
  User, 
  Mail, 
  FileText, 
  AlertCircle, 
  CheckCircle,
  Camera,
  X
} from 'lucide-react';

const PatientSubmissionForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    patientName: user?.name || '',
    patientEmail: user?.email || '',
    note: ''
  });
  
  const [images, setImages] = useState({
    upperTeethImage: null,
    frontTeethImage: null,
    lowerTeethImage: null
  });
  
  const [imagePreviews, setImagePreviews] = useState({
    upperTeethImage: null,
    frontTeethImage: null,
    lowerTeethImage: null
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const imageLabels = {
    upperTeethImage: 'Upper Teeth',
    frontTeethImage: 'Front Teeth', 
    lowerTeethImage: 'Lower Teeth'
  };

  const imageInstructions = {
    upperTeethImage: 'Take a photo looking down at your upper teeth',
    frontTeethImage: 'Take a photo showing your front teeth when smiling',
    lowerTeethImage: 'Take a photo looking up at your lower teeth'
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (imageType, file) => {
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size should be less than 10MB');
        return;
      }

      setImages(prev => ({
        ...prev,
        [imageType]: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => ({
          ...prev,
          [imageType]: e.target.result
        }));
      };
      reader.readAsDataURL(file);
      
      // Clear any previous errors
      setError('');
    }
  };

  const removeImage = (imageType) => {
    setImages(prev => ({
      ...prev,
      [imageType]: null
    }));
    setImagePreviews(prev => ({
      ...prev,
      [imageType]: null
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.patientName.trim()) {
      setError('Patient name is required');
      return;
    }
    
    if (!formData.patientEmail.trim()) {
      setError('Email address is required');
      return;
    }
    
    if (!images.upperTeethImage || !images.frontTeethImage || !images.lowerTeethImage) {
      setError('All three images are required (Upper Teeth, Front Teeth, and Lower Teeth)');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const submitFormData = new FormData();
      submitFormData.append('patientName', formData.patientName);
      submitFormData.append('patientEmail', formData.patientEmail);
      submitFormData.append('note', formData.note);
      submitFormData.append('upperTeethImage', images.upperTeethImage);
      submitFormData.append('frontTeethImage', images.frontTeethImage);
      submitFormData.append('lowerTeethImage', images.lowerTeethImage);

      const response = await axios.post('/api/submissions', submitFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Submission created successfully! You will be notified when the analysis is complete.');
      
      // Reset form
      setFormData({
        patientName: user?.name || '',
        patientEmail: user?.email || '',
        note: ''
      });
      setImages({
        upperTeethImage: null,
        frontTeethImage: null,
        lowerTeethImage: null
      });
      setImagePreviews({
        upperTeethImage: null,
        frontTeethImage: null,
        lowerTeethImage: null
      });

      // Redirect to  after a delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Submission error:', error);
      setError(error.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const allImagesUploaded = images.upperTeethImage && images.frontTeethImage && images.lowerTeethImage;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit Oral Health Images</h2>
        
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

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Patient Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="form-label flex items-center gap-2">
                <User size={18} />
                Patient Name *
              </label>
              <input
                type="text"
                name="patientName"
                value={formData.patientName}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label flex items-center gap-2">
                <Mail size={18} />
                Email Address *
              </label>
              <input
                type="email"
                name="patientEmail"
                value={formData.patientEmail}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter email address"
                required
              />
            </div>
          </div>

          {/* Additional Notes */}
          <div className="form-group">
            <label className="form-label flex items-center gap-2">
              <FileText size={18} />
              Additional Notes (Optional)
            </label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleInputChange}
              className="form-textarea"
              rows={4}
              placeholder="Any specific concerns or symptoms you'd like to mention..."
            />
          </div>

          {/* Image Upload Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <Camera size={20} />
              Image Upload Instructions
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-800">
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Upper Teeth</h4>
                <p>Take a photo looking down at your upper teeth. Open your mouth wide and tilt your head back slightly.</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Front Teeth</h4>
                <p>Take a photo showing your front teeth when smiling. Keep your lips apart to show both upper and lower front teeth.</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Lower Teeth</h4>
                <p>Take a photo looking up at your lower teeth. Pull your lower lip down gently to get a clear view.</p>
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Upload Images *</h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              {Object.keys(images).map((imageType) => (
                <div key={imageType} className="space-y-4">
                  <h4 className="font-medium text-gray-900">{imageLabels[imageType]}</h4>
                  <p className="text-sm text-gray-600">{imageInstructions[imageType]}</p>
                  
                  {!imagePreviews[imageType] ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(imageType, e.target.files[0])}
                        className="hidden"
                        id={`${imageType}-upload`}
                      />
                      <label htmlFor={`${imageType}-upload`} className="cursor-pointer">
                        <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600 font-medium">Click to upload</p>
                        <p className="text-gray-500 text-sm mt-1">PNG, JPG up to 10MB</p>
                      </label>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={imagePreviews[imageType]}
                        alt={imageLabels[imageType]}
                        className="w-full h-48 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(imageType)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                        {imageLabels[imageType]}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Upload Progress</span>
              <span className="text-sm text-gray-600">
                {Object.values(images).filter(Boolean).length} / 3 images
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(Object.values(images).filter(Boolean).length / 3) * 100}%` 
                }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={loading || !allImagesUploaded}
              className="btn-primary"
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Submit for Review
                </>
              )}
            </button>
          </div>
        </form>

        {/* Requirements Notice */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-800 mb-1">Important Notes:</h4>
              <ul className="text-yellow-700 text-sm space-y-1">
                <li>• All three images are required for a complete analysis</li>
                <li>• Ensure images are clear and well-lit</li>
                <li>• Avoid blurry or dark photos</li>
                <li>• You will receive an email notification when the analysis is complete</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientSubmissionForm;