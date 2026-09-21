import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';
import { join } from 'path';

// Manually load .env.local
const envPath = join(process.cwd(), '.env.local');
try {
  const envFile = readFileSync(envPath, 'utf-8');
  envFile.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
} catch (error) {
  console.warn('Could not load .env.local file');
}

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI is not set in .env.local');
  console.log('\nPlease add the following to your .env.local file:');
  console.log('MONGODB_URI=mongodb://localhost:27017/agriconnect');
  console.log('\nOr if using MongoDB Atlas:');
  console.log('MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/agriconnect');
  process.exit(1);
}

// Product data templates
const productTemplates = {
  Vegetables: [
    { name: 'Fresh Tomatoes', description: 'Juicy red tomatoes, perfect for salads and cooking. Grown organically without pesticides.' },
    { name: 'Green Bell Peppers', description: 'Crisp and fresh bell peppers, rich in vitamins. Great for stir-fries and salads.' },
    { name: 'Carrots', description: 'Sweet and crunchy carrots, freshly harvested. Perfect for soups and snacks.' },
    { name: 'Spinach', description: 'Dark green leafy spinach, packed with iron and nutrients. Ideal for healthy meals.' },
    { name: 'Cabbage', description: 'Fresh cabbage heads, crispy and delicious. Great for coleslaw and stir-fries.' },
    { name: 'Onions', description: 'Premium quality onions, perfect for all cooking needs. Long shelf life guaranteed.' },
    { name: 'Lettuce', description: 'Crispy lettuce leaves, perfect for fresh salads. Hydroponically grown.' },
    { name: 'Cucumbers', description: 'Fresh and crunchy cucumbers, great for salads and pickles. Organically grown.' },
    { name: 'Green Beans', description: 'Tender green beans, freshly picked. Rich in fiber and vitamins.' },
    { name: 'Broccoli', description: 'Fresh broccoli florets, nutrient-dense superfood. Perfect for steaming.' },
    { name: 'Cauliflower', description: 'White cauliflower heads, versatile and nutritious. Great for various dishes.' },
    { name: 'Eggplant', description: 'Fresh eggplants, perfect for grilling and stir-fries. Rich purple color.' },
  ],
  Fruits: [
    { name: 'Ripe Bananas', description: 'Sweet and ripe bananas, rich in potassium. Perfect for smoothies and snacks.' },
    { name: 'Fresh Oranges', description: 'Juicy oranges packed with vitamin C. Sweet and refreshing citrus fruit.' },
    { name: 'Red Apples', description: 'Crisp and sweet red apples. Perfect for eating fresh or baking.' },
    { name: 'Watermelon', description: 'Sweet and juicy watermelon, perfect for hot days. Refreshing summer fruit.' },
    { name: 'Pineapples', description: 'Fresh tropical pineapples, sweet and tangy. Rich in vitamins and enzymes.' },
    { name: 'Mangoes', description: 'Sweet and juicy mangoes, the king of fruits. Perfectly ripened and delicious.' },
    { name: 'Papaya', description: 'Fresh papaya fruit, rich in papain enzyme. Great for digestion and health.' },
    { name: 'Avocados', description: 'Creamy avocados, rich in healthy fats. Perfect for salads and toast.' },
    { name: 'Strawberries', description: 'Sweet and fresh strawberries. Perfect for desserts and smoothies.' },
    { name: 'Grapes', description: 'Seedless grapes, sweet and juicy. Great for snacking and fruit salads.' },
    { name: 'Coconuts', description: 'Fresh coconuts with sweet water. Rich in healthy fats and minerals.' },
    { name: 'Guava', description: 'Tropical guava fruits, vitamin C rich. Sweet and aromatic flavor.' },
  ],
  Grains: [
    { name: 'White Rice', description: 'Premium quality white rice, polished and clean. Perfect for all meals.' },
    { name: 'Brown Rice', description: 'Healthy brown rice, rich in fiber. Nutritious whole grain option.' },
    { name: 'Local Rice', description: 'Locally grown rice, supporting Nigerian farmers. Excellent quality and taste.' },
    { name: 'Corn (Maize)', description: 'Yellow corn kernels, fresh and sweet. Great for cooking and snacks.' },
    { name: 'Millet', description: 'Nutritious millet grains, gluten-free and healthy. Traditional Nigerian grain.' },
    { name: 'Sorghum', description: 'Quality sorghum grains, versatile and nutritious. Perfect for traditional meals.' },
    { name: 'Wheat Grains', description: 'Premium wheat grains for grinding. High protein content and quality.' },
    { name: 'Oats', description: 'Whole grain oats, heart-healthy breakfast option. Rich in fiber.' },
    { name: 'Barley', description: 'Pearl barley grains, nutritious and filling. Great for soups and stews.' },
  ],
  Tubers: [
    { name: 'Yam Tubers', description: 'Fresh yam tubers, premium quality. Perfect for pounding and frying.' },
    { name: 'Sweet Potatoes', description: 'Orange-fleshed sweet potatoes, naturally sweet. Rich in vitamins.' },
    { name: 'Irish Potatoes', description: 'Quality Irish potatoes, great for fries and cooking. Versatile tuber.' },
    { name: 'Cassava', description: 'Fresh cassava tubers, perfect for garri and fufu. Staple Nigerian food.' },
    { name: 'Cocoyam', description: 'Fresh cocoyam tubers, nutritious and delicious. Great for traditional soups.' },
    { name: 'Water Yam', description: 'Premium water yam, soft texture. Perfect for pounding and traditional dishes.' },
  ],
  Legumes: [
    { name: 'Red Beans', description: 'Quality red beans, protein-rich legumes. Perfect for bean cakes and stews.' },
    { name: 'Black-Eyed Peas', description: 'Fresh black-eyed peas, versatile and nutritious. Great for moi moi.' },
    { name: 'Groundnuts', description: 'Roasted groundnuts (peanuts), crunchy and delicious. Rich in protein.' },
    { name: 'Soybeans', description: 'Organic soybeans, protein-packed legumes. Perfect for soy milk and oil.' },
    { name: 'Green Peas', description: 'Fresh green peas, sweet and tender. Rich in vitamins and fiber.' },
    { name: 'Lentils', description: 'Red and brown lentils, quick cooking legumes. High in protein and iron.' },
    { name: 'Chickpeas', description: 'Premium chickpeas, versatile legumes. Great for hummus and curries.' },
  ],
  Spices: [
    { name: 'Fresh Ginger', description: 'Organic fresh ginger root, aromatic and spicy. Great for teas and cooking.' },
    { name: 'Garlic Bulbs', description: 'Premium garlic bulbs, pungent and flavorful. Essential cooking ingredient.' },
    { name: 'Fresh Pepper', description: 'Hot fresh peppers (scotch bonnet), very spicy. Perfect for Nigerian dishes.' },
    { name: 'Curry Leaves', description: 'Fresh curry leaves, aromatic herbs. Essential for Indian and African cooking.' },
    { name: 'Scent Leaves', description: 'Fresh scent leaves (basil), aromatic and flavorful. Traditional Nigerian herb.' },
    { name: 'Turmeric Root', description: 'Fresh turmeric root, anti-inflammatory superfood. Great for health and cooking.' },
    { name: 'Bay Leaves', description: 'Dried bay leaves, aromatic spice. Essential for soups and stews.' },
  ],
};

// Nigerian locations
const locations = [
  'Ikeja, Lagos', 'Victoria Island, Lagos', 'Lekki, Lagos', 'Surulere, Lagos',
  'Ibadan, Oyo', 'Abeokuta, Ogun', 'Ilorin, Kwara', 'Enugu, Enugu',
  'Abuja, FCT', 'Kaduna, Kaduna', 'Kano, Kano', 'Port Harcourt, Rivers',
  'Benin City, Edo', 'Aba, Abia', 'Jos, Plateau', 'Calabar, Cross River',
];

// Product images - Real farm produce images from Pexels
const productImages = {
  Vegetables: [
    'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1438672/pexels-photo-1438672.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1268101/pexels-photo-1268101.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  Fruits: [
    'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1414110/pexels-photo-1414110.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1263348/pexels-photo-1263348.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1128678/pexels-photo-1128678.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  Grains: [
    'https://images.pexels.com/photos/1393382/pexels-photo-1393382.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2589457/pexels-photo-2589457.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2611817/pexels-photo-2611817.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/327098/pexels-photo-327098.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  Tubers: [
    'https://images.pexels.com/photos/144248/potatoes-vegetables-erdfrucht-bio-144248.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/89247/banana-sweet-potatoes-vegetables-coloring-89247.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2286776/pexels-photo-2286776.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  Legumes: [
    'https://images.pexels.com/photos/1537169/pexels-photo-1537169.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/4022094/pexels-photo-4022094.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  Spices: [
    'https://images.pexels.com/photos/357743/pexels-photo-357743.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/4022092/pexels-photo-4022092.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/161556/spices-salt-pepper-seasoning-161556.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
};

// Generate random price based on category
function generatePrice(category: string): number {
  const priceRanges: Record<string, [number, number]> = {
    Vegetables: [500, 5000],
    Fruits: [1000, 8000],
    Grains: [2000, 15000],
    Tubers: [1500, 10000],
    Legumes: [1000, 8000],
    Spices: [500, 5000],
  };
  const [min, max] = priceRanges[category] || [500, 5000];
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Generate random stock
function generateStock(): number {
  return Math.floor(Math.random() * 500) + 10;
}

// Unit based on category
function getUnit(category: string): 'kg' | 'g' | 'liters' | 'ml' | 'pieces' | 'bunches' | 'bags' {
  const units: Record<string, ('kg' | 'g' | 'liters' | 'ml' | 'pieces' | 'bunches' | 'bags')[]> = {
    Vegetables: ['kg', 'bunches', 'pieces'],
    Fruits: ['kg', 'pieces', 'bunches'],
    Grains: ['kg', 'bags'],
    Tubers: ['kg', 'pieces'],
    Legumes: ['kg', 'bags'],
    Spices: ['kg', 'g'],
  };
  const categoryUnits = units[category] || ['kg'];
  return categoryUnits[Math.floor(Math.random() * categoryUnits.length)];
}

async function seedDatabase() {
  try {
    console.log('Starting database seeding...\n');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Import models (after connection)
    const User = (await import('../models/User')).default;
    const Product = (await import('../models/Product')).default;

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data\n');

    // Create dummy users
    console.log('Creating dummy users...');
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    
    // Create Super Admin first
    const superAdmin = await User.create({
      name: 'Hillary Prosper Wahua',
      email: 'hillaryprosperwahua@gmail.com',
      password: hashedPassword,
      phone: '08012345678',
      role: 'ADMIN',
      isActive: true,
      isVerified: true,
      location: {
        state: 'FCT',
        lga: 'Abuja',
        address: 'Abuja, Nigeria'
      },
    });
    console.log('Created Super Admin account: hillaryprosperwahua@gmail.com\n');
    
    const users = [superAdmin]; // Start with super admin
    for (let i = 1; i <= 15; i++) {
      const locationParts = locations[Math.floor(Math.random() * locations.length)].split(', ');
      const user = await User.create({
        name: `Farmer ${i}`,
        email: `farmer${i}@agriconnect.com`,
        password: hashedPassword,
        phone: `080${Math.floor(10000000 + Math.random() * 90000000)}`,
        role: 'USER',
        isActive: true,
        isVerified: true,
        location: {
          state: locationParts[1] || 'Lagos',
          lga: locationParts[0] || 'Ikeja',
          address: locations[Math.floor(Math.random() * locations.length)]
        },
      });
      users.push(user);
    }
    console.log(`Created ${users.length} total users (1 admin + 15 farmers)\n`);

    // Select one dummy user to post 4 products (Farmer 1, not admin)
    const mainSeller = users[1]; // users[0] is admin, users[1] is Farmer 1
    console.log(`Main seller: ${mainSeller.name} (${mainSeller.email})\n`);

    // Generate 50 products
    console.log('Creating 50 products...');
    const products = [];
    let productCount = 0;

    for (const [category, items] of Object.entries(productTemplates)) {
      for (const item of items) {
        if (productCount >= 50) break;

        // First 4 products belong to main seller (Farmer 1), rest distributed randomly
        const seller = productCount < 4 
          ? mainSeller 
          : users[Math.floor(Math.random() * (users.length - 1)) + 1]; // Exclude admin (users[0])

        const isOrganic = Math.random() > 0.6;
        const images = productImages[category as keyof typeof productImages] || productImages.Vegetables;

        const product = await Product.create({
          name: item.name,
          description: item.description,
          category,
          price: generatePrice(category),
          unit: getUnit(category),
          stock: generateStock(),
          minOrder: Math.floor(Math.random() * 5) + 1,
          location: locations[Math.floor(Math.random() * locations.length)],
          isOrganic,
          seller: seller._id,
          images: [
            images[Math.floor(Math.random() * images.length)],
            images[Math.floor(Math.random() * images.length)],
          ],
          averageRating: Math.random() * 2 + 3, // 3-5 rating
          reviewCount: Math.floor(Math.random() * 50),
          views: Math.floor(Math.random() * 500),
          isActive: true,
        });

        products.push(product);
        productCount++;

        if (productCount <= 4) {
          console.log(`  Product ${productCount}/4 for ${mainSeller.name}: ${product.name}`);
        }
      }
      if (productCount >= 50) break;
    }

    console.log(`\nCreated ${products.length} products\n`);

    // Summary
    console.log('Seeding Summary:');
    console.log('==================');
    console.log(`Total Users: ${users.length}`);
    console.log(`Total Products: ${products.length}`);
    console.log(`Main Seller: ${mainSeller.name} (${mainSeller.email})`);
    console.log(`Main Seller Products: 4`);
    console.log('\nLogin Credentials:');
    console.log('====================');
    console.log('Super Admin: hillaryprosperwahua@gmail.com');
    console.log('Farmers: farmer1@agriconnect.com to farmer15@agriconnect.com');
    console.log('Password (all): Password123!');
    console.log('\nDatabase seeding completed successfully!\n');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seeder
seedDatabase();
