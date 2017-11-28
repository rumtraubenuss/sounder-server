const mongoClient = require('mongodb').MongoClient;
const { DB_URI } = process.env;

let db;

mongoClient.connect(DB_URI, (err, _db) => {
  if(err) {
    console.log('Error connecting to DB');
  } else {
    db = _db;
    console.log('DB connected');
  }
});

exports.add = (sound) => {
  return new Promise((resolve, reject) => {
    const now = new Date();
    sound.date = now;
    db.collection('sounds').insert(sound, (err, res) => {
      if(err) {
        return reject(err);
      } else {
        console.log('Saved to db', sound);
        return resolve();
      }
    });
  });
}
