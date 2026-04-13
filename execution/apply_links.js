const fs = require('fs');
const path = require('path');

const servicesDir = path.join(__dirname, '..', 'services');

const externalLinks = {
  'ai-data-solutions.html': { url: 'https://www.tensorflow.org/', text: 'Powered by TensorFlow Research' },
  'cloud-devops.html': { url: 'https://aws.amazon.com/devops/', text: 'AWS DevOps Best Practices' },
  'digital-strategy.html': { url: 'https://www.uipath.com/', text: 'Automation powered by UiPath' },
  'ecommerce-saas.html': { url: 'https://stripe.com/docs', text: 'Secure Payments via Stripe Architecture' },
  'mobile-app-development.html': { url: 'https://flutter.dev/', text: 'Built utilizing Flutter Ecosystem' },
  'seo-services.html': { url: 'https://ads.google.com/', text: 'Scaled with Google Ads Infrastructure' },
  'training-consulting.html': { url: 'https://www.gartner.com/en/information-technology', text: 'Insights backed by Gartner IT Research' },
  'ui-ux-design.html': { url: 'https://www.figma.com/', text: 'UI Collaboration via Figma' },
  'web-development.html': { url: 'https://react.dev/', text: 'Frontend Scalability with React' }
};

fs.readdirSync(servicesDir).forEach(file => {
  if (file.endsWith('.html') && file !== 'index.html') {
    const filePath = path.join(servicesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if we already inserted related resources
    if (!content.includes('class="related-resources"')) {
      const extInfo = externalLinks[file] || { url: 'https://github.com', text: 'Open Source Reliability' };
      
      const injection = `
        <div class="related-resources reveal reveal-up" style="margin-top: 50px; padding: 30px; background: rgba(255,255,255,0.03); border-radius: 15px; border: 1px solid rgba(255,255,255,0.1);">
            <h3 style="color: var(--accent-primary); margin-bottom: 15px;">Explore Further Insights</h3>
            <ul style="list-style-type: none; padding-left: 0; display: flex; flex-direction: column; gap: 10px;">
                <li>&rarr; <a href="../case-studies.html" style="color: var(--text-light); text-decoration: none;">Read our detailed <strong>Case Studies</strong> and scaling outcomes</a></li>
                <li>&rarr; <a href="index.html" style="color: var(--text-light); text-decoration: none;">Discover our complete range of <strong>Digital Services</strong></a></li>
                <li>&rarr; <a href="../insights" style="color: var(--text-light); text-decoration: none;">Visit the <strong>Insights Hub</strong> for deep-dive technical articles</a></li>
                <li style="margin-top: 10px;">&rarr; <a href="${extInfo.url}" target="_blank" rel="noopener noreferrer" style="color: var(--text-muted); font-size: 0.9rem;"><em>${extInfo.text}</em></a></li>
            </ul>
        </div>
      `;

      // Insert before the centered-link
      content = content.replace(/(<div class="centered-link [^>]+>)/, injection + '\n        $1');
      fs.writeFileSync(filePath, content);
      console.log('Updated: ' + file);
    }
  }
});
