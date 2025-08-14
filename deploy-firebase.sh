#!/bin/bash

# Firebase Deployment Script for Justama Import and Export Sdn Bhd
# This script automates the deployment process to Firebase

set -e  # Exit on any error

echo "🚀 Starting Firebase deployment for Justama Import and Export Sdn Bhd..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    print_error "Firebase CLI is not installed. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    print_error "You are not logged in to Firebase. Please run:"
    echo "firebase login"
    exit 1
fi

# Check if we're in the correct directory
if [ ! -f "index.html" ]; then
    print_error "index.html not found. Please run this script from the project root directory."
    exit 1
fi

# Check if Firebase is initialized
if [ ! -f "firebase.json" ]; then
    print_error "Firebase not initialized. Please run 'firebase init' first."
    exit 1
fi

print_status "Checking project structure..."

# Check if functions directory exists
if [ ! -d "functions" ]; then
    print_error "Functions directory not found. Please ensure Firebase Functions are initialized."
    exit 1
fi

# Check if functions dependencies are installed
if [ ! -d "functions/node_modules" ]; then
    print_status "Installing function dependencies..."
    cd functions
    npm install
    cd ..
    print_success "Function dependencies installed"
fi

# Validate environment configuration
print_status "Checking Firebase configuration..."

# Check if environment variables are set
ENV_CHECK=$(firebase functions:config:get 2>/dev/null || echo "{}")
if [ "$ENV_CHECK" = "{}" ]; then
    print_warning "No environment variables found. Please set them up:"
    echo "firebase functions:config:set gmail.email=\"your-email@gmail.com\""
    echo "firebase functions:config:set gmail.password=\"your-app-password\""
    echo "firebase functions:config:set business.email=\"info@justama-import-export.com\""
    echo "firebase functions:config:set business.cc=\"manager@justama-import-export.com\""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Pre-deployment checks
print_status "Running pre-deployment checks..."

# Check if HTML file has Firebase configuration
if ! grep -q "firebase.initializeApp" index.html; then
    print_warning "Firebase configuration not found in index.html"
    print_warning "Please add Firebase SDK and configuration to your HTML file"
fi

# Check if contact form script is updated
if grep -q "formspree.io" index.html; then
    print_warning "Found Formspree references in HTML. Make sure to update the contact form."
fi

# Lint functions (if ESLint is configured)
if [ -f "functions/.eslintrc.js" ]; then
    print_status "Linting functions..."
    cd functions
    if npm run lint 2>/dev/null; then
        print_success "Functions linting passed"
    else
        print_warning "Functions linting failed, but continuing..."
    fi
    cd ..
fi

# Deploy based on user choice
echo
echo "Choose deployment option:"
echo "1) Deploy everything (Firestore rules, Functions, Hosting)"
echo "2) Deploy Functions only"
echo "3) Deploy Hosting only"
echo "4) Deploy Firestore rules only"
echo "5) Deploy with emulator testing first"
read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        print_status "Deploying everything..."
        firebase deploy
        ;;
    2)
        print_status "Deploying Functions only..."
        firebase deploy --only functions
        ;;
    3)
        print_status "Deploying Hosting only..."
        firebase deploy --only hosting
        ;;
    4)
        print_status "Deploying Firestore rules only..."
        firebase deploy --only firestore:rules
        ;;
    5)
        print_status "Starting emulators for testing..."
        echo "Testing environment will start at http://localhost:5000"
        echo "Press Ctrl+C when ready to deploy to production"
        firebase emulators:start --only functions,hosting,firestore
        echo
        read -p "Deploy to production now? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            firebase deploy
        else
            print_status "Deployment cancelled"
            exit 0
        fi
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

# Post-deployment checks
if [ $? -eq 0 ]; then
    print_success "Deployment completed successfully!"
    
    # Get project info
    PROJECT_ID=$(firebase use --current 2>/dev/null || echo "unknown")
    
    echo
    print_status "Your website is now live at:"
    echo "🌐 https://${PROJECT_ID}.web.app"
    echo "🌐 https://${PROJECT_ID}.firebaseapp.com"
    
    echo
    print_status "Testing your deployment:"
    echo "1. Visit your website and test the contact form"
    echo "2. Check Firebase Console for function logs"
    echo "3. Verify emails are being sent and received"
    echo "4. Check Firestore for stored submissions"
    
    echo
    print_status "Useful commands:"
    echo "📊 View function logs: firebase functions:log"
    echo "🔧 View project info: firebase projects:list"
    echo "⚙️  View config: firebase functions:config:get"
    
    # Optional: Open website in browser
    read -p "Open website in browser? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if command -v open &> /dev/null; then
            open "https://${PROJECT_ID}.web.app"
        elif command -v xdg-open &> /dev/null; then
            xdg-open "https://${PROJECT_ID}.web.app"
        else
            print_status "Please open https://${PROJECT_ID}.web.app in your browser"
        fi
    fi
    
else
    print_error "Deployment failed!"
    echo
    print_status "Troubleshooting steps:"
    echo "1. Check Firebase CLI version: firebase --version"
    echo "2. Verify project selection: firebase use --current"
    echo "3. Check function logs: firebase functions:log"
    echo "4. Verify environment variables: firebase functions:config:get"
    exit 1
fi

echo
print_success "🎉 Justama Import and Export contact form is now live!"
print_status "Don't forget to:"
echo "• Test the contact form thoroughly"
echo "• Monitor function performance and costs"
echo "• Set up monitoring and alerts"
echo "• Update your business cards and marketing materials"

exit 0
