const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// In a real app, you would use a service account key
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

class Database {
  constructor() {
    this.mockData = {
      players: {},
      sessions: {},
      districts: {}
    };
    this.useMock = true; // Kept true for development
  }

  async getPlayer(id) {
    if (this.useMock) return this.mockData.players[id];
    const doc = await admin.firestore().collection('players').doc(id).get();
    return doc.data();
  }

  async savePlayer(playerData) {
    if (this.useMock) {
      this.mockData.players[playerData.id] = playerData;
      return;
    }
    await admin.firestore().collection('players').doc(playerData.id).set(playerData);
  }
}

module.exports = new Database();
