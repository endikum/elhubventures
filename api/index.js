const express = require('express');
const path = require('path');
const fs = require('fs');
const { marked } = require('marked');
const contactHandler = require('./contact');

const app = express();
const port = process.env.PORT || 5500;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global Request Logger
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.url}`);
  next();
});

app.get('/test-server', (req, res) => res.send('ALIVE'));

// Helper to load content calendar
function getLivePosts() {
  const csvPath = path.join(__dirname, '..', 'content_calendar.csv');
  if (!fs.existsSync(csvPath)) return [];
  const content = fs.readFileSync(csvPath, 'utf8').trim().split('\n');
  
  const today = new Date().setHours(0,0,0,0);
  const posts = [];
  
  for(let i=1; i<content.length; i++) {
     const line = content[i];
     if(!line) continue;
     const [topic, slug, publishDate, keyword] = line.split(',');
     const postDate = new Date(publishDate).setHours(0,0,0,0);
     
     if(postDate <= today) {
        posts.push({ topic, slug, publishDate, keyword });
     }
  }
  
  // Sort posts by date descending
  return posts.sort((a,b) => new Date(b.publishDate) - new Date(a.publishDate));
}

// Blog Engine - Dynamic list view (Clean URLs for Resources Hub)
app.get(['/resources', '/resources/', '/resources/index.html'], (req, res) => {
  // If user hits index.html, redirect to clean URL
  if(req.url.endsWith('index.html')) {
    return res.redirect('/resources/');
  }
  const posts = getLivePosts();
  
  // Create Article Cards dynamically
  let listHtml = posts.map(p => `
    <article class="luxury-card reveal visible">
        <div class="luxury-card-icon">INSIGHT</div>
        <h4>${p.topic}</h4>
        <p><strong>Focus:</strong> ${p.keyword}</p>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 20px;">Published on ${p.publishDate}</p>
        <a href="/insights/${p.slug}" class="btn btn-outline" style="padding: 10px 20px; font-size: 0.85rem;">Read Full Insight &rarr;</a>
    </article>
  `).join('');
  
  if(posts.length === 0) {
    listHtml = '<p style="color:var(--text-muted); text-align:center; grid-column: 1/-1;">Check back soon for latest technical insights!</p>';
  }

  // Load the shell from index.html to ensure 100% consistency
  const indexPath = path.join(__dirname, '..', 'index.html');
  if(!fs.existsSync(indexPath)) return res.send(`Resources found, but site shell (index.html) is missing at ${indexPath}. Please check server root.`);
  
  let shell = fs.readFileSync(indexPath, 'utf8');
  const navMatch = shell.match(/<nav class="navbar" id="navbar">.*?<\/nav>/s);
  const footerMatch = shell.match(/<footer class="footer">.*?<\/footer>/s);

  if(!navMatch || !footerMatch) return res.send('Could not extract nav/footer from index.html. Ensure markup has exact classes.');

  const nav = navMatch[0];
  const footer = footerMatch[0];

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Resources & Technical Insights | EL-HUB VENTURES</title>
        <meta name="description" content="Access EL-HUB VENTURES' proprietary repository of technical insights, framework comparisons, and digital transformation strategies.">
        <link rel="stylesheet" href="/index.css">
    </head>
    <body class="page-main">
        ${nav}

        <main id="main-content">
            <section class="hero" style="min-height: 40vh; align-items: center; justify-content: center; display: flex; text-align: center;">
                <div class="hero-bg-grid"></div>
                <div class="hero-particles" id="heroParticles"></div>
                <div class="hero-glow hero-glow-1"></div>
                <div class="container">
                    <div class="hero-badge reveal visible">
                       <span class="badge-dot"></span>
                       TECHNICAL REPOSITORY
                    </div>
                    <h1 class="hero-title reveal visible">Resources & <span class="gradient-text">Insights</span></h1>
                    <p class="hero-description reveal visible" style="max-width: 800px; margin: 0 auto;">
                        Synthesized intelligence from the frontlines of software architecture, SEO engineering, and digital growth.
                    </p>
                </div>
            </section>

            <section class="section">
                <div class="container">
                    <div class="section-header reveal visible">
                        <span class="section-tag">Archive</span>
                        <h2 class="section-title">Latest <span class="gradient-text">Publications</span></h2>
                    </div>
                    <div class="luxury-grid">
                        ${listHtml}
                    </div>
                </div>
            </section>
        </main>

        ${footer}
        <script src="/main.js"></script>
    </body>
    </html>
  `
  .replace(/href="services\//g, 'href="/services/')
  .replace(/href="contact.html/g, 'href="/contact.html')
  .replace(/href="resources\//g, 'href="/resources/')
  .replace(/href="case-studies.html/g, 'href="/case-studies.html')
  .replace(/src="assets\//g, 'src="/assets/');

  res.send(html);
});


// Blog Engine - Redirect /insights to the dynamic /resources engine
app.get(['/insights', '/insights/'], (req, res) => {
  res.redirect('/resources/');
});

// Blog Engine - Single view (Premium Hybrid Template)
app.get('/insights/:slug', (req, res) => {
  const posts = getLivePosts();
  const post = posts.find(p => p.slug === req.params.slug);
  
  if(!post) return res.status(404).send('Post not found or not yet published.');
  
  const mdPath = path.join(__dirname, '..', 'insights', `${post.slug}.md`);
  if(!fs.existsSync(mdPath)) return res.send(`Post content coming soon at ${mdPath}`);
  
  const mdContent = fs.readFileSync(mdPath, 'utf8');
  const renderedContent = marked(mdContent);
  
  // Load the shell from index.html to ensure 100% consistency
  let shell = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  
  // Extract Nav and Footer
  const nav = shell.match(/<nav class="navbar" id="navbar">.*?<\/nav>/s)[0];
  const footer = shell.match(/<footer class="footer">.*?<\/footer>/s)[0];

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${post.topic} | EL-HUB VENTURES</title>
      <link rel="stylesheet" href="/index.css">
      <style>
         .blog-content { max-width: 800px; margin: 0 auto; padding: 40px 20px; }
         .blog-content h2, .blog-content h3 { color: var(--accent-primary); margin-top: 2rem; margin-bottom: 1rem; }
         .blog-content p { color: var(--text-secondary); line-height: 1.8; margin-bottom: 1.2rem; font-size: 1.05rem; }
         .blog-content ul, .blog-content ol { color: var(--text-secondary); margin-bottom: 1.5rem; padding-left: 25px; }
         .blog-content li { margin-bottom: 0.8rem; }
         .blog-content a { color: var(--accent-primary); text-decoration: underline; }
         .blog-content blockquote { border-left: 4px solid var(--accent-primary); padding-left: 20px; color: var(--text-muted); font-style: italic; margin: 2rem 0; }
         .blog-hero { padding: 120px 0 60px; text-align: center; background: rgba(227, 197, 103, 0.03); border-bottom: 1px solid var(--border-color); }
         .blog-content img { 
            width: 100%; 
            max-height: 380px; 
            object-fit: cover; 
            border-radius: 12px; 
            margin-bottom: 30px; 
            border: 1px solid var(--border-color);
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
         }
      </style>
    </head>
    <body class="page-main">
      ${nav}

      <section class="blog-hero">
        <div class="container">
          <div class="hero-badge reveal visible">
            <span class="badge-dot"></span>
            Technical Insight
          </div>
          <h1 class="hero-title reveal visible" style="font-size: clamp(2rem, 5vw, 3.5rem); line-height: 1.2;">${post.topic}</h1>
          <p class="hero-description reveal visible" style="margin-top: 20px;">Published: ${post.publishDate} • Archive 2026</p>
        </div>
      </section>

         <div class="blog-content reveal visible">
            ${renderedContent}
            
            <div class="related-resources" style="margin-top: 60px; padding: 30px; background: rgba(227, 197, 103, 0.05); border-radius: 12px; border: 1px solid var(--border-color);">
                <h3 style="color: var(--accent-primary); margin-bottom: 15px;">Explore Further Insights</h3>
                <ul style="list-style-type: none; padding-left: 0; display: flex; flex-direction: column; gap: 10px;">
                    <li>&rarr; <a href="/case-studies.html" style="color: var(--text-light); text-decoration: none;">Read our detailed <strong>Case Studies</strong> and scaling outcomes</a></li>
                    <li>&rarr; <a href="/services/index.html" style="color: var(--text-light); text-decoration: none;">Discover our complete range of <strong>Digital Services</strong></a></li>
                    <li>&rarr; <a href="/resources/" style="color: var(--text-light); text-decoration: none;">Visit the <strong>Insights Hub</strong> for deep-dive technical articles</a></li>
                    <li style="margin-top: 10px;">&rarr; <a href="https://github.com/elhubventures" target="_blank" rel="noopener noreferrer" style="color: var(--text-muted); font-size: 0.9rem;"><em>Open Source Reliability via EL-HUB Git</em></a></li>
                </ul>
            </div>

            <div style="margin-top: 40px; padding: 40px; background: rgba(227, 197, 103, 0.1); border-radius: 12px; border: 1px solid var(--border-color); text-align: center;">
                <h3>Looking for custom solutions?</h3>
                <p>Our team of expert engineers and strategists can help you implement these insights into your business architecture.</p>
                <a href="/contact.html" class="btn btn-primary" style="display:inline-flex; margin-top: 15px;">Start Your Transformation</a>
            </div>
         </div>

      ${footer}
      <script src="/main.js"></script>
    </body>
    </html>
  `
  .replace(/href="services\//g, 'href="/services/')
  .replace(/href="contact.html/g, 'href="/contact.html')
  .replace(/href="resources\//g, 'href="/resources/')
  .replace(/href="case-studies.html/g, 'href="/case-studies.html')
  .replace(/src="assets\//g, 'src="/assets/');
  
  res.send(html);
});


app.post('/api/contact', async (req, res) => {
  try {
    await contactHandler(req, res);
  } catch (error) {
    console.error('Contact handler error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }
});

// Handle Home Page separately to ensure it is always dynamic & fast
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Final Static Fallback
app.use(express.static(path.join(__dirname, '..'), { extensions: ['html'] }));

// Clean 404 handler
app.use((req, res) => {
  res.status(404).send('404: Cannot find the requested resource. Go to <a href="/">Home</a>');
});

app.listen(port, () => {
  console.log(`EL-HUB server running on http://localhost:${port}`);
});

module.exports = app;
