import nodemailer from 'nodemailer';

const SMTP_SERVER_HOST = process.env.EMAIL_HOST;
const SMTP_SERVER_USERNAME = process.env.EMAIL_USER;
const SMTP_SERVER_PASSWORD = process.env.EMAIL_PASS;
const SITE_MAIL_RECIEVER = "rashedul.afl@gmail.com"; // Default receiver or sender alias if needed

const transporter = nodemailer.createTransport({
    service: 'gmail', // Use 'gmail' service correctly with nodemailer
    host: SMTP_SERVER_HOST,
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: SMTP_SERVER_USERNAME,
        pass: SMTP_SERVER_PASSWORD,
    },
});

export async function sendMail({
    to,
    subject,
    body,
}: {
    to: string;
    subject: string;
    body: string;
}) {
    try {
        const isVerified = await transporter.verify();
    } catch (error) {
        console.error('Something went wrong', error);
        return;
    }

    const info = await transporter.sendMail({
        from: SMTP_SERVER_USERNAME,
        to: to,
        subject: subject,
        html: body,
    });

    return info;
}
