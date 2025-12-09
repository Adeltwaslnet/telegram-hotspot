const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // السماح بالوصول للملفات الثابتة

// بيانات البوت
const TOKEN = "7940357644:AAFH10KCI6_NvXMyXle9-993l5cHo4HVhNk";
const CHAT  = "6019392123";

// حالة الخدمة (افتراضياً مفتوحة)
let serviceOpen = true;

// إرسال رسالة إلى تليجرام
function sendMessage(text) {
    fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: CHAT, text })
    }).catch(err => console.error("Error sending message:", err));
}

// =============================
// Webhook استقبال أوامر البوت
// =============================
app.post(`/webhook-${TOKEN}`, (req, res) => {
    const msg = req.body.message?.text;
    if (!msg) return res.sendStatus(200);

    if (msg === "فتح" || msg === "/open") {
        serviceOpen = true;
        sendMessage("✅ تم فتح الخدمة");
    }

    if (msg === "اغلاق" || msg === "/close") {
        serviceOpen = false;
        sendMessage("❌ تم إغلاق الخدمة");
    }

    res.sendStatus(200);
});

// =============================
// صفحة pay.html حسب حالة الخدمة
// =============================
app.get("/pay", (req, res) => {
    if (serviceOpen) {
        res.sendFile(path.join(__dirname, "pay.html"));
    } else {
        res.sendFile(path.join(__dirname, "close.html")); // اسم الملف المعدل
    }
});

// =============================
// استقبال طلب الدفع وإرساله للبوت
// =============================
app.post("/pay", async (req, res) => {
    const { name, phone, ref, offer } = req.body;

    const text = `💳 طلب اشتراك جديد
🎁 العرض: ${offer}
👤 رقم العرض: ${name}
📞 رقم الواتس: ${phone}
🔢 رقم المرجع: ${ref}`;

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

// =============================
// endpoint لإرجاع حالة الخدمة (لـ pay.html)
// =============================
app.get("/status", (req, res) => {
    res.json({ status: serviceOpen ? "open" : "closed" });
});

// =============================
// تشغيل السيرفر
// =============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
