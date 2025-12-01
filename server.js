const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();

// ✅ تفعيل CORS
app.use(cors());

// ✅ تمكين قراءة JSON من body
app.use(express.json());

// ✅ تمكين ملفات static من مجلد twasl
app.use(express.static("twasl"));

// توكن البوت و chat ID
const TOKEN = "7940357644:AAFH10KCI6_NvXMyXle9-993l5cHo4HVhNk";
const CHAT  = "6019392123";

// مسار استقبال البيانات من صفحة الدفع
app.post("/pay", async (req, res) => {
    const { name, phone, ref } = req.body;

    const text = `💳 طلب اشتراك جديد
👤 رقم العرض:${name}
📞 رقم الواتس: ${phone}
🔢 رقم المرجع / الحوالة: ${ref}`;

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

// تشغيل السيرفر
app.listen(3000, () => console.log("Server running on port 3000"));
