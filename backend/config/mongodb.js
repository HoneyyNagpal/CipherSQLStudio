const mongoose = require('mongoose');

const connectMongo = async () => {
  const uri = process.env.MONGO_URI;
  
  console.log('MongoDB URI:', uri ? 'Found' : 'NOT FOUND - check .env file');
  
  if (!uri) {
    console.log('Skipping MongoDB connection - no URI provided');
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
  }
};

module.exports = connectMongo;;
