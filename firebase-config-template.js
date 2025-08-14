// Firebase Configuration Template
// Copy this configuration and update with your actual Firebase project details

// 1. Get your Firebase configuration from Firebase Console:
//    - Go to Project Settings > General > Your apps
//    - Click on the web app or create one
//    - Copy the configuration object

const firebaseConfig = {
  // Replace these values with your actual Firebase project configuration
  apiKey: "AIzaSyC...", // Your API key
  authDomain: "justama-import-export.firebaseapp.com", // Your auth domain
  projectId: "justama-import-export", // Your project ID
  storageBucket: "justama-import-export.appspot.com", // Your storage bucket
  messagingSenderId: "123456789", // Your messaging sender ID
  appId: "1:123456789:web:abc123def456", // Your app ID
  measurementId: "G-XXXXXXXXXX" // Your measurement ID (optional, for Analytics)
};

// 2. Add this script tag to your index.html before the closing </body> tag:

/*
<!-- Firebase SDK v9 (Compat) -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics-compat.js"></script>

<!-- Firebase Configuration -->
<script>
// Paste your firebaseConfig object here
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Analytics (optional)
if (firebaseConfig.measurementId) {
  firebase.analytics();
}
</script>

<!-- Updated Contact Form Script -->
<script src="assets/js/firebase-contact.js"></script>
*/

// 3. Environment Variables for Cloud Functions
// Run these commands in your terminal after setting up your Gmail app password:

/*
firebase functions:config:set gmail.email="your-business-email@gmail.com"
firebase functions:config:set gmail.password="your-16-character-app-password"
firebase functions:config:set business.email="info@justama-import-export.com"
firebase functions:config:set business.cc="manager@justama-import-export.com,sales@justama-import-export.com"
*/

// 4. Update CORS origins in functions/index.js
// Replace the origins array with your actual domains:

/*
origin: [
  'https://your-project-id.web.app',
  'https://your-project-id.firebaseapp.com',
  'https://your-custom-domain.com', // Add your custom domain here
  // Remove localhost origins in production
]
*/

// 5. Gmail App Password Setup Instructions:
/*
1. Go to your Google Account settings (myaccount.google.com)
2. Navigate to Security
3. Enable 2-Step Verification if not already enabled
4. Go to Security > 2-Step Verification > App passwords
5. Select "Mail" and "Other (Custom name)"
6. Enter "Justama Contact Form" as the name
7. Copy the 16-character password (format: xxxx xxxx xxxx xxxx)
8. Use this password in the firebase functions:config:set command above
*/

// 6. Testing Configuration
// After deployment, test these URLs:
/*
- https://your-project-id.web.app (your website)
- https://your-project-id.web.app/api/health (health check)
- Submit a test form and check:
  - Your email inbox for the business notification
  - The test email address for the auto-reply
  - Firebase Console > Firestore for the stored submission
*/

// 7. Custom Domain Setup (Optional)
/*
1. In Firebase Console, go to Hosting
2. Click "Add custom domain"
3. Enter your domain (e.g., www.justama-import-export.com)
4. Follow the DNS configuration instructions
5. Update the CORS origins in your Cloud Function
6. Update any hardcoded URLs in your application
*/

// 8. Security Checklist
/*
- [ ] Firebase security rules are properly configured
- [ ] Environment variables are set correctly
- [ ] CORS origins include only your actual domains
- [ ] Rate limiting is configured appropriately
- [ ] Gmail app password is secure and not shared
- [ ] Test all functionality in production environment
*/

// Export configuration for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = firebaseConfig;
}
