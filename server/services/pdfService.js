const PDFDocument = require('pdfkit');
const cloudinary = require('../config/cloudinary');
const https = require('https');
const fs = require('fs');
const path = require('path');

const generatePDFReport = async (submission, treatmentRecommendations) => {
  try {
    // Create PDF document
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    
    // Create buffer to store PDF
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    
    return new Promise((resolve, reject) => {
      doc.on('end', async () => {
        try {
          const pdfBuffer = Buffer.concat(buffers);
          
          // Upload PDF to Cloudinary
          const uploadResult = await new Promise((resolveUpload, rejectUpload) => {
            cloudinary.uploader.upload_stream(
              {
                folder: 'oral-health-reports',
                public_id: `report_${submission._id}_${Date.now()}`,
                resource_type: 'raw',
                format: 'pdf'
              },
              (error, result) => {
                if (error) {
                  rejectUpload(error);
                } else {
                  resolveUpload(result);
                }
              }
            ).end(pdfBuffer);
          });
          
          resolve(uploadResult);
        } catch (error) {
          reject(error);
        }
      });

      // Generate PDF content
      generatePDFContent(doc, submission, treatmentRecommendations);
      doc.end();
    });
  } catch (error) {
    console.error('Generate PDF error:', error);
    throw error;
  }
};

const generatePDFContent = async (doc, submission, treatmentRecommendations) => {
  // Header
  doc.fontSize(24)
     .fillColor('#2563eb')
     .text('ORAL HEALTH SCREENING REPORT', 50, 50, { align: 'center' });

  // Patient Information
  doc.fontSize(16)
     .fillColor('#1f2937')
     .text('Patient Information', 50, 120);

  doc.fontSize(12)
     .fillColor('#374151')
     .text(`Name: ${submission.patientName}`, 50, 150)
     .text(`Email: ${submission.patientEmail}`, 50, 170)
     .text(`Date: ${new Date(submission.submittedAt).toLocaleDateString()}`, 50, 190)
     .text(`Report ID: ${submission._id}`, 50, 210);

  if (submission.note) {
    doc.text(`Patient Notes: ${submission.note}`, 50, 230);
  }

  // Screening Results Section
  doc.fontSize(16)
     .fillColor('#1f2937')
     .text('Screening Results', 50, 270);

  // Add annotated image if available
  if (submission.annotatedImageUrl) {
    try {
      // Download image temporarily
      const imageBuffer = await downloadImage(submission.annotatedImageUrl);
      doc.image(imageBuffer, 50, 300, { width: 250, height: 250 });
    } catch (error) {
      console.error('Error adding image to PDF:', error);
      doc.fontSize(12)
         .fillColor('#ef4444')
         .text('Image could not be loaded', 50, 300);
    }
  }

  // Treatment Recommendations
  doc.fontSize(16)
     .fillColor('#1f2937')
     .text('Treatment Recommendations', 320, 270);

  const recommendations = treatmentRecommendations || 'No specific recommendations provided.';
  doc.fontSize(12)
     .fillColor('#374151')
     .text(recommendations, 320, 300, { width: 220 });

  // Annotations Summary
  if (submission.annotations && submission.annotations.length > 0) {
    doc.fontSize(14)
       .fillColor('#1f2937')
       .text('Findings Summary', 50, 580);

    let yPosition = 600;
    submission.annotations.forEach((annotation, index) => {
      if (yPosition > 750) return; // Avoid overflow
      
      doc.fontSize(10)
         .fillColor('#374151')
         .text(`${index + 1}. ${annotation.type || 'Annotation'}: ${annotation.note || 'Marked area of interest'}`, 50, yPosition);
      yPosition += 15;
    });
  }

  // Footer
  doc.fontSize(10)
     .fillColor('#6b7280')
     .text('This report is generated automatically by the Oral Health Screening System.', 50, 750)
     .text(`Generated on: ${new Date().toLocaleString()}`, 50, 765)
     .text('For questions, please contact your dental professional.', 50, 780);
};

const downloadImage = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      const data = [];
      
      response.on('data', (chunk) => {
        data.push(chunk);
      });
      
      response.on('end', () => {
        const buffer = Buffer.concat(data);
        resolve(buffer);
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
};

module.exports = { generatePDFReport };