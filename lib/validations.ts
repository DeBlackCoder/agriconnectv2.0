import { z } from 'zod';

// User validation schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Product validation schemas
export const createProductSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  price: z.number().positive('Price must be positive'),
  unit: z.enum(['kg', 'g', 'liters', 'ml', 'pieces', 'bunches', 'bags']),
  stock: z.number().int().nonnegative('Stock must be non-negative'),
  minOrder: z.number().int().positive('Minimum order must be positive'),
  location: z.string().min(3, 'Location is required'),
  isOrganic: z.boolean().optional(),
  harvestDate: z.string().optional(),
  images: z.array(z.string()).max(5, 'Maximum 5 images allowed'),
});

export const updateProductSchema = createProductSchema.partial();

// Order validation schemas
export const createOrderSchema = z.object({
  items: z.array(
    z.object({
      product: z.string(),
      quantity: z.number().int().positive(),
      price: z.number().positive(),
    })
  ).min(1, 'At least one item is required'),
  deliveryAddress: z.string().min(10, 'Delivery address is required'),
  notes: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'PLACED',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'IN_TRANSIT',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'COMPLETED',
    'CANCELLED',
  ]),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  estimatedDelivery: z.string().optional(),
  notes: z.string().optional(),
});

// Review validation schemas
export const createReviewSchema = z.object({
  product: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10, 'Review must be at least 10 characters'),
  images: z.array(z.string()).optional(),
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().min(10, 'Review must be at least 10 characters').optional(),
});

// Payment validation schemas
export const initializePaymentSchema = z.object({
  orderId: z.string(),
  amount: z.number().positive(),
  email: z.string().email(),
});

// Profile validation schemas
export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  location: z.object({
    state: z.string().optional(),
    lga: z.string().optional(),
    address: z.string().optional(),
  }).optional(),
});

export const updateFarmerProfileSchema = z.object({
  farmName: z.string().min(3).optional(),
  farmLocation: z.string().optional(),
  farmSize: z.number().positive().optional(),
  experience: z.number().int().nonnegative().optional(),
  certifications: z.array(z.string()).optional(),
  bio: z.string().optional(),
});

export const updateBuyerProfileSchema = z.object({
  businessName: z.string().optional(),
  deliveryAddress: z.string().optional(),
  phone: z.string().optional(),
  preferences: z.array(z.string()).optional(),
});

// Filter schemas
export const productFilterSchema = z.object({
  category: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  isOrganic: z.boolean().optional(),
  location: z.string().optional(),
  inStock: z.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['price', 'date', 'popularity', 'rating']).optional().default('date'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(12),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type InitializePaymentInput = z.infer<typeof initializePaymentSchema>;
export type ProductFilterInput = z.infer<typeof productFilterSchema>;
