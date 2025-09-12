const PDFDocument = require('pdfkit');
const cloudinary = require('../config/cloudinary');
const https = require('https');

const problemColors = {
  'Inflammed / Red gums': '#A855F7',
  'Malaligned': '#EAB308',
  'Receded gums': '#78716C',
  'Stains': '#EF4444',
  'Attrition': '#22D3EE',
  'Crowns': '#EC4899'
};

const generatePDFReport = async (submission, treatmentRecommendations) => {
  try {
    const doc = new PDFDocument({ size: 'A4', margin: 0, bufferPages: true });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));

    return new Promise((resolve, reject) => {
      doc.on('end', async () => {
        try {
          const pdfBuffer = Buffer.concat(buffers);
          const uploadResult = await new Promise((resolveUpload, rejectUpload) => {
            cloudinary.uploader.upload_stream(
              {
                folder: 'oral-health-reports',
                public_id: `report_${submission._id}_${Date.now()}`,
                resource_type: 'raw',
                format: 'pdf'
              },
              (error, result) => error ? rejectUpload(error) : resolveUpload(result)
            ).end(pdfBuffer);
          });
          resolve(uploadResult);
        } catch (err) {
          reject(err);
        }
      });

      (async () => {
        await generatePDFContent(doc, submission, treatmentRecommendations);
        doc.end();
      })();
    });
  } catch (err) {
    console.error('Generate PDF error:', err);
    throw err;
  }
};

const generatePDFContent = async (doc, submission, treatmentRecommendations) => {
  const pageWidth = doc.page.width;

  // HEADER - Purple background with white text
  doc.rect(0, 0, pageWidth, 120).fill('#A084E8');
  doc.fillColor('white').fontSize(30).font('Helvetica-Bold')
    .text('Oral Health Screening', 0, 25, { align: 'center', width: pageWidth });
  doc.text('Report', 0, 65, { align: 'center', width: pageWidth });

  // PATIENT DETAILS SECTION - White background with border
  const detailsY = 140;
  doc.roundedRect(40, detailsY, pageWidth - 80, 50, 8).fill('#FFFFFF').stroke('#E5E7EB');
  doc.fillColor('#000').font('Helvetica-Bold').fontSize(13);
  doc.text(`Name: ${submission.patientName || 'John'}`, 60, detailsY + 20);
  doc.text(`Email: ${submission.patientEmail || 'patient@gmail.com'}`, 240, detailsY + 20);
  doc.text(`Date: ${new Date().toLocaleDateString('en-GB') || '09.09.25'}`, 450, detailsY + 20);

  // SCREENING REPORT SECTION - Light purple background
  const boxY = detailsY + 80;
  doc.roundedRect(20, boxY, pageWidth - 40, 340, 12).fill('#F3F0FF').stroke('#E0E7FF');
  doc.fillColor('#222').font('Helvetica-Bold').fontSize(16)
    .text('SCREENING REPORT:', 60, boxY + 20);

  // IMAGE SECTION
  const images = [
    { key: 'upperTeeth', label: 'Upper Teeth' },
    { key: 'frontTeeth', label: 'Front Teeth' },
    { key: 'lowerTeeth', label: 'Lower Teeth' }
  ];

  const imageWidth = 160;
  const imageHeight = 140;
  const imageSpacing = 20; // Fixed spacing between images
  const totalImagesWidth = images.length * imageWidth + (images.length - 1) * imageSpacing;
  const startX = (pageWidth - totalImagesWidth) / 2; // Center all images
  let x = startX;
  const y = boxY + 60;

  // Draw images with borders
  for (const img of images) {
    const imgUrl = submission.images?.[img.key]?.annotatedImageUrl ||
                   submission.images?.[img.key]?.originalImageUrl;
    
    // Image border
    doc.roundedRect(x, y, imageWidth, imageHeight, 8).stroke('#D1D5DB').lineWidth(2);
    
    if (imgUrl) {
      try {
        const imgBuffer = await downloadImage(imgUrl);
        doc.image(imgBuffer, x + 4, y + 4, { width: imageWidth - 8, height: imageHeight - 8 });
      } catch {
        doc.fontSize(12).fillColor('#6B7280').font('Helvetica')
          .text('Image not available', x, y + imageHeight / 2 - 6, { width: imageWidth, align: 'center' });
      }
    }
    
    // Image label - coral/red rounded button
    const labelY = y + imageHeight + 15;
    const labelWidth = 90; // Reduced width
    const labelHeight = 22; // Reduced height
    const labelX = x + (imageWidth - labelWidth) / 2;
    doc.roundedRect(labelX, labelY, labelWidth, labelHeight, 11).fill('#EF4444');
    doc.fillColor('white').fontSize(11).font('Helvetica-Bold')
      .text(img.label, labelX, labelY + 5, { width: labelWidth, align: 'center' });
    
    x += imageWidth + imageSpacing;
  }

  // LEGEND SECTION - Color-coded squares with labels
  const legendY = y + imageHeight + 70;
  const legendItems = Object.entries(problemColors);
  const columns = 3;
  const legendItemHeight = 25;
  const columnWidth = (pageWidth - 160) / columns;

  legendItems.forEach(([label, color], idx) => {
    const row = Math.floor(idx / columns);
    const col = idx % columns;
    const lx = 80 + col * columnWidth;
    const ly = legendY + row * legendItemHeight;
    
    // Color square
    doc.rect(lx, ly + 4, 16, 16).fill(color);
    
    // Label text
    doc.fillColor('#222').fontSize(10).font('Helvetica')
      .text(label, lx + 25, ly + 6);
  });

  // TREATMENT RECOMMENDATIONS SECTION
  let recY = boxY + 370;
  doc.fillColor('#1E40AF').fontSize(16).font('Helvetica-Bold')
    .text('TREATMENT RECOMMENDATIONS:', 40, recY);
  recY += 35;

  // Treatment recommendations with colored squares
  Object.entries(treatmentRecommendations).forEach(([problem, recommendation]) => {
    if (!recommendation?.trim()) return;
    
    const color = problemColors[problem] || '#888';
    
    // Color square
    doc.rect(40, recY + 2, 16, 16).fill(color);
    
    // Problem name in bold
    doc.fillColor('#222').font('Helvetica-Bold').fontSize(12)
      .text(`${problem}:`, 65, recY + 4);
    
    // Recommendation text - aligned consistently
    doc.font('Helvetica').text(recommendation, 200, recY + 4, { 
      width: pageWidth - 240 
    });
    
    recY += 30;
  });
};

const downloadImage = (url) =>
  new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const data = [];
      res.on('data', (chunk) => data.push(chunk));
      res.on('end', () => resolve(Buffer.concat(data)));
    }).on('error', reject);
  });

module.exports = { generatePDFReport };