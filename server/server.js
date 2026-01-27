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

// Request Logging Middleware (Admin Panel)
app.use((req, res, next) => {
    // Log only page loads or relevant API calls
    if (!req.path.includes('.') && !req.path.startsWith('/api/sensors')) {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.get('User-Agent');

        db.run(
            "INSERT INTO access_logs (ip, user_agent, path, method, timestamp) VALUES (?, ?, ?, ?, ?)",
            [ip, userAgent, req.path, req.method, new Date().toISOString()],
            (err) => {
                if (err) console.error("Error logging access:", err);
            }
        );
    }
    next();
});

// Serve static files from React app
app.use(express.static(path.join(__dirname, '../client/dist')));

// Admin Panel Access Route
app.get('/admin-panel.php', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// --- API Endpoints ---

// Get all grows for a user
app.get('/api/grows', (req, res) => {
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

// Update grow details
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

// Add a plant
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
const ensureSchema = () => {
    db.run("ALTER TABLE plants ADD COLUMN substrate TEXT", (err) => { });
    db.run("ALTER TABLE plants ADD COLUMN pot_volume TEXT", (err) => { });
    db.run("ALTER TABLE logs ADD COLUMN title TEXT", (err) => { });
    // Ensure Box 2 exists for dual sensor
    db.get("SELECT count(*) as count FROM grows", (err, row) => {
        if (!err && row && row.count < 2) {
            console.log("Auto-creating Box 2...");
            db.run("INSERT INTO grows (user_id, name, type, dimensions, start_date) VALUES (?, ?, ?, ?, ?)",
                [1, "Box 2", "indoor", "4x2", new Date().toISOString()]);
        }
    });
};
ensureSchema();

// Update plant metadata
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

// Get notes
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

// Get Journal Entries
app.get('/api/journal', (req, res) => {
    db.all("SELECT * FROM logs ORDER BY timestamp DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

// Add Journal Entry
app.post('/api/journal', (req, res) => {
    const { grow_id, title, content, date } = req.body;
    db.run(
        "INSERT INTO logs (grow_id, activity_type, title, description, timestamp) VALUES (?, 'journal', ?, ?, ?)",
        [grow_id, title, content, date || new Date().toISOString()],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
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
    console.log('--- Incoming Sensor Data ---');
    console.log('Body:', JSON.stringify(req.body));

    const { grow_id = 1, temperature, humidity, soil_moisture, soil, temperature2, humidity2, co2, co2_relay } = req.body;
    const finalSoil = soil_moisture || soil || 0;

    console.log(`[Sensor Data] Box 1 - Temp: ${temperature}, Hum: ${humidity}, Soil: ${finalSoil}, CO2: ${co2}ppm`);
    if (temperature2 !== undefined) {
        console.log(`[Sensor Data] Box 2 - Temp: ${temperature2}, Hum: ${humidity2}`);
    }

    const timestamp = new Date().toISOString();

    db.serialize(() => {
        // Insert Box 1 Data
        db.run(
            "INSERT INTO environment_logs (grow_id, temperature, humidity, soil_moisture, co2, co2_relay, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [grow_id, temperature, humidity, finalSoil, co2, co2_relay, timestamp],
            (err) => {
                if (err) console.error("Error saving Box 1 data:", err.message);
            }
        );

        // Insert Box 2 Data (if present)
        if (temperature2 !== undefined || humidity2 !== undefined) {
            db.run(
                "INSERT INTO environment_logs (grow_id, temperature, humidity, soil_moisture, timestamp) VALUES (?, ?, ?, ?, ?)",
                [2, temperature2, humidity2, 0, timestamp],
                (err) => {
                    if (err) console.error("Error saving Box 2 data:", err.message);
                }
            );
        }
    });

    res.json({ success: true });
});

// Get latest sensor data (Single Box Legacy)
app.get('/api/sensors/latest', (req, res) => {
    const growId = req.query.grow_id || 1;
    db.get(
        "SELECT * FROM environment_logs WHERE grow_id = ? ORDER BY timestamp DESC LIMIT 1",
        [growId],
        (err, row) => {
            res.json(row || { temperature: 0, humidity: 0, soil_moisture: 0 });
        }
    );
});

// Get Latest Dashboard Data (All Active Boxes)
app.get('/api/sensors/dashboard', (req, res) => {
    const query = `
        SELECT e.* 
        FROM environment_logs e
        INNER JOIN (
            SELECT grow_id, MAX(timestamp) as max_ts
            FROM environment_logs
            GROUP BY grow_id
        ) latest ON e.grow_id = latest.grow_id AND e.timestamp = latest.max_ts
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

// --- Admin Panel API ---
app.get('/api/admin/logs', (req, res) => {
    db.all("SELECT * FROM access_logs ORDER BY timestamp DESC LIMIT 50", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

app.get('/api/admin/stats', (req, res) => {
    const uptime = process.uptime();
    db.get("SELECT COUNT(*) as count FROM access_logs", (err, row) => {
        const logCount = row ? row.count : 0;
        res.json({ uptime, logCount, serverTime: new Date().toISOString() });
    });
});

// New Version Check
app.get('/api/version', (req, res) => {
    res.json({ version: '1.4.0', build: 'OpenRouter-Integrated', time: new Date().toISOString() });
});

// Sensor History
app.get('/api/sensors/history', (req, res) => {
    const hours = req.query.hours || 24;
    db.all(
        `SELECT grow_id, temperature, humidity, timestamp FROM environment_logs 
         WHERE timestamp > datetime('now', '-' || ? || ' hours') 
         ORDER BY timestamp ASC`,
        [hours],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

// ----------------------------------------------------------------------
// NEW: AI Chat (OpenRouter)
// ----------------------------------------------------------------------
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        return res.json({ reply: "⚠️ API Key не найден. Добавьте переменную OPENROUTER_API_KEY в Render." });
    }

    try {
        // Fetch recent journal entries for context
        const recentLogs = await new Promise((resolve) => {
            db.all("SELECT * FROM logs ORDER BY timestamp DESC LIMIT 5", [], (err, rows) => {
                if (err || !rows) resolve([]);
                else resolve(rows);
            });
        });

        const context = recentLogs.map(l =>
            `- [${new Date(l.timestamp).toLocaleDateString()}] (${l.activity_type}) ${l.title || ''}: ${l.description || ''}`
        ).join('\n');

        const systemPrompt = `Ты — Гроу-Гуру (Grow Guru). Твой стиль: дружелюбный, уличный (бро, ман), но экспертный. Тема: выращивание растений. 
        Вот последние записи из журнала гровера (используй их для контекста, если уместно):
        ${context}
        
        Твоя задача: помогать гроверу советами, анализировать его журнал и отвечать на вопросы.
        Отвечай кратко, полезно, позитивно (используй эмодзи).`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "HTTP-Referer": webAppUrl,
                "X-Title": "Grow App"
            },
            body: JSON.stringify({
                // Using a reliable free model
                model: "google/gemini-2.0-flash-exp:free",
                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    },
                    { role: "user", content: message }
                ],
                stream: false
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("OpenRouter API Error Full:", JSON.stringify(data));
            return res.json({ reply: `Ошибка OpenRouter: ${data.error.message} (Code: ${data.error.code})` });
        }

        const reply = data.choices?.[0]?.message?.content || "OpenRouter молчит... Попробуй позже.";
        res.json({ reply });

    } catch (e) {
        console.error("OpenRouter Network Error:", e);
        res.status(500).json({ error: "Failed to connect to OpenRouter. Check server logs." });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
