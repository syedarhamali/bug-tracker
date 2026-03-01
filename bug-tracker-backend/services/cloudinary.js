const cloudinary = require("cloudinary").v2;

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
}

function isConfigured() {
  return !!(cloudName && apiKey && apiSecret);
}

/**
 * Upload a buffer to Cloudinary (image or video).
 * @param {Buffer} buffer - File buffer
 * @param {string} mimeType - e.g. image/png, video/mp4
 * @param {string} [folder] - Optional folder in Cloudinary
 * @returns {Promise<{ url: string, publicId: string }>}
 */
function uploadBuffer(buffer, mimeType, folder) {
  if (!isConfigured()) {
    return Promise.reject(new Error("Cloudinary is not configured"));
  }
  const isVideo = (mimeType || "").toLowerCase().startsWith("video/");
  const resourceType = isVideo ? "video" : "image";
  const options = { resource_type: resourceType };
  if (folder) options.folder = folder;

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve({ url: result.secure_url, publicId: result.public_id });
    });
    stream.end(buffer);
  });
}

module.exports = { isConfigured, uploadBuffer };
