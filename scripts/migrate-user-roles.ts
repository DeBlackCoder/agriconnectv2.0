import mongoose from 'mongoose';

// Next.js automatically loads .env.local, no need for dotenv
const MONGODB_URI = process.env.MONGODB_URI || '';

async function migrateUserRoles() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully');

    const db = mongoose.connection.db;
    const usersCollection = db?.collection('users');

    if (!usersCollection) {
      throw new Error('Users collection not found');
    }

    // Update all FARMER and BUYER roles to USER
    const result = await usersCollection.updateMany(
      { role: { $in: ['FARMER', 'BUYER'] } },
      { $set: { role: 'USER' } }
    );

    console.log(`✅ Migration complete!`);
    console.log(`   Updated ${result.modifiedCount} user(s)`);
    console.log(`   Matched ${result.matchedCount} user(s)`);

    // Show current role distribution
    const userCounts = await usersCollection.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]).toArray();

    console.log('\n📊 Current role distribution:');
    userCounts.forEach(({ _id, count }) => {
      console.log(`   ${_id}: ${count}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateUserRoles();
