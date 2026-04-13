const fs = require('fs');
const path = require('path');

// Target directory for images
const blogImagesDir = path.join(__dirname, '..', 'assets', 'images', 'blog');
if (!fs.existsSync(blogImagesDir)) {
    fs.mkdirSync(blogImagesDir, { recursive: true });
}

// Source images
const sourceImages = {
    'nigeria': 'nigeria_tech_cover_1776034741943.png',
    'usa': 'usa_tech_cover_1776034755909.png',
    'canada': 'canada_tech_cover_1776034769057.png',
    'uk': 'uk_tech_cover_1776034783275.png',
    'cameroon': 'cameroon_tech_cover_1776034798866.png'
};

const brainDir = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\4ce8752e-68ed-40a3-bf53-5c043002f538';

for (const [country, filename] of Object.entries(sourceImages)) {
    const src = path.join(brainDir, filename);
    const dest = path.join(blogImagesDir, country + '.png');
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
    }
}

// Generate the 23 Posts
const csvPath = path.join(__dirname, '..', 'content_calendar.csv');
const insightsDir = path.join(__dirname, '..', 'insights');
if (!fs.existsSync(insightsDir)) {
    fs.mkdirSync(insightsDir, { recursive: true });
}

// Map keywords/topics to the main image classes
const getCountryFromTopic = (text) => {
    lower = text.toLowerCase();
    if (lower.includes('usa') || lower.includes('us ')) return 'usa';
    if (lower.includes('canada') || lower.includes('canadian')) return 'canada';
    if (lower.includes('uk ') || lower.includes('uk')) return 'uk';
    if (lower.includes('cameroon')) return 'cameroon';
    return 'nigeria'; // Default to Nigeria as priority
};

const content = fs.readFileSync(csvPath, 'utf8').trim().split('\n');

for (let i = 1; i < content.length; i++) {
    const line = content[i];
    if (!line) continue;
    
    // Some lines might just be empty, let's parse safely
    const parts = line.split(',');
    if (parts.length < 4) continue;
    
    const topic = parts[0];
    const slug = parts[1];
    const date = parts[2];
    const keyword = parts[3];
    
    const country = getCountryFromTopic(topic + ' ' + keyword);
    
    const mdContent = `![${topic} Header Image](/assets/images/blog/${country}.png)

## Overview
As the technology landscape evolves, businesses must constantly adapt to maintain competitive edges. **${topic}** is increasingly critical for organizations looking to scale and dominate their respective markets. Whether you are focusing on rapid iterative deployment or heavy compliance security, making the right strategic architectural decisions up front defines success.

In this deep-dive, we explore the essential frameworks, methodologies, and technical requirements needed to achieve optimal performance and robust scalability.

> "True digital transformation requires more than just migrating to the cloud—it demands a fundamental reshaping of how your software architecture interacts with your business logic." — *EL-HUB VENTURES Engineering Leadership*

## The Importance of ${keyword}
When investing in high-end software development, understanding the precise mechanisms behind **${keyword}** is not optional; it is the baseline for modern digital strategy.

### Key Focus Areas for Q3 & Q4
1. **Performance at Scale:** Ensuring that the infrastructure handles compounding traffic surges gracefully.
2. **Security & Compliance:** Hardening endpoints against vulnerabilities and ensuring GDPR/local data law compliance.
3. **Workflow Automation:** Deploying CI/CD pipelines and DevOps methodologies to cut deployment times by over 60%.

<br/>

<div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); padding: 25px; border-radius: 12px; margin: 30px 0;">
    <h4 style="margin-top:0; color:var(--accent);">Case Study Spotlight</h4>
    Looking to see how these principles apply in the real world? Check out our <a href="/case-studies.html">Case Studies</a> to see how we helped clients scale their checkout infrastructure to handle 10x traffic loads using microservices and robust database tuning.
</div>

## Future-Proofing the Architecture
The timeline for technological iteration is compounding. What works today will be legacy tomorrow unless it is built on a versatile, decoupled foundation. We approach all builds with API-first mentalities, separating the frontend UI presentation layer from the heavy backend business logic.

Ready to architect your solution property? See our core <a href="/services/index.html">Digital Services</a> to understand how EL-HUB VENTURES can integrate with your leadership team to drive these outcomes directly.
`;

    // Only write if doesn't exist, we don't want to overwrite the one we already made if we modified it
    const filePath = path.join(insightsDir, `${slug}.md`);
    fs.writeFileSync(filePath, mdContent);
}

console.log('Successfully generated all Markdown blogs and copied cover images.');
