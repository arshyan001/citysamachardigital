const cloudinary = require('cloudinary').v2;
const sharp = require('sharp');
const { Readable } = require('stream');

const isConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  console.warn('⚠️ WARNING: Cloudinary environment variables are not configured. File uploads will fail.');
}

/**
 * Uploads a buffer to Cloudinary.
 * For images, compresses and converts them to webp using sharp first.
 * For videos/PDFs/other files, uploads the buffer directly.
 */
const uploadToCloudinary = async (file, folder = 'general') => {
  if (!isConfigured) {
    throw new Error('Cloudinary is not configured. Please check your .env file.');
  }

  return new Promise(async (resolve, reject) => {
    try {
      let buffer = file.buffer;
      let options = {
        folder: folder,
        resource_type: 'auto',
      };

      const isImage = file.mimetype.startsWith('image/') || 
                      (file.originalname && (file.originalname.toLowerCase().endsWith('.heic') || file.originalname.toLowerCase().endsWith('.heif')));
      const isVideo = file.mimetype.startsWith('video/');

      if (isImage) {
        try {
          // Compress and convert to webp format using sharp
          // setting quality to 85 (visually stunning but well compressed)
          buffer = await sharp(buffer)
            .webp({ quality: 85 })
            .toBuffer();
          options.format = 'webp';
          options.resource_type = 'image';
        } catch (sharpError) {
          console.warn('⚠️ Sharp compression failed, falling back to original upload:', sharpError.message);
          // Fall back to original file buffer upload if sharp decoding fails (e.g. libvips iref security limits)
          options.resource_type = 'image';
          if (file.originalname && file.originalname.toLowerCase().endsWith('.heic')) {
            options.format = 'heic';
          } else if (file.originalname && file.originalname.toLowerCase().endsWith('.heif')) {
            options.format = 'heif';
          }
        }
      } else if (isVideo) {
        options.resource_type = 'video';
      } else if (file.mimetype === 'application/pdf') {
        options.resource_type = 'raw';
      }

      const stream = cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error) return reject(error);

          // Convert .heic/.heif secure_url extensions to .webp so browsers can render them
          if (result && result.secure_url) {
            const url = result.secure_url;
            if (url.toLowerCase().endsWith('.heic') || url.toLowerCase().endsWith('.heif')) {
              const lastDot = url.lastIndexOf('.');
              result.secure_url = url.substring(0, lastDot) + '.webp';
            }
          }

          resolve(result);
        }
      );

      Readable.from(buffer).pipe(stream);
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Extracts public_id and resource_type from a Cloudinary URL and deletes it.
 */
const deleteFromCloudinary = async (url) => {
  if (!isConfigured) {
    console.warn('Cloudinary is not configured. Cannot delete:', url);
    return null;
  }

  if (!url || !url.includes('res.cloudinary.com')) return null;

  try {
    // Parse URL to find the public_id and resource_type
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;

    const typePart = parts[0];
    const typeSegments = typePart.split('/');
    const resourceType = typeSegments[typeSegments.length - 1]; // 'image', 'video', 'raw'

    const pathPart = parts[1];
    let segments = pathPart.split('/');
    if (segments[0].match(/^v\d+$/)) {
      segments.shift(); // Remove version segment
    }

    let publicIdWithExt = segments.join('/');
    let publicId = publicIdWithExt;
    
    if (resourceType !== 'raw') {
      const lastDot = publicIdWithExt.lastIndexOf('.');
      if (lastDot !== -1) {
        publicId = publicIdWithExt.substring(0, lastDot);
      }
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (err) {
    console.error('Error deleting from Cloudinary:', err);
    return null;
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
  isConfigured: () => !!isConfigured
};
