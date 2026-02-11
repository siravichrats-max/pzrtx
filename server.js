const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();

// --- การตั้งค่า Middleware ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // สำคัญ: เพื่อให้รับค่าจาก Form ได้

// ตั้งค่า Session (แบบพื้นฐาน)
app.use(session({
    secret: 'secret-key-iot',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // ปรับเป็น true ถ้าใช้ https
}));

// --- Routes ---

// 1. หน้า Login (หน้าแรก)
app.get('/', (req, res) => {
    if (req.session.loggedin) {
        return res.redirect('/dashboard');
    }
    // ส่ง error: null ไปด้วยเพื่อป้องกัน ReferenceError ใน EJS
    res.render('login', { error: null });
});

// 2. รับข้อมูล Login (POST)
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // ตรงนี้คือตัวอย่างตรวจสอบ (ไปปรับแก้ตามระบบ Database ของคุณได้เลย)
    if (username === 'admin' && password === '1234') {
        req.session.loggedin = true;
        req.session.username = username;
        res.redirect('/dashboard');
    } else {
        // ถ้าผิด ส่งข้อความ Error กลับไป
        res.render('login', { error: 'Username หรือ Password ไม่ถูกต้อง' });
    }
});

// 3. หน้าสมัครสมาชิก
app.get('/register', (req, res) => {
    res.render('register', { error: null });
});

// 4. หน้า Dashboard (ต้อง Login ก่อนถึงจะเข้าได้)
app.get('/dashboard', (req, res) => {
    if (req.session.loggedin) {
        res.render('dashboard', { user: req.session.username });
    } else {
        res.redirect('/');
    }
});

// 5. Logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// --- ส่วนสำหรับ Vercel ---
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

module.exports = app; // สำคัญมากสำหรับ Vercel
