# Firebase Contact Form Implementation Guide

## 🎯 Overview
This guide provides a complete Firebase implementation for your Justama Import and Export Sdn Bhd contact form, including Cloud Functions, Firestore, and Firebase Hosting.

---

## 📋 Prerequisites

### Required Tools
- Node.js (v16 or higher)
- Firebase CLI
- Gmail account (for email sending)
- Firebase project

### Installation
```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login
```

---

## 🚀 Step 1: Firebase Project Setup

### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Project name: `justama-import-export`
4. Enable Google Analytics (optional)
5. Create project

### Enable Required Services
1. **Authentication**: Enable Email/Password provider
2. **Firestore**: Create database in production mode
3. **Functions**: Enable Cloud Functions
4. **Hosting**: Enable Firebase Hosting

### Initialize Firebase in Your Project
```bash
# Navigate to your project directory
cd justama_landing_page

# Initialize Firebase
firebase init

# Select:
# - Functions (JavaScript)
# - Firestore
# - Hosting
# - Use existing project: justama-import-export
```

---

## 🔧 Step 2: Project Structure Setup

After Firebase initialization, your structure should look like:
```
justama_landing_page/
├── functions/
│   ├── index.js
│   ├── package.json
│   └── .gitignore
├── firestore.rules
├── firebase.json
├── .firebaserc
├── public/ (or your existing files)
│   ├── index.html
│   ├── assets/
│   └── ...
└── [existing files]
```

---

## 📧 Step 3: Email Configuration

### Gmail App Password Setup
1. Go to Google Account settings
2. Enable 2-Factor Authentication
3. Generate App Password:
   - Go to Security > App passwords
   - Select "Mail" and "Other"
   - Name: "Justama Contact Form"
   - Copy the 16-character password

### Environment Variables
```bash
# Set Firebase environment variables
firebase functions:config:set gmail.email="your-business-email@gmail.com"
firebase functions:config:set gmail.password="your-16-char-app-password"
firebase functions:config:set business.email="info@justama-import-export.com"
firebase functions:config:set business.cc="manager@justama-import-export.com,sales@justama-import-export.com"
```

---

## 🗄️ Step 4: Firestore Security Rules

Create/update `firestore.rules`:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Contact submissions - write only from functions
    match /contact_submissions/{document} {
      allow read: if request.auth != null && request.auth.token.admin == true;
      allow write: if false; // Only Cloud Functions can write
    }
    
    // Rate limiting collection
    match /rate_limits/{document} {
      allow read, write: if false; // Only Cloud Functions
    }
    
    // Default deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## ⚡ Step 5: Cloud Functions Implementation

### Package Dependencies
Update `functions/package.json`:
```json
{
  "name": "functions",
  "description": "Cloud Functions for Firebase",
  "scripts": {
    "serve": "firebase emulators:start --only functions",
    "shell": "firebase functions:shell",
    "start": "npm run shell",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log"
  },
  "engines": {
    "node": "18"
  },
  "main": "index.js",
  "dependencies": {
    "firebase-admin": "^11.8.0",
    "firebase-functions": "^4.3.1",
    "nodemailer": "^6.9.3",
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.7.1"
  },
  "devDependencies": {
    "eslint": "^8.15.0",
    "eslint-config-google": "^0.14.0",
    "firebase-functions-test": "^3.1.0"
  },
  "private": true
}
```

### Main Cloud Function
Create `functions/index.js`:
```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Create Express app
const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    'https://justama-import-export.web.app',
    'https://justama-import-export.firebaseapp.com',
    'https://your-custom-domain.com', // Add your custom domain
    'http://localhost:3000', // For local testing
    'http://localhost:5000'  // Firebase emulator
  ],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many form submissions. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/contact', limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Email transporter setup
const createTransporter = () => {
  const config = functions.config();
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: config.gmail.email,
      pass: config.gmail.password,
    },
  });
};

// Validation functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,20}$/;
  return phoneRegex.test(phone);
};

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

// Email templates
const createBusinessEmailTemplate = (formData) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #1e40af; }
        .value { margin-top: 5px; padding: 10px; background: #f8fafc; border-left: 3px solid #1e40af; }
        .footer { background: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>New Contact Form Submission</h2>
        <p>Justama Import and Export Sdn Bhd</p>
      </div>
      
      <div class="content">
        <div class="field">
          <div class="label">Full Name:</div>
          <div class="value">${formData.fullName}</div>
        </div>
        
        <div class="field">
          <div class="label">Email Address:</div>
          <div class="value">${formData.email}</div>
        </div>
        
        <div class="field">
          <div class="label">Phone Number:</div>
          <div class="value">${formData.phone}</div>
        </div>
        
        <div class="field">
          <div class="label">Service Type:</div>
          <div class="value">${formData.serviceType}</div>
        </div>
        
        <div class="field">
          <div class="label">Message:</div>
          <div class="value">${formData.message || 'No message provided'}</div>
        </div>
        
        <div class="field">
          <div class="label">Submission Time:</div>
          <div class="value">${new Date().toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' })}</div>
        </div>
      </div>
      
      <div class="footer">
        <p>This email was automatically generated from your website contact form.</p>
        <p>Please respond to the customer within 24 hours for best service.</p>
      </div>
    </body>
    </html>
  `;
};

const createAutoReplyTemplate = (customerName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { background: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>Thank You for Your Inquiry</h2>
        <p>Justama Import and Export Sdn Bhd</p>
      </div>
      
      <div class="content">
        <p>Dear ${customerName},</p>
        
        <p>Thank you for contacting Justama Import and Export Sdn Bhd. We have received your inquiry and appreciate your interest in our import/export services.</p>
        
        <p><strong>What happens next:</strong></p>
        <ul>
          <li>Our team will review your inquiry within 24 hours</li>
          <li>A specialist will contact you to discuss your specific requirements</li>
          <li>We'll provide you with a customized solution for your import/export needs</li>
        </ul>
        
        <p><strong>Our Services:</strong></p>
        <ul>
          <li>Import Documentation & Permits</li>
          <li>Export Compliance & Certification</li>
          <li>Trade Financing Assistance</li>
          <li>Supply Chain Management</li>
          <li>Warehousing & Distribution</li>
          <li>International Trade Consulting</li>
        </ul>
        
        <p>If you have any urgent questions, please don't hesitate to contact us directly:</p>
        <p><strong>Phone:</strong> +60 3-8024 5678<br>
        <strong>Email:</strong> info@justama-import-export.com<br>
        <strong>WhatsApp:</strong> +60 38024 5678</p>
        
        <p>Best regards,<br>
        The Justama Import and Export Team</p>
      </div>
      
      <div class="footer">
        <p>Justama Import and Export Sdn Bhd</p>
        <p>No. 15, Jalan Perdagangan 2/1, Taman Perindustrian UEP, 47600 Subang Jaya, Selangor, Malaysia</p>
      </div>
    </body>
    </html>
  `;
};

// Main contact form handler
app.post('/contact', async (req, res) => {
  try {
    const { fullName, email, phone, serviceType, message } = req.body;

    // Validation
    const errors = [];
    
    if (!fullName || fullName.length < 2) {
      errors.push('Full name is required and must be at least 2 characters');
    }
    
    if (!email || !validateEmail(email)) {
      errors.push('Valid email address is required');
    }
    
    if (!phone || !validatePhone(phone)) {
      errors.push('Valid phone number is required');
    }
    
    if (!serviceType) {
      errors.push('Service type is required');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors: errors
      });
    }

    // Sanitize inputs
    const sanitizedData = {
      fullName: sanitizeInput(fullName),
      email: sanitizeInput(email).toLowerCase(),
      phone: sanitizeInput(phone),
      serviceType: sanitizeInput(serviceType),
      message: sanitizeInput(message),
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      ip: req.ip,
      userAgent: req.get('User-Agent') || 'Unknown'
    };

    // Store in Firestore
    const docRef = await db.collection('contact_submissions').add(sanitizedData);
    
    // Send emails
    const transporter = createTransporter();
    const config = functions.config();
    
    // Business notification email
    const businessEmailOptions = {
      from: `"Justama Contact Form" <${config.gmail.email}>`,
      to: config.business.email,
      cc: config.business.cc ? config.business.cc.split(',') : [],
      subject: `New Contact Form Submission - ${sanitizedData.serviceType}`,
      html: createBusinessEmailTemplate(sanitizedData),
      replyTo: sanitizedData.email
    };

    // Customer auto-reply email
    const autoReplyOptions = {
      from: `"Justama Import and Export" <${config.gmail.email}>`,
      to: sanitizedData.email,
      subject: 'Thank you for your inquiry - Justama Import and Export',
      html: createAutoReplyTemplate(sanitizedData.fullName)
    };

    // Send both emails
    await Promise.all([
      transporter.sendMail(businessEmailOptions),
      transporter.sendMail(autoReplyOptions)
    ]);

    // Log success
    console.log('Contact form submission processed:', docRef.id);

    res.status(200).json({
      success: true,
      message: 'Your inquiry has been submitted successfully. We will contact you within 24 hours.',
      submissionId: docRef.id
    });

  } catch (error) {
    console.error('Contact form error:', error);
    
    res.status(500).json({
      success: false,
      message: 'There was an error processing your request. Please try again or contact us directly.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'justama-contact-form'
  });
});

// Export the function
exports.api = functions.region('asia-southeast1').https.onRequest(app);
```

---

## 🌐 Step 6: Firebase Configuration

### Firebase Config (`firebase.json`)
```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "functions": [
    {
      "source": "functions",
      "codebase": "default",
      "ignore": [
        "node_modules",
        ".git",
        "firebase-debug.log",
        "firebase-debug.*.log"
      ],
      "predeploy": ["npm --prefix \"$RESOURCE_DIR\" run lint"],
      "runtime": "nodejs18"
    }
  ],
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**",
      "functions/**",
      "*.md"
    ],
    "rewrites": [
      {
        "source": "/api/**",
        "function": "api"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(eot|otf|ttf|ttc|woff|font.css)",
        "headers": [
          {
            "key": "Access-Control-Allow-Origin",
            "value": "*"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=604800"
          }
        ]
      },
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=604800"
          }
        ]
      }
    ]
  }
}
```

### Firestore Indexes (`firestore.indexes.json`)
```json
{
  "indexes": [
    {
      "collectionGroup": "contact_submissions",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "timestamp",
          "order": "DESCENDING"
        },
        {
          "fieldPath": "serviceType",
          "order": "ASCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

---

## 🎨 Step 7: Frontend Integration

### Update HTML Form
Replace the existing form action in `index.html`:

**Find (around line 363):**
```html
<form id="contactForm" action="https://formspree.io/f/xpwagvpb" method="POST" class="needs-validation" novalidate>
```

**Replace with:**
```html
<form id="contactForm" class="needs-validation" novalidate>
```

### Firebase SDK Integration
Add Firebase SDK to your `index.html` before closing `</body>` tag:

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics-compat.js"></script>

<!-- Firebase Configuration -->
<script>
// Your Firebase config (get from Firebase Console > Project Settings)
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "justama-import-export.firebaseapp.com",
  projectId: "justama-import-export",
  storageBucket: "justama-import-export.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
</script>
```

### Update JavaScript Contact Form Handler
Replace the `initContactForm()` function in `assets/js/script.js`:

```javascript
// Contact form submission with Firebase
function initContactForm() {
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            if (!contactForm.checkValidity()) {
                contactForm.classList.add('was-validated');
                return;
            }

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;

            // Show loading state
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            try {
                // Prepare form data
                const formData = {
                    fullName: contactForm.fullName.value.trim(),
                    email: contactForm.email.value.trim(),
                    phone: contactForm.phone.value.trim(),
                    serviceType: contactForm.serviceType.value,
                    message: contactForm.message.value.trim()
                };

                // Submit to Firebase Cloud Function
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (result.success) {
                    showNotification(result.message, 'success');
                    contactForm.reset();
                    contactForm.classList.remove('was-validated');

                    // Remove validation classes
                    const inputs = contactForm.querySelectorAll('.is-valid, .is-invalid');
                    inputs.forEach(input => {
                        input.classList.remove('is-valid', 'is-invalid');
                    });

                    // Track successful submission
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'form_submit_success', {
                            event_category: 'Contact Form',
                            event_label: formData.serviceType
                        });
                    }
                } else {
                    // Handle validation errors
                    if (result.errors && Array.isArray(result.errors)) {
                        showNotification(result.errors.join('<br>'), 'error');
                    } else {
                        showNotification(result.message || 'Please check your information and try again.', 'error');
                    }
                }

            } catch (error) {
                console.error('Form submission error:', error);
                showNotification('There was a network error. Please check your connection and try again.', 'error');

                // Track error
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'form_submit_error', {
                        event_category: 'Contact Form',
                        event_label: error.message
                    });
                }
            } finally {
                // Reset button state
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
}
```

---

## 🚀 Step 8: Deployment Process

### Install Dependencies
```bash
# Install function dependencies
cd functions
npm install
cd ..
```

### Deploy to Firebase
```bash
# Deploy everything
firebase deploy

# Or deploy individually:
firebase deploy --only firestore:rules
firebase deploy --only functions
firebase deploy --only hosting
```

### Set Custom Domain (Optional)
1. **Firebase Console** > Hosting > Add custom domain
2. **Follow DNS setup** instructions
3. **SSL certificate** automatically provisioned

---

## 🔒 Step 9: Security Configuration

### Environment Variables Verification
```bash
# Check current config
firebase functions:config:get

# Update if needed
firebase functions:config:set gmail.email="your-business@gmail.com"
firebase functions:config:set gmail.password="your-app-password"
firebase functions:config:set business.email="info@justama-import-export.com"
firebase functions:config:set business.cc="manager@justama-import-export.com"
```

### CORS Configuration
Update the origins array in `functions/index.js` with your actual domains:
```javascript
origin: [
  'https://justama-import-export.web.app',
  'https://justama-import-export.firebaseapp.com',
  'https://your-actual-domain.com', // Replace with your domain
  // Remove localhost origins in production
]
```

---

## 🧪 Step 10: Testing Procedures

### Local Testing
```bash
# Start Firebase emulators
firebase emulators:start

# Test locally at http://localhost:5000
```

### Production Testing Checklist
- [ ] **Form Submission**: Test complete form submission
- [ ] **Email Receipt**: Verify business email received
- [ ] **Auto-Reply**: Check customer receives auto-reply
- [ ] **Firestore Storage**: Confirm data stored in database
- [ ] **Rate Limiting**: Test multiple rapid submissions
- [ ] **Validation**: Test with invalid data
- [ ] **Mobile Testing**: Test on mobile devices
- [ ] **Cross-Browser**: Test different browsers

### Monitoring and Logs
```bash
# View function logs
firebase functions:log

# View specific function logs
firebase functions:log --only api
```

---

## 📊 Step 11: Database Management

### Query Submissions (Firebase Console)
1. **Firestore Database** > contact_submissions
2. **Filter by date, service type, etc.**
3. **Export data** as needed

### Programmatic Access (Optional)
Create admin script for managing submissions:

```javascript
// admin-script.js
const admin = require('firebase-admin');
const serviceAccount = require('./path/to/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Get recent submissions
async function getRecentSubmissions(days = 7) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const snapshot = await db.collection('contact_submissions')
    .where('timestamp', '>=', cutoff)
    .orderBy('timestamp', 'desc')
    .get();

  snapshot.forEach(doc => {
    console.log(doc.id, '=>', doc.data());
  });
}

getRecentSubmissions();
```

---

## 💰 Cost Estimation

### Firebase Pricing (Pay-as-you-go)
- **Cloud Functions**: First 2M invocations free/month
- **Firestore**: First 50K reads, 20K writes free/month
- **Hosting**: 10GB storage, 360MB/day transfer free
- **Estimated monthly cost**: $0-5 for typical business usage

### Gmail API Limits
- **Daily sending limit**: 500 emails/day (Gmail)
- **Rate limit**: 250 quota units per user per 100 seconds

---

## 🔧 Step 12: Maintenance and Monitoring

### Regular Tasks
- **Monitor function logs** for errors
- **Check email delivery** rates
- **Review Firestore usage** and costs
- **Update security rules** as needed
- **Backup important submissions**

### Performance Optimization
- **Function cold starts**: Keep functions warm with scheduled calls
- **Database queries**: Use proper indexing
- **Email templates**: Optimize for deliverability

---

## 🆘 Troubleshooting

### Common Issues

**Functions not deploying:**
```bash
# Check Node.js version
node --version  # Should be 16 or 18

# Clear cache and redeploy
firebase functions:delete api
firebase deploy --only functions
```

**Emails not sending:**
- Verify Gmail app password
- Check function logs for errors
- Ensure Gmail account has 2FA enabled

**CORS errors:**
- Update origins in functions/index.js
- Redeploy functions after changes

**Rate limiting issues:**
- Adjust rate limits in functions/index.js
- Clear rate limit data in Firestore

---

## ✅ Production Checklist

### Before Going Live
- [ ] Firebase project configured
- [ ] Environment variables set
- [ ] Custom domain configured (if applicable)
- [ ] Email templates tested
- [ ] Security rules deployed
- [ ] Rate limiting configured
- [ ] Error handling tested
- [ ] Mobile responsiveness verified

### Post-Launch Monitoring
- [ ] Function performance metrics
- [ ] Email delivery rates
- [ ] Database growth and costs
- [ ] User feedback and issues
- [ ] Security audit quarterly

---

## 📞 Support and Resources

### Firebase Documentation
- [Cloud Functions](https://firebase.google.com/docs/functions)
- [Firestore](https://firebase.google.com/docs/firestore)
- [Hosting](https://firebase.google.com/docs/hosting)

### Community Support
- [Firebase Discord](https://discord.gg/firebase)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)
- [Firebase GitHub](https://github.com/firebase/)

Your Firebase contact form implementation is now complete and production-ready!
