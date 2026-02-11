const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path'); // เรียกใช้ตัวช่วยระบุตำแหน่งไฟล์

const app = express();
const port = process.env.PORT || 3000;

// --- ตั้งค่า Path (จุดสำคัญที่ทำให้ Vercel พัง) ---
// ใช้ path.join เพื่อให้ Server หาโฟลเดอร์เจอแน่นอน ไม่ว่าจะรันที่ไหน
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); 
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// --- ข้อมูลจำลอง (Mock Data) ---
let users = [{ username: 'heetad', password: '123' }];
let sensorData = [
    { id: 1, context: 'รถจอดนิ่ง', value: 0.02, status: 'Normal', desc: 'แรงโน้มถ่วงโลกปกติ', time: '10:00' },
    { id: 2, context: 'ถนนเรียบ', value: 0.98, status: 'Normal', desc: 'การสั่นสะเทือนเล็กน้อย', time: '10:02' },
    { id: 3, context: 'ถนนขรุขระ', value: 1.15, status: 'Warning', desc: 'ผิวจราจรไม่เรียบ', time: '10:04' },
    { id: 4, context: 'ลูกระนาด', value: 1.80, status: 'Warning', desc: 'กระแทกช่วงสั้นๆ', time: '10:05' },
    { id: 5, context: 'หลุมลึก/อันตราย', value: 3.40, status: 'Danger', desc: 'กระแทกรุนแรง!', time: '10:06' }
];

// --- Routes ---

// หน้า Login
app.get('/', (req, res) => {
    if (req.session.loggedin) {
        res.redirect('/dashboard');
    } else {
        // โค้ดใหม่ (แก้แล้ว)
res.render('login', { error: null }); // Vercel จะหาไฟล์ login.ejs เจอแล้วตอนนี้
    }
});

// ตรวจสอบ Login
app.post('/auth', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    
    // ตรวจสอบ user (แบบง่าย)
    let user = users.find(u => u.username === username && u.password === password);

    if (user) {
        req.session.loggedin = true;
        req.session.username = username;
        res.redirect('/dashboard');
    } else {
        res.send('Incorrect Username and/or Password!');
    }
});

// หน้า Dashboard
app.get('/dashboard', (req, res) => {
    if (req.session.loggedin) {
        res.render('dashboard', { 
            user: req.session.username,
            data: sensorData
        });
    } else {
        res.send('Please login to view this page!');
    }
});

// API สำหรับรับค่าจาก Arduino (Hardware)
app.post('/api/update', (req, res) => {
    const { id, value, status } = req.body;
    
    // อัปเดตข้อมูลในอาเรย์
    let item = sensorData.find(d => d.id == id);
    if (item) {
        item.value = value;
        item.status = status;
        
        // อัปเดตเวลาปัจจุบัน
        let now = new Date();
        item.time = now.getHours() + ":" + String(now.getMinutes()).padStart(2, '0');
    }
    
    console.log(`Updated ID ${id}: ${value}G (${status})`);
    res.json({ success: true, message: "Data updated" });
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// --- ส่วนสำคัญสำหรับ Vercel ---
// ต้อง Export app ออกไปเพื่อให้ Vercel เอาไปรันได้
module.exports = app;

// สั่งรัน Server (ทำงานเฉพาะตอนรันในคอม local)
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

