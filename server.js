const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const db = new sqlite3.Database('bookings.db');

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Create bookings table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    amount REAL NOT NULL,
    plan TEXT NOT NULL,
    card_last_four TEXT NOT NULL,
    booking_date TEXT NOT NULL,
    status TEXT NOT NULL
)`);

// POST /api/process-payment endpoint
app.post('/api/process-payment', (req, res) => {
    const { name, email, phone, amount, plan, cardNumber } = req.body;

    // Validate input
    if (!name || !email || !phone || !amount || !plan || !cardNumber || cardNumber.length < 4) {
        return res.status(400).json({ success: false, message: 'Invalid input! Please provide all required fields and a valid card number.' });
    }

    const card_last_four = cardNumber.slice(-4);
    const booking_date = new Date().toISOString();
    const status = 'confirmed';

    // Save booking to database
    db.run(`INSERT INTO bookings (name, email, phone, amount, plan, card_last_four, booking_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [name, email, phone, amount, plan, card_last_four, booking_date, status], function (err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error: ' + err.message });
        }

        const bookingId = this.lastID;
        sendConfirmationEmail(name, email, bookingId);

        // Send admin notification email
        sendAdminNotification(name, email, bookingId);

        res.status(201).json({ success: true, message: 'Booking confirmed!', bookingId });
    });
});

function sendConfirmationEmail(name, email, bookingId) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'your-email@gmail.com', // replace with your email
            pass: 'your-email-password' // replace with your password
        }
    });

    const mailOptions = {
        from: 'your-email@gmail.com',
        to: email,
        subject: 'Booking Confirmation',
        text: `Dear ${name},\n\nYour booking has been confirmed! Your booking ID is ${bookingId}.\nThank you for choosing us!`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending confirmation email:', error);
        } else {
            console.log('Confirmation email sent:', info.response);
        }
    });
}

function sendAdminNotification(name, email, bookingId) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'your-email@gmail.com', // replace with your email
            pass: 'your-email-password' // replace with your password
        }
    });

    const mailOptions = {
        from: 'your-email@gmail.com',
        to: 'admin-email@gmail.com', // replace with admin's email
        subject: 'New Booking Notification',
        text: `New booking from ${name}. Booking ID: ${bookingId}. Customer email: ${email}.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending admin notification email:', error);
        } else {
            console.log('Admin notification email sent:', info.response);
        }
    });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
