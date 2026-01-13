const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'grow.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

db.serialize(() => {
    // Users table (simplified for local/single user context or Telegram ID)
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        telegram_id TEXT UNIQUE,
        username TEXT,
        preferences TEXT
    )`);

    // Grows/Locations
    db.run(`CREATE TABLE IF NOT EXISTS grows (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT,
        type TEXT,
        dimensions TEXT,
        start_date TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Plants
    db.run(`CREATE TABLE IF NOT EXISTS plants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        grow_id INTEGER,
        name TEXT,
        strain TEXT,
        stage TEXT, -- seedling, veg, flower, drying, cured
        planted_date TEXT,
        harvest_date TEXT,
        position_x INTEGER, -- For visual constructor
        position_y INTEGER, -- For visual constructor
        FOREIGN KEY(grow_id) REFERENCES grows(id)
    )`);

    // Logs (Watering, Feeding, Notes)
    db.run(`CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plant_id INTEGER,
        grow_id INTEGER,
        activity_type TEXT, -- water, feed, note, photo
        description TEXT,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(plant_id) REFERENCES plants(id),
        FOREIGN KEY(grow_id) REFERENCES grows(id)
    )`);

    // SEEDING: Ensure 2 Fixed Boxes exist (4x2)
    db.get("SELECT count(*) as count FROM grows", (err, row) => {
        if (err) console.error(err);
        else if (row.count === 0) {
            console.log("Seeding Database with 2 Fixed Boxes...");
            const stmt = db.prepare("INSERT INTO grows (name, width, length) VALUES (?, ?, ?)");
            stmt.run("Бокс 1", 4, 2);
            stmt.run("Бокс 2", 4, 2);
            stmt.finalize();
            console.log("Seeding Complete.");
        }
    });
});

module.exports = db;
