#!/usr/bin/env node

/**
 * Quick script to update Formspree form ID in the HTML file
 * Usage: node update-form-id.js YOUR_NEW_FORM_ID
 */

const fs = require('fs');
const path = require('path');

// Get the new form ID from command line arguments
const newFormId = process.argv[2];

if (!newFormId) {
    console.error('❌ Error: Please provide a form ID');
    console.log('Usage: node update-form-id.js YOUR_FORM_ID');
    console.log('Example: node update-form-id.js xaygvpqw');
    process.exit(1);
}

// Validate form ID format (should be 8 characters)
if (newFormId.length !== 8) {
    console.error('❌ Error: Form ID should be 8 characters long');
    console.log('Example: xaygvpqw');
    process.exit(1);
}

const htmlFilePath = path.join(__dirname, 'index.html');

// Check if HTML file exists
if (!fs.existsSync(htmlFilePath)) {
    console.error('❌ Error: index.html file not found');
    console.log('Make sure you run this script from the project root directory');
    process.exit(1);
}

try {
    // Read the HTML file
    let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
    
    // Find and replace the form action URL
    const oldPattern = /action="https:\/\/formspree\.io\/f\/[a-zA-Z0-9]{8}"/;
    const newAction = `action="https://formspree.io/f/${newFormId}"`;
    
    if (oldPattern.test(htmlContent)) {
        htmlContent = htmlContent.replace(oldPattern, newAction);
        
        // Write the updated content back to the file
        fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
        
        console.log('✅ Success! Form ID updated successfully');
        console.log(`📧 New form endpoint: https://formspree.io/f/${newFormId}`);
        console.log('');
        console.log('Next steps:');
        console.log('1. Deploy your website to your hosting platform');
        console.log('2. Add your live domain to Formspree settings');
        console.log('3. Test the contact form on your live website');
        
    } else {
        console.error('❌ Error: Could not find Formspree form action in HTML file');
        console.log('Please check that the HTML file contains a Formspree form');
    }
    
} catch (error) {
    console.error('❌ Error updating file:', error.message);
    process.exit(1);
}
