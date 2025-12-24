#!/usr/bin/env node

/**
 * Script to clear MongoDB collections
 * Usage:
 *   node scripts/clearDB.js           # Clear all collections
 *   node scripts/clearDB.js snapshots # Clear only network_snapshots
 *   node scripts/clearDB.js history   # Clear only node_history
 *   node scripts/clearDB.js all       # Clear all collections
 */

require('dotenv').config();

const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('Error: MONGODB_URI environment variable not set');
  console.log('Make sure you have a .env file with MONGODB_URI=your-connection-string');
  process.exit(1);
}

const COLLECTIONS = {
  NETWORK_SNAPSHOTS: 'network_snapshots',
  NODE_HISTORY: 'node_history',
  PODS_SNAPSHOTS: 'pods_snapshots',
};

async function clearCollections(collectionsToClean) {
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('xandeum_pnodes');

    for (const collectionName of collectionsToClean) {
      try {
        // Get count before deletion
        const countBefore = await db.collection(collectionName).countDocuments();

        // Delete all documents
        const result = await db.collection(collectionName).deleteMany({});

        console.log(`✅ ${collectionName}: Deleted ${result.deletedCount} documents (was ${countBefore})`);
      } catch (error) {
        console.error(`❌ ${collectionName}: Error - ${error.message}`);
      }
    }

    console.log('\nDone!');
  } catch (error) {
    console.error('Connection error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0] || 'all';

let collectionsToClean = [];

switch (command.toLowerCase()) {
  case 'snapshots':
  case 'network':
    collectionsToClean = [COLLECTIONS.NETWORK_SNAPSHOTS];
    break;
  case 'history':
  case 'nodes':
    collectionsToClean = [COLLECTIONS.NODE_HISTORY];
    break;
  case 'pods':
    collectionsToClean = [COLLECTIONS.PODS_SNAPSHOTS];
    break;
  case 'all':
  default:
    collectionsToClean = Object.values(COLLECTIONS);
    break;
}

console.log('='.repeat(50));
console.log('MongoDB Data Cleanup Script');
console.log('='.repeat(50));
console.log(`Collections to clear: ${collectionsToClean.join(', ')}`);
console.log('');

clearCollections(collectionsToClean);
