const express = require('express');
const cors = require('cors');
const db = require('./database');
const path = require('path');
require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');

const app = express();
const PORT = process.env.PORT || 3000;
const token = process.env.TELEGRAM_BOT_TOKEN;
const webAppUrl = process.env.WEBAPP_URL || 'http://localhost:5173';

// Initialize Bot if token is present
if (token) {
    const bot = new TelegramBot(token, { polling: true });

    bot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, 'Добро пожаловать в Grow Tracker! 🌱', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Открыть приложение', web_app: { url: webAppUrl } }]
                ]
            }
        });
    });
    console.log('Bot initialized');
} else {
    console.log('TELEGRAM_BOT_TOKEN not found, bot disabled');
}

app.use(cors());
app.use(express.json());

// Serve static files from React app (for production simulation)
// In dev, we use Vite proxy
app.use(express.static(path.join(__dirname, '../client/dist')));

// --- API Endpoints ---

// Get all grows for a user
app.get('/api/grows', (req, res) => {
    // Mock user_id 1 for now
    db.all("SELECT * FROM grows WHERE user_id = 1", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

// Create a new grow
app.post('/api/grows', (req, res) => {
    const { name, type, dimensions } = req.body;
    db.run(
        "INSERT INTO grows (user_id, name, type, dimensions, start_date) VALUES (?, ?, ?, ?, ?)",
        [1, name, type, dimensions, new Date().toISOString()],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        }
    );
});

// Update grow details (dimensions, name, etc)
app.put('/api/grows/:id', (req, res) => {
    const { name, type, dimensions } = req.body;
    db.run(
        "UPDATE grows SET name = COALESCE(?, name), type = COALESCE(?, type), dimensions = COALESCE(?, dimensions) WHERE id = ?",
        [name, type, dimensions, req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, changes: this.changes });
        }
    );
});

// Get plants for a specific grow
app.get('/api/plants/:growId', (req, res) => {
    db.all("SELECT * FROM plants WHERE grow_id = ?", [req.params.growId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

// Add a plant (Constructor action)
app.post('/api/plants', (req, res) => {
    const { grow_id, name, strain, stage, x, y } = req.body;
    db.run(
        "INSERT INTO plants (grow_id, name, strain, stage, planted_date, position_x, position_y) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [grow_id, name, strain, stage, new Date().toISOString(), x, y],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        }
    );
});

// --- Database Migration Helper ---
const addColumns = () => {
    db.run("ALTER TABLE plants ADD COLUMN substrate TEXT", (err) => {
        if (!err) console.log("Added 'substrate' column");
    });
    db.run("ALTER TABLE plants ADD COLUMN pot_volume TEXT", (err) => {
        if (!err) console.log("Added 'pot_volume' column");
    });
};
// Try to add columns on startup (ignore error if they exist)
addColumns();

// Update plant metadata (Phase 3 + 5)
app.put('/api/plants/:id', (req, res) => {
    const { name, strain, stage, planted_date, harvest_date, substrate, pot_volume } = req.body;
    db.run(
        `UPDATE plants 
         SET name = COALESCE(?, name), 
             strain = COALESCE(?, strain), 
             stage = COALESCE(?, stage), 
             planted_date = COALESCE(?, planted_date), 
             harvest_date = COALESCE(?, harvest_date),
             substrate = COALESCE(?, substrate),
             pot_volume = COALESCE(?, pot_volume)
         WHERE id = ?`,
        [name, strain, stage, planted_date, harvest_date, substrate, pot_volume, req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});

// Update plant position
app.put('/api/plants/:id/position', (req, res) => {
    const { x, y } = req.body;
    db.run("UPDATE plants SET position_x = ?, position_y = ? WHERE id = ?", [x, y, req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// --- Notes System ---

// --- Notes System ---

// Get notes for a plant
app.get('/api/notes/:plantId', (req, res) => {
    db.all(
        "SELECT * FROM logs WHERE plant_id = ? AND activity_type = 'note' ORDER BY timestamp DESC",
        [req.params.plantId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ data: rows });
        }
    );
});

// Add a note
app.post('/api/notes', (req, res) => {
    const { plant_id, grow_id, content } = req.body;
    db.run(
        "INSERT INTO logs (plant_id, grow_id, activity_type, description) VALUES (?, ?, 'note', ?)",
        [plant_id, grow_id, content],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, timestamp: new Date().toISOString() });
        }
    );
});

// Delete a grow
app.delete('/api/grows/:id', (req, res) => {
    const { id } = req.params;
    db.serialize(() => {
        db.run('DELETE FROM plants WHERE grow_id = ?', id);
        db.run('DELETE FROM grows WHERE id = ?', id, function (err) {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }
            res.json({ message: 'Deleted', changes: this.changes });
        });
    });
});

// --- ESP32 Integration ---

// Receive sensor data
app.post('/api/sensors', (req, res) => {
    // Default grow_id to 1 if not provided (temp hack for single box)
    const { grow_id = 1, temperature, humidity, soil_moisture, soil } = req.body;
    const finalSoil = soil_moisture || soil;

    console.log(`[Sensor Data] Temp: ${temperature}, Hum: ${humidity}, Soil: ${finalSoil}`);

    db.run(
        "INSERT INTO environment_logs (grow_id, temperature, humidity, soil_moisture, timestamp) VALUES (?, ?, ?, ?, ?)",
        [grow_id, temperature, humidity, finalSoil, new Date().toISOString()],
        function (err) {
            if (err) {
                console.error("Error saving sensor data:", err.message);
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true, id: this.lastID });
        }
    );
});

// Get latest sensor data
app.get('/api/sensors/latest', (req, res) => {
    const growId = req.query.grow_id || 1;
    db.get(
        "SELECT * FROM environment_logs WHERE grow_id = ? ORDER BY timestamp DESC LIMIT 1",
        [growId],
        (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(row || { temperature: 0, humidity: 0, soil_moisture: 0 });
        }
    );
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
