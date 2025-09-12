const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: true,
    trim: true
  },
  patientEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  note: {
    type: String,
    trim: true
  },
  // Updated image structure for 3 images
  images: {
    upperTeeth: {
      originalImageUrl: { type: String, required: true },
      originalImagePublicId: { type: String, required: true },
      annotatedImageUrl: { type: String },
      annotatedImagePublicId: { type: String },
      annotations: { type: mongoose.Schema.Types.Mixed, default: [] }
    },
    frontTeeth: {
      originalImageUrl: { type: String, required: true },
      originalImagePublicId: { type: String, required: true },
      annotatedImageUrl: { type: String },
      annotatedImagePublicId: { type: String },
      annotations: { type: mongoose.Schema.Types.Mixed, default: [] }
    },
    lowerTeeth: {
      originalImageUrl: { type: String, required: true },
      originalImagePublicId: { type: String, required: true },
      annotatedImageUrl: { type: String },
      annotatedImagePublicId: { type: String },
      annotations: { type: mongoose.Schema.Types.Mixed, default: [] }
    }
  },
  reportUrl: {
    type: String
  },
  reportPublicId: {
    type: String
  },
  // Updated treatment recommendations structure
  treatmentRecommendations: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    enum: ['uploaded', 'annotated', 'reported'],
    default: 'uploaded'
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  reportGeneratedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Submission', submissionSchema);