const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("twasl")); // مجلد الصفحات

// حالة الموقع (مفتوح / مغلق)
let status = "open";

// بوت التلغرام
const TOKEN = "7940357644:AAFH10KCI6_NvXMyXle9-993l5cHo4HVhNk";
const CHAT  = "6019392123";

// مسار إرسال بيانات الطلب
app.post("/pay", async (req, res) => {
    const { name, phone, ref, offer } = req.body;

    const text = `💳 طلب اشتراك جديد
👤 رقم العرض: ${name}
📞 رقم الواتس: ${phone}
🔢 رقم المرجع: ${ref}
🎁 العرض المختار: ${offer}`;

    try {
        await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: CHAT, text })
        });

        res.json({ ok: true });

    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ ok: false, error: error.message });
    }
});

// 🔥 مسار حالة الموقع
app.get("/status", (req, res) => {
    res.json({ status });
});

// 🔥 مسار تغيير الحالة
app.post("/set", (req, res) => {
    const { state } = req.body;

    if (state === "open" || state === "closed") {
        status = state;
        return res.json({ ok: true, status });
    }
    
    res.json({ ok: false, error: "invalid state" });
});

// تشغيل السيرفر
app.listen(3000, () => console.log("Server running on port 3000"));

