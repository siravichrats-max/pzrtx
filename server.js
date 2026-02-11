const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
    secret: 'secret-key-123',
    resave: false,
    saveUninitialized: true
}));

// --- ตัวแปรเก็บ User (ถ้าปิด Server ข้อมูลจะหายนะ) ---
let users = []; 

// --- ข้อมูลจำลอง 5 สถานการณ์ (ตาม PDF) ---
const mockData = [
    { id: 1, context: 'รถจอดนิ่ง (Parked)', value: 0.98, status: 'Normal', desc: 'แรงโน้มถ่วงโลกปกติ (1.0G)', time: '08:00 น.' },
    { id: 2, context: 'ทางด่วน (Highway)', value: 1.05, status: 'Normal', desc: 'การสั่นสะเทือนเล็กน้อย (Road Noise)', time: '08:30 น.' },
    { id: 3, context: 'ลูกระนาด (Speed Bump)', value: 1.70, status: 'Warning', desc: 'ขึ้นอยู่กับความเร็วและช่วงล่าง', time: '09:15 น.' },
    { id: 4, context: 'ตกหลุมลึก (Pothole)', value: 3.40, status: 'Danger', desc: 'แรงกระแทกช่วงสั้นๆ (Impulse)', time: '10:00 น.' },
    { id: 5, context: 'อุบัติเหตุ/กระแทกแรง', value: 4.80, status: 'Danger', desc: 'การสั่นสะเทือนรุนแรงกว่ารถทั่วไป', time: '10:45 น.' }
];

// --- Routes ---

// 1. หน้า Login
app.get('/', (req, res) => {
    res.render('login', { error: null });
});

// 2. หน้า Register (สร้างใหม่)
app.get('/register', (req, res) => {
    res.render('register', { error: null });
});

// 3. ระบบสมัครสมาชิก (POST)
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    
    // เช็คว่ามีคนใช้ชื่อนี้หรือยัง
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
        return res.render('register', { error: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว' });
    }

    // บันทึก User ใหม่
    users.push({ username, password });
    console.log('New User Registered:', username);
    res.redirect('/'); // สมัครเสร็จดีดกลับไปหน้า Login
});

// 4. ระบบล็อกอิน (POST)
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // ค้นหา User ในระบบ
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        req.session.user = user.username;
        res.redirect('/dashboard');
    } else {
        res.render('login', { error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (อย่าลืมสมัครก่อนนะ)' });
    }
});

// 5. Dashboard
app.get('/dashboard', (req, res) => {
    if (!req.session.user) return res.redirect('/');
    res.render('dashboard', { user: req.session.user, data: mockData });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});