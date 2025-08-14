#!/usr/bin/env node

/**
 * Firebase Contact Form Testing Script
 * Tests the contact form functionality end-to-end
 */

const https = require('https');
const http = require('http');

// Configuration
const config = {
  // Update these with your actual Firebase project details
  baseUrl: 'https://your-project-id.web.app', // Replace with your actual URL
  apiEndpoint: '/api/contact',
  testEmail: 'test@example.com', // Use a real email for testing
  timeout: 30000 // 30 seconds timeout
};

// Test data
const testCases = [
  {
    name: 'Valid submission - Import Documentation',
    data: {
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+60 12-345-6789',
      serviceType: 'Import Documentation',
      message: 'I need help with import documentation for electronics from China.'
    },
    expectedStatus: 200,
    shouldSucceed: true
  },
  {
    name: 'Valid submission - Export Compliance',
    data: {
      fullName: 'Jane Smith',
      email: 'jane.smith@company.com',
      phone: '03-1234-5678',
      serviceType: 'Export Compliance',
      message: 'Looking for export compliance services for textiles to GCC countries.'
    },
    expectedStatus: 200,
    shouldSucceed: true
  },
  {
    name: 'Invalid email format',
    data: {
      fullName: 'Test User',
      email: 'invalid-email',
      phone: '+60 12-345-6789',
      serviceType: 'Trade Consulting',
      message: 'Test message'
    },
    expectedStatus: 400,
    shouldSucceed: false
  },
  {
    name: 'Missing required fields',
    data: {
      fullName: '',
      email: 'test@example.com',
      phone: '',
      serviceType: '',
      message: 'Test message'
    },
    expectedStatus: 400,
    shouldSucceed: false
  },
  {
    name: 'Very long message',
    data: {
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '+60 12-345-6789',
      serviceType: 'Supply Chain Management',
      message: 'A'.repeat(2000) // Very long message
    },
    expectedStatus: 200,
    shouldSucceed: true
  }
];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Utility functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, data, method = 'POST') {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'Firebase-Form-Tester/1.0'
      },
      timeout: config.timeout
    };
    
    const req = client.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsedData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: responseData,
            parseError: error.message
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.write(postData);
    req.end();
  });
}

// Test health endpoint
async function testHealthEndpoint() {
  log('\n🏥 Testing health endpoint...', 'blue');
  
  try {
    const response = await makeRequest(`${config.baseUrl}/api/health`, {}, 'GET');
    
    if (response.status === 200) {
      log('✅ Health endpoint is working', 'green');
      log(`   Response: ${JSON.stringify(response.data)}`, 'cyan');
      return true;
    } else {
      log(`❌ Health endpoint failed with status ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Health endpoint error: ${error.message}`, 'red');
    return false;
  }
}

// Test individual form submission
async function testFormSubmission(testCase) {
  log(`\n📝 Testing: ${testCase.name}`, 'blue');
  
  try {
    const response = await makeRequest(
      `${config.baseUrl}${config.apiEndpoint}`,
      testCase.data
    );
    
    const statusMatch = response.status === testCase.expectedStatus;
    const successMatch = testCase.shouldSucceed ? response.data.success : !response.data.success;
    
    if (statusMatch && (successMatch || response.data.success === undefined)) {
      log(`✅ Test passed (Status: ${response.status})`, 'green');
      
      if (response.data.message) {
        log(`   Message: ${response.data.message}`, 'cyan');
      }
      
      if (response.data.submissionId) {
        log(`   Submission ID: ${response.data.submissionId}`, 'cyan');
      }
      
      return { passed: true, response };
    } else {
      log(`❌ Test failed`, 'red');
      log(`   Expected status: ${testCase.expectedStatus}, Got: ${response.status}`, 'yellow');
      log(`   Expected success: ${testCase.shouldSucceed}, Got: ${response.data.success}`, 'yellow');
      
      if (response.data.errors) {
        log(`   Errors: ${JSON.stringify(response.data.errors)}`, 'yellow');
      }
      
      return { passed: false, response };
    }
  } catch (error) {
    log(`❌ Test error: ${error.message}`, 'red');
    return { passed: false, error: error.message };
  }
}

// Test rate limiting
async function testRateLimiting() {
  log('\n🚦 Testing rate limiting...', 'blue');
  
  const rapidRequests = [];
  const testData = {
    fullName: 'Rate Limit Test',
    email: 'ratelimit@example.com',
    phone: '+60 12-345-6789',
    serviceType: 'Trade Consulting',
    message: 'Rate limit test message'
  };
  
  // Send 10 rapid requests
  for (let i = 0; i < 10; i++) {
    rapidRequests.push(
      makeRequest(`${config.baseUrl}${config.apiEndpoint}`, testData)
        .catch(error => ({ error: error.message }))
    );
  }
  
  try {
    const responses = await Promise.all(rapidRequests);
    const rateLimitedResponses = responses.filter(r => r.status === 429);
    
    if (rateLimitedResponses.length > 0) {
      log(`✅ Rate limiting is working (${rateLimitedResponses.length}/10 requests blocked)`, 'green');
      return true;
    } else {
      log('⚠️  Rate limiting may not be configured properly', 'yellow');
      return false;
    }
  } catch (error) {
    log(`❌ Rate limiting test error: ${error.message}`, 'red');
    return false;
  }
}

// Main test runner
async function runTests() {
  log('🚀 Starting Firebase Contact Form Tests', 'magenta');
  log(`📍 Testing URL: ${config.baseUrl}`, 'cyan');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    healthCheck: false,
    rateLimitCheck: false
  };
  
  // Test health endpoint first
  results.healthCheck = await testHealthEndpoint();
  
  if (!results.healthCheck) {
    log('\n❌ Health check failed. Please verify your Firebase deployment.', 'red');
    log('   Make sure your functions are deployed and the URL is correct.', 'yellow');
    process.exit(1);
  }
  
  // Run form submission tests
  log('\n📋 Running form submission tests...', 'magenta');
  
  for (const testCase of testCases) {
    const result = await testFormSubmission(testCase);
    results.total++;
    
    if (result.passed) {
      results.passed++;
    } else {
      results.failed++;
    }
    
    // Add delay between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Test rate limiting
  results.rateLimitCheck = await testRateLimiting();
  
  // Print summary
  log('\n📊 Test Summary', 'magenta');
  log(`   Total tests: ${results.total}`, 'cyan');
  log(`   Passed: ${results.passed}`, 'green');
  log(`   Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'cyan');
  log(`   Health check: ${results.healthCheck ? '✅' : '❌'}`, results.healthCheck ? 'green' : 'red');
  log(`   Rate limiting: ${results.rateLimitCheck ? '✅' : '⚠️'}`, results.rateLimitCheck ? 'green' : 'yellow');
  
  if (results.failed === 0 && results.healthCheck) {
    log('\n🎉 All tests passed! Your contact form is working correctly.', 'green');
    log('\n📝 Next steps:', 'blue');
    log('   1. Test the form manually on your website', 'cyan');
    log('   2. Check your email for test submissions', 'cyan');
    log('   3. Verify data is stored in Firestore', 'cyan');
    log('   4. Monitor function logs for any issues', 'cyan');
  } else {
    log('\n⚠️  Some tests failed. Please review the issues above.', 'yellow');
    process.exit(1);
  }
}

// Command line argument parsing
if (process.argv.length > 2) {
  config.baseUrl = process.argv[2];
  log(`Using custom URL: ${config.baseUrl}`, 'cyan');
}

// Run the tests
runTests().catch(error => {
  log(`\n💥 Test runner error: ${error.message}`, 'red');
  process.exit(1);
});
