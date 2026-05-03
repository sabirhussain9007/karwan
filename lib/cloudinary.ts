import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file buffer to Cloudinary and returns the secure URL
 * @param fileBuffer Buffer
 * @param folderName string
 * @returns Promise<string>
 */
export const uploadToCloudinary = async (fileBuffer: Buffer, folderName: string = 'pak-karwan'): Promise<string> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: folderName },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result?.secure_url as string);
        }
      }
    ).end(fileBuffer);
  });
};

export default cloudinary;
