import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Upload image to Cloudinary
export async function uploadToCloudinary(
  file: string, // base64 or file path
  folder: string = 'agriconnect/products'
): Promise<{ url: string; publicId: string }> {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: 'auto',
      transformation: [
        { width: 1000, height: 1000, crop: 'limit' }, // Max dimensions
        { quality: 'auto:good' }, // Auto optimize quality
        { fetch_format: 'auto' }, // Auto format (WebP when supported)
      ],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image');
  }
}

// Delete image from Cloudinary
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image');
  }
}

// Delete multiple images from Cloudinary
export async function deleteMultipleFromCloudinary(publicIds: string[]): Promise<void> {
  try {
    await cloudinary.api.delete_resources(publicIds);
  } catch (error) {
    console.error('Cloudinary delete multiple error:', error);
    throw new Error('Failed to delete images');
  }
}

// Get optimized image URL
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
  } = {}
): string {
  const { width = 800, height = 600, crop = 'fill', quality = 'auto' } = options;
  
  return cloudinary.url(publicId, {
    transformation: [
      { width, height, crop },
      { quality },
      { fetch_format: 'auto' },
    ],
  });
}
