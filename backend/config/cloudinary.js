const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Cloudinary configuration
try {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('Cloudinary configured successfully');
} catch (error) {
  console.error('Cloudinary configuration error:', error);
}

// Storage configuration for resumes
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'internship-tracker/resumes',
    allowed_formats: ['pdf', 'doc', 'docx'],
    public_id: () => `resume_${Date.now()}`,
    resource_type: 'raw'
  }
});

module.exports = {
  cloudinary,
  storage
};
