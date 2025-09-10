const express = require('express');
const Submission = require('../models/Submission');
const { auth, requireRole } = require('../middleware/auth');
const { generatePDFReport } = require('../services/pdfService');
const { saveAnnotatedImage } = require('../services/annotationService');

const router = express.Router();

// Get all submissions (admin only)
router.get('/submissions', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const submissions = await Submission.find(filter)
      .populate('submittedBy', 'name email')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Submission.countDocuments(filter);

    res.json({
      submissions,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get admin submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save annotations
router.put('/submissions/:id/annotations', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { annotations, annotatedImageData } = req.body;

    const submission = await Submission.findById(id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Save annotated image to Cloudinary
    let annotatedImageUrl, annotatedImagePublicId;
    if (annotatedImageData) {
      const result = await saveAnnotatedImage(annotatedImageData, id);
      annotatedImageUrl = result.secure_url;
      annotatedImagePublicId = result.public_id;
    }

    // Update submission
    submission.annotations = annotations;
    submission.annotatedImageUrl = annotatedImageUrl || submission.annotatedImageUrl;
    submission.annotatedImagePublicId = annotatedImagePublicId || submission.annotatedImagePublicId;
    submission.status = 'annotated';
    submission.reviewedBy = req.user._id;
    submission.reviewedAt = new Date();

    await submission.save();

    res.json({
      message: 'Annotations saved successfully',
      submission
    });
  } catch (error) {
    console.error('Save annotations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate PDF report
router.post('/submissions/:id/generate-report', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { treatmentRecommendations } = req.body;

    const submission = await Submission.findById(id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    if (submission.status !== 'annotated') {
      return res.status(400).json({ message: 'Submission must be annotated before generating report' });
    }

    // Generate PDF report
    const reportResult = await generatePDFReport(submission, treatmentRecommendations);

    // Update submission
    submission.reportUrl = reportResult.secure_url;
    submission.reportPublicId = reportResult.public_id;
    submission.treatmentRecommendations = treatmentRecommendations;
    submission.status = 'reported';
    submission.reportGeneratedAt = new Date();

    await submission.save();

    res.json({
      message: 'Report generated successfully',
      submission,
      reportUrl: reportResult.secure_url
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get dashboard statistics
router.get('/dashboard/stats', auth, requireRole(['admin']), async (req, res) => {
  try {
    const totalSubmissions = await Submission.countDocuments();
    const uploadedSubmissions = await Submission.countDocuments({ status: 'uploaded' });
    const annotatedSubmissions = await Submission.countDocuments({ status: 'annotated' });
    const reportedSubmissions = await Submission.countDocuments({ status: 'reported' });

    const recentSubmissions = await Submission.find()
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        total: totalSubmissions,
        uploaded: uploadedSubmissions,
        annotated: annotatedSubmissions,
        reported: reportedSubmissions
      },
      recentSubmissions
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;