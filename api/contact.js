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

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { name, email, service, message, budget, timeline } = req.body;

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
            subject: `New Lead: ${name} - ${serviceText}`,
            html: adminTemplate,
            replyTo: email
        });

        // 2) Send User Autoresponder
        await transporter.sendMail({
            from: `"EL-HUB VENTURES" <${process.env.SMTP_USER}>`,
            to: email,
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
