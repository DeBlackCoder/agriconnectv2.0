import { NextRequest } from 'next/server';
import { requireAuth, isErrorResponse } from '@/lib/middleware';
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api-response';

// Environment variable to switch between MongoDB and Cloudinary
const USE_CLOUDINARY = process.env.USE_CLOUDINARY === 'true';

// POST /api/upload/image - Upload single image
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (isErrorResponse(authResult)) return authResult;

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return errorResponse('No file provided', 400);
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return errorResponse('Invalid file type. Only JPEG, PNG, and WebP are allowed', 400);
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return errorResponse('File too large. Maximum size is 5MB', 400);
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64File = `data:${file.type};base64,${buffer.toString('base64')}`;

    if (USE_CLOUDINARY) {
      // Upload to Cloudinary (future enhancement)
      const { uploadToCloudinary } = await import('@/lib/cloudinary');
      const folder = formData.get('folder') as string || 'agriconnect/products';
      const result = await uploadToCloudinary(base64File, folder);

      return successResponse(
        {
          url: result.url,
          publicId: result.publicId,
          storage: 'cloudinary',
        },
        'Image uploaded successfully to Cloudinary'
      );
    } else {
      // Store as base64 in MongoDB (default)
      return successResponse(
        {
          url: base64File,
          publicId: null,
          storage: 'mongodb',
        },
        'Image uploaded successfully'
      );
    }
  } catch (error: any) {
    console.error('Image upload error:', error);
    return serverErrorResponse(error.message || 'Failed to upload image');
  }
}

// DELETE /api/upload/image - Delete image by publicId (only for Cloudinary)
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (isErrorResponse(authResult)) return authResult;

    if (!USE_CLOUDINARY) {
      // For MongoDB storage, images are deleted when product is deleted
      return successResponse(null, 'Image deleted successfully');
    }

    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('publicId');

    if (!publicId) {
      return errorResponse('publicId is required', 400);
    }

    // Delete from Cloudinary
    const { deleteFromCloudinary } = await import('@/lib/cloudinary');
    await deleteFromCloudinary(publicId);

    return successResponse(null, 'Image deleted successfully from Cloudinary');
  } catch (error: any) {
    console.error('Image delete error:', error);
    return serverErrorResponse(error.message || 'Failed to delete image');
  }
}
