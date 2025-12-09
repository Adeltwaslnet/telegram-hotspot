const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("twasl"));

// بيانات البوت
const TOKEN = "ضع_توكن_البوت_هنا";
const CHAT  = "ضع_ChatID_هنا";

// حالة الخدمة (افتراضياً مفتوحة)
let serviceOpen = true;

// إرسال رسالة إلى تليجرام
function sendMessage(text) {
    fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: CHAT, text })
    });
}

// =============================
// 1️⃣ Webhook استقبال أوامر البوت
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
// 2️⃣ صفحة pay.html حسب حالة الخدمة
// =============================
app.get("/pay", (req, res) => {
    if (serviceOpen) {
        res.sendFile(__dirname + "/twasl/pay.html");
    } else {
        res.sendFile(__dirname + "/twasl/closed.html");
    }
});

// =============================
// 3️⃣ استقبال طلب الدفع وإرساله للبوت
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

app.listen(3000, () =>
    console.log("Server running on port 3000")
);
