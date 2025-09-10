const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const Submission = require('../models/Submission');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'oral-health-submissions',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }]
  }
});

const upload = multer({ storage: storage });

// Create new submission
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { patientName, patientEmail, note } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const submission = new Submission({
      patientName,
      patientEmail,
      note,
      originalImageUrl: req.file.path,
      originalImagePublicId: req.file.filename,
      submittedBy: req.user?._id
    });

    await submission.save();

    res.status(201).json({
      message: 'Submission created successfully',
      submission
    });
  } catch (error) {
    console.error('Submission creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's submissions (patients can only see their own)
router.get('/my-submissions', auth, async (req, res) => {
  try {
    let filter = {};
    
    if (req.user.role === 'patient') {
      filter = { 
        $or: [
          { submittedBy: req.user._id },
          { patientEmail: req.user.email }
        ]
      };
    }

    const submissions = await Submission.find(filter)
      .populate('submittedBy', 'name email')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ submissions });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single submission by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('submittedBy', 'name email')
      .populate('reviewedBy', 'name email');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check permissions
    if (req.user.role === 'patient') {
      const hasAccess = submission.submittedBy?._id.toString() === req.user._id.toString() ||
                       submission.patientEmail === req.user.email;
      
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json({ submission });
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;