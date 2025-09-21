const mongoose = require('mongoose');

let dbStatus = 'disconnected';

function mapState(state) {
  switch (state) {
    case 0: return 'disconnected';
    case 1: return 'connected';
    case 2: return 'connecting';
    case 3: return 'disconnecting';
    default: return 'unknown';
  }
}

async function connectMongo(uri) {
  if (!uri) throw new Error('MONGODB_URI is required');
  try {
    dbStatus = 'connecting';
    await mongoose.connect(uri);
    dbStatus = 'connected';
    mongoose.connection.on('disconnected', () => { dbStatus = 'disconnected'; });
    mongoose.connection.on('reconnected', () => { dbStatus = 'connected'; });
    mongoose.connection.on('error', (err) => { console.error('Mongo error:', err); dbStatus = mapState(mongoose.connection.readyState); });
    return mongoose.connection;
  } catch (err) {
    dbStatus = 'error';
    console.error('Failed to connect MongoDB:', err.message);
    throw err;
  }
}

function getDbStatus() {
  return dbStatus;
}

module.exports = { connectMongo, getDbStatus };
