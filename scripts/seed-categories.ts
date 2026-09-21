import mongoose from 'mongoose';
import connectDB from '../lib/mongodb';
import Category from '../models/Category';

const categories = [
  {
    name: 'Vegetables',
    slug: 'vegetables',
    description: 'Fresh vegetables directly from farms',
    icon: '🥬',
  },
  {
    name: 'Fruits',
    slug: 'fruits',
    description: 'Seasonal fruits picked at peak ripeness',
    icon: '🍎',
  },
  {
    name: 'Grains & Cereals',
    slug: 'grains',
    description: 'High-quality grains and cereals',
    icon: '🌾',
  },
  {
    name: 'Dairy & Eggs',
    slug: 'dairy',
    description: 'Farm-fresh dairy products and eggs',
    icon: '🥛',
  },
  {
    name: 'Herbs & Spices',
    slug: 'herbs',
    description: 'Aromatic herbs and premium spices',
    icon: '🌿',
  },
  {
    name: 'Roots & Tubers',
    slug: 'roots',
    description: 'Fresh root vegetables and tubers',
    icon: '🥔',
  },
  {
    name: 'Legumes & Pulses',
    slug: 'legumes',
    description: 'Nutritious legumes and pulses',
    icon: '🫘',
  },
  {
    name: 'Nuts & Seeds',
    slug: 'nuts',
    description: 'Premium nuts and seeds',
    icon: '🥜',
  },
  {
    name: 'Organic Products',
    slug: 'organic',
    description: 'Certified organic produce',
    icon: '🌱',
  },
  {
    name: 'Livestock Products',
    slug: 'livestock',
    description: 'Quality livestock and related products',
    icon: '🐄',
  },
];

async function seedCategories() {
  try {
    await connectDB();

    console.log('🌱 Seeding categories...');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('✓ Cleared existing categories');

    // Insert new categories
    await Category.insertMany(categories);
    console.log('✓ Inserted categories:', categories.length);

    console.log('✅ Categories seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategories();
