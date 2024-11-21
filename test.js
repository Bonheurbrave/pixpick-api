const nodemailer = require('nodemailer');

// Create reusable transporter object using Gmail's SMTP server
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'bonheurbrave1@gmail.com',  // Your Gmail address
        pass: 'tugende21'          // Your Gmail password (or use app password)
    }
});

// Generate OTP
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
}

// Send email function
function sendOtpEmail(toEmail, otp) {
    const mailOptions = {
        from: 'bonheurbrave1@gmail.com',
        to: toEmail,
        subject: 'Your OTP Code',
        text: `Your OTP code is: ${otp}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}

// Main function to generate OTP and send email
function main() {
    const recipientEmail = 'recipient_email@example.com';  // Recipient's email address
    const otp = generateOtp();
    sendOtpEmail(recipientEmail, otp);
}

main();
