const cloudinary = require('../config/cloudinary');
const sharp = require('sharp');

const saveAnnotatedImage = async (imageDataUrl, submissionId) => {
  try {
    // Remove data:image/png;base64, prefix
    const base64Data = imageDataUrl.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Process image with Sharp for optimization
    const processedBuffer = await sharp(buffer)
      .jpeg({ quality: 90 })
      .toBuffer();

    // Upload to Cloudinary
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'oral-health-annotations',
          public_id: `annotated_${submissionId}_${Date.now()}`,
          resource_type: 'image',
          format: 'jpg'
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(processedBuffer);
    });
  } catch (error) {
    console.error('Save annotated image error:', error);
    throw error;
  }
};

module.exports = { saveAnnotatedImage };