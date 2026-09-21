import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { requireRole, isErrorResponse } from '@/lib/middleware';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  handleZodError,
  serverErrorResponse,
} from '@/lib/api-response';
import { z } from 'zod';

const createCategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug is required'),
  description: z.string().optional(),
  icon: z.string().optional(),
});

// GET /api/categories - List all categories with product counts
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const categories = await Category.find({ isActive: true })
      .sort({ name: 1 })
      .lean();

    // Get product counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({
          category: category.slug,
          isActive: true,
          stock: { $gt: 0 },
        });

        return {
          ...category,
          productCount,
        };
      })
    );

    return successResponse(categoriesWithCounts);
  } catch (error) {
    console.error('Get categories error:', error);
    return serverErrorResponse('Failed to fetch categories');
  }
}

// POST /api/categories - Create category (Admin only)
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireRole(request, ['ADMIN']);
    if (isErrorResponse(authResult)) return authResult;

    await connectDB();

    const body = await request.json();

    // Validate input
    const validation = createCategorySchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(handleZodError(validation.error));
    }

    const categoryData = validation.data;

    // Check if category already exists
    const existingCategory = await Category.findOne({
      $or: [{ name: categoryData.name }, { slug: categoryData.slug }],
    });

    if (existingCategory) {
      return errorResponse('Category with this name or slug already exists', 400);
    }

    // Create category
    const category = await Category.create({
      ...categoryData,
      isActive: true,
    });

    return successResponse(category, 'Category created successfully', 201);
  } catch (error) {
    console.error('Create category error:', error);
    return serverErrorResponse('Failed to create category');
  }
}
