// Firebase Contact Form Integration for Justama Import and Export Sdn Bhd

// Contact form submission with Firebase Cloud Functions
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
                    message: contactForm.message.value.trim(),
                    timestamp: new Date().toISOString(),
                    source: 'website_contact_form'
                };
                
                // Validate required fields client-side
                const requiredFields = ['fullName', 'email', 'phone', 'serviceType'];
                const missingFields = requiredFields.filter(field => !formData[field]);
                
                if (missingFields.length > 0) {
                    throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
                }
                
                // Validate email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(formData.email)) {
                    throw new Error('Please enter a valid email address');
                }
                
                // Submit to Firebase Cloud Function
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                // Handle response
                let result;
                try {
                    result = await response.json();
                } catch (parseError) {
                    throw new Error('Server response was not valid JSON');
                }
                
                if (response.ok && result.success) {
                    // Success handling
                    showNotification(
                        result.message || 'Thank you! Your inquiry has been submitted successfully. We will contact you within 24 hours.',
                        'success'
                    );
                    
                    // Reset form
                    contactForm.reset();
                    contactForm.classList.remove('was-validated');
                    
                    // Remove validation classes
                    const inputs = contactForm.querySelectorAll('.is-valid, .is-invalid');
                    inputs.forEach(input => {
                        input.classList.remove('is-valid', 'is-invalid');
                    });
                    
                    // Track successful submission
                    trackFormSubmission('success', formData.serviceType, result.submissionId);
                    
                } else {
                    // Handle server errors or validation errors
                    let errorMessage = 'Please check your information and try again.';
                    
                    if (result.errors && Array.isArray(result.errors)) {
                        errorMessage = result.errors.join('<br>');
                    } else if (result.message) {
                        errorMessage = result.message;
                    } else if (!response.ok) {
                        errorMessage = `Server error (${response.status}). Please try again later.`;
                    }
                    
                    showNotification(errorMessage, 'error');
                    trackFormSubmission('error', formData.serviceType, errorMessage);
                }
                
            } catch (error) {
                console.error('Form submission error:', error);
                
                let errorMessage = 'There was an error submitting your form. Please try again.';
                
                if (error.name === 'TypeError' && error.message.includes('fetch')) {
                    errorMessage = 'Network error. Please check your internet connection and try again.';
                } else if (error.message) {
                    errorMessage = error.message;
                }
                
                showNotification(errorMessage, 'error');
                trackFormSubmission('error', 'unknown', error.message);
                
            } finally {
                // Reset button state
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
        
        // Add real-time validation feedback
        addRealTimeValidation(contactForm);
    }
}

// Enhanced real-time validation
function addRealTimeValidation(form) {
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        // Validation on blur
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        // Validation on input for immediate feedback
        input.addEventListener('input', function() {
            if (this.classList.contains('is-invalid')) {
                validateField(this);
            }
        });
    });
    
    // Special handling for phone number formatting
    const phoneInput = form.querySelector('#phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            formatPhoneNumber(e.target);
        });
    }
}

// Field validation function
function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Check required fields
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    }
    
    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    }
    
    // Phone validation
    if (field.type === 'tel' && value) {
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,20}$/;
        if (!phoneRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid phone number';
        }
    }
    
    // Name validation
    if (field.id === 'fullName' && value) {
        if (value.length < 2) {
            isValid = false;
            errorMessage = 'Name must be at least 2 characters long';
        }
    }
    
    // Update field appearance
    if (isValid) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
    } else {
        field.classList.remove('is-valid');
        field.classList.add('is-invalid');
        
        // Update error message
        const feedback = field.parentNode.querySelector('.invalid-feedback');
        if (feedback) {
            feedback.textContent = errorMessage;
        }
    }
    
    return isValid;
}

// Phone number formatting for Malaysian numbers
function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, ''); // Remove non-digits
    
    // Handle Malaysian phone numbers
    if (value.startsWith('60')) {
        // International format starting with 60
        if (value.length <= 11) {
            value = '+' + value.slice(0, 2) + ' ' + value.slice(2, 3) + '-' + value.slice(3, 7) + ' ' + value.slice(7);
        }
    } else if (value.startsWith('0')) {
        // Local Malaysian format starting with 0
        if (value.length <= 11) {
            value = value.slice(0, 3) + '-' + value.slice(3, 7) + ' ' + value.slice(7);
        }
    } else if (value.length > 0) {
        // Other international formats
        if (value.length <= 15) {
            value = '+' + value;
        }
    }
    
    input.value = value.trim();
}

// Analytics tracking for form events
function trackFormSubmission(status, serviceType, details) {
    // Google Analytics 4 tracking
    if (typeof gtag !== 'undefined') {
        gtag('event', 'form_submission', {
            event_category: 'Contact Form',
            event_label: serviceType,
            custom_parameter_1: status,
            custom_parameter_2: details
        });
    }
    
    // Firebase Analytics tracking
    if (typeof firebase !== 'undefined' && firebase.analytics) {
        firebase.analytics().logEvent('contact_form_submission', {
            status: status,
            service_type: serviceType,
            timestamp: new Date().toISOString()
        });
    }
    
    // Console logging for debugging
    console.log('Form submission tracked:', {
        status,
        serviceType,
        details,
        timestamp: new Date().toISOString()
    });
}

// Enhanced notification system with better UX
function showNotification(message, type = 'info', duration = 8000) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 9999;
        max-width: 400px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        border: none;
        border-radius: 12px;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    
    const icon = type === 'success' ? 'check-circle' : 'exclamation-triangle';
    const bgColor = type === 'success' ? '#10b981' : '#ef4444';
    
    notification.innerHTML = `
        <div class="d-flex align-items-start">
            <i class="fas fa-${icon} me-3 mt-1" style="color: ${bgColor}; font-size: 1.2rem;"></i>
            <div class="flex-grow-1">
                <div style="font-weight: 600; margin-bottom: 4px;">
                    ${type === 'success' ? 'Success!' : 'Error'}
                </div>
                <div style="font-size: 0.9rem; line-height: 1.4;">
                    ${message}
                </div>
            </div>
            <button type="button" class="btn-close ms-3" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto-remove after duration
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }, duration);
}

// Connection status monitoring
function monitorConnectionStatus() {
    window.addEventListener('online', function() {
        showNotification('Connection restored. You can now submit the form.', 'success', 3000);
    });
    
    window.addEventListener('offline', function() {
        showNotification('No internet connection. Please check your connection and try again.', 'error', 5000);
    });
}

// Initialize connection monitoring
document.addEventListener('DOMContentLoaded', function() {
    monitorConnectionStatus();
});

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initContactForm,
        validateField,
        formatPhoneNumber,
        trackFormSubmission,
        showNotification
    };
}
