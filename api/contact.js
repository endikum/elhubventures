const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Load environment variables for local testing (Vercel automatically sets them in prod)
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: parseInt(process.env.SMTP_PORT || '465', 10) === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const submissionStore = new Map();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX_REQUESTS = 5;

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const clientIpHeader = req.headers['x-forwarded-for'];
        const clientIp = (Array.isArray(clientIpHeader) ? clientIpHeader[0] : clientIpHeader || req.socket?.remoteAddress || 'unknown')
            .toString()
            .split(',')[0]
            .trim();
        const now = Date.now();
        const recentAttempts = (submissionStore.get(clientIp) || []).filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);

        if (recentAttempts.length >= RATE_LIMIT_MAX_REQUESTS) {
            return res.status(429).json({
                success: false,
                message: 'Too many submissions. Please wait a few minutes and try again.'
            });
        }

        recentAttempts.push(now);
        submissionStore.set(clientIp, recentAttempts);

        const { name, email, service, message, budget, timeline, companyWebsite } = req.body;

        // Hidden honeypot field should remain empty for real users.
        if (companyWebsite) {
            return res.status(200).json({ success: true, message: 'Submission accepted' });
        }

        if (!name || !email || !service || !message || !budget || !timeline) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const serviceLabels = {
            web: 'Web Development',
            mobile: 'Mobile App Development',
            uiux: 'UI/UX Design',
            strategy: 'Digital Strategy',
            cloud: 'Cloud & DevOps',
            seo: 'Search Engine Optimization',
            other: 'Other'
        };

        const budgetLabels = {
            'under-5k': 'Under $5,000',
            '5k-15k': '$5,000 - $15,000',
            '15k-40k': '$15,000 - $40,000',
            '40k-plus': '$40,000+'
        };

        const timelineLabels = {
            asap: 'ASAP',
            '1-2-months': '1-2 months',
            '3-6-months': '3-6 months',
            flexible: 'Flexible timeline'
        };

        const serviceText = serviceLabels[service] || service;
        const budgetText = budgetLabels[budget] || budget;
        const timelineText = timelineLabels[timeline] || timeline;

        const templatesDir = path.join(process.cwd(), 'email-templates');
        
        let adminTemplate = fs.readFileSync(path.join(templatesDir, 'admin-notification.html'), 'utf-8');
        let userTemplate = fs.readFileSync(path.join(templatesDir, 'user-autoresponder.html'), 'utf-8');

        // Prepare variables
        const firstName = name.split(' ')[0] || name;
        const messagePreview = message.length > 100 ? message.substring(0, 100) + '...' : message;

        // Replace placeholders safely by using a simple Regex wrapper
        adminTemplate = adminTemplate
            .replace(/{{name}}/g, name)
            .replace(/{{email}}/g, email)
            .replace(/{{service}}/g, serviceText)
            .replace(/{{budget}}/g, budgetText)
            .replace(/{{timeline}}/g, timelineText)
            .replace(/{{message}}/g, message);

        userTemplate = userTemplate
            .replace(/{{firstName}}/g, firstName)
            .replace(/{{service}}/g, serviceText)
            .replace(/{{budget}}/g, budgetText)
            .replace(/{{timeline}}/g, timelineText)
            .replace(/{{messagePreview}}/g, messagePreview);

        const adminEmail = process.env.CONTACT_EMAIL || process.env.SMTP_USER;

        // 1) Send Admin Notification
        await transporter.sendMail({
            from: `"EL-HUB VENTURES System" <${process.env.SMTP_USER}>`,
            to: adminEmail,
            bcc: adminEmail,
            subject: `New Lead: ${name} - ${serviceText}`,
            html: adminTemplate,
            replyTo: email
        });

        // 2) Send User Autoresponder
        await transporter.sendMail({
            from: `"EL-HUB VENTURES" <${process.env.SMTP_USER}>`,
            to: email,
            bcc: adminEmail,
            subject: `Request Received - EL-HUB VENTURES`,
            html: userTemplate
        });

        return res.status(200).json({ success: true, message: 'Emails sent successfully' });

    } catch (error) {
        console.error('Error sending email:', error);
        if (error && error.code === 'EAUTH') {
            return res.status(502).json({
                success: false,
                message: 'SMTP authentication failed. Please verify SMTP_USER and SMTP_PASS in .env.'
            });
        }

        return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
};
