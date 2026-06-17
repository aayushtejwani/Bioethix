// Email obfuscation to prevent spam harvesting
function protectEmail() {
    const emailElements = document.querySelectorAll('[data-email]');
    emailElements.forEach(el => {
        const encoded = el.getAttribute('data-email');
        const decoded = atob(encoded);
        
        if (el.tagName === 'A' && el.href.startsWith('mailto:')) {
            el.href = 'mailto:' + decoded;
            el.textContent = decoded;
        } else {
            el.textContent = decoded;
        }
    });
}

// Form Validation Rules
const formValidation = {
    fullName: {
        validate: (value) => value.trim().length >= 2,
        message: 'Full name must be at least 2 characters'
    },
    email: {
        validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: 'Please enter a valid email address'
    },
    phone: {
        validate: (value) => !value || /^[\d+\-\(\)\s]{7,}$/.test(value),
        message: 'Please enter a valid phone number'
    },
    inquiryType: {
        validate: (value) => value.length > 0,
        message: 'Please select an inquiry type'
    },
    subject: {
        validate: (value) => value.trim().length >= 5,
        message: 'Subject must be at least 5 characters'
    },
    message: {
        validate: (value) => value.trim().length >= 10,
        message: 'Message must be at least 10 characters'
    },
    terms: {
        validate: (value, element) => element.checked,
        message: 'You must agree to the terms'
    }
};

// Validate individual field
function validateField(name, value, element = null) {
    if (!formValidation[name]) return true;
    
    const rule = formValidation[name];
    const isValid = rule.validate(value, element);
    const errorElement = document.getElementById(`${name}Error`);
    
    if (errorElement) {
        if (!isValid) {
            errorElement.textContent = rule.message;
            errorElement.parentElement.classList.add('has-error');
            // Mobile-specific: Add shake animation for errors
            if (window.innerWidth <= 768) {
                errorElement.style.animation = 'shake 0.4s ease';
                setTimeout(() => errorElement.style.animation = '', 400);
            }
        } else {
            errorElement.textContent = '';
            errorElement.parentElement.classList.remove('has-error');
        }
    }
    
    // Mobile-specific: Add visual feedback
    if (element && window.innerWidth <= 768) {
        if (!isValid) {
            element.classList.add('invalid');
            element.classList.remove('valid');
        } else {
            element.classList.remove('invalid');
            element.classList.add('valid');
        }
    }
    
    return isValid;
}

// Validate entire form
function validateForm(form) {
    let isValid = true;
    const formData = new FormData(form);
    
    for (let [name, value] of formData) {
        const element = form.elements[name];
        if (!validateField(name, value, element)) {
            isValid = false;
        }
    }
    
    return isValid;
}

// Handle form submission - WhatsApp Integration
function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('.btn-submit');
    const messageDiv = document.getElementById('formMessage');
    
    // Clear previous message
    messageDiv.textContent = '';
    messageDiv.classList.remove('success', 'error');
    
    // Validate form
    if (!validateForm(form)) {
        messageDiv.textContent = 'Please fix the errors above';
        messageDiv.classList.add('error');
        // Mobile-specific: Scroll to first error
        if (window.innerWidth <= 768) {
            const firstError = form.querySelector('.invalid, .has-error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
        return;
    }
    
    // Disable submit button during processing
    submitButton.disabled = true;
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Sending...';
    
    // Mobile-specific: Add loading indicator
    if (window.innerWidth <= 768) {
        submitButton.insertAdjacentHTML('afterbegin', '<span class="loading-spinner"></span>');
    }
    
    // Collect form data
    const formData = new FormData(form);
    const fullName = formData.get('fullName');
    const email = formData.get('email');
    const phone = formData.get('phone') || 'Not provided';
    const inquiryType = formData.get('inquiryType');
    const subject = formData.get('subject');
    const message = formData.get('message');
    
    // Format inquiry type for readability
    const inquiryTypeMap = {
        'product': 'Product Information',
        'distribution': 'Distribution Partnership',
        'corporate': 'Corporate Query',
        'other': 'Other'
    };
    const formattedInquiryType = inquiryTypeMap[inquiryType] || inquiryType;
    
    // Construct WhatsApp message
    const whatsappMessage = `
📩 *New Contact Form Submission* 📩

👤 *Name:* ${fullName}
📧 *Email:* ${email}
📞 *Phone:* ${phone}
📝 *Inquiry Type:* ${formattedInquiryType}
📌 *Subject:* ${subject}

💬 *Message:*
${message}

---
*Sent via BioEthix Contact Form*
`;
    
    // URL encode the message
    const encodedMessage = encodeURIComponent(whatsappMessage);
    
    // Replace with your actual WhatsApp business number
    const whatsappNumber = '919649009945'; // +91-9649009945
    
    // Construct WhatsApp URL
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    // Show success message
    messageDiv.textContent = 'Thank you! Redirecting to WhatsApp...';
    messageDiv.classList.add('success');
    
    // Reset form
    form.reset();
    
    // Clear field errors
    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
    });
    document.querySelectorAll('.form-group').forEach(el => {
        el.classList.remove('has-error');
    });
    document.querySelectorAll('.valid, .invalid').forEach(el => {
        el.classList.remove('valid', 'invalid');
    });
    
    // Re-enable submit button
    submitButton.disabled = false;
    submitButton.textContent = originalText;
    // Remove loading spinner
    const spinner = submitButton.querySelector('.loading-spinner');
    if (spinner) spinner.remove();
    
    // Redirect to WhatsApp after a brief delay
    setTimeout(() => {
        window.open(whatsappUrl, '_blank');
    }, 1000);
}

// Setup mobile form enhancements
function setupMobileFormEnhancements() {
    // Add CSS for mobile form validation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-5px); }
            40%, 80% { transform: translateX(5px); }
        }
        
        @media (max-width: 768px) {
            input:focus, textarea:focus {
                outline: none;
                box-shadow: 0 0 0 3px rgba(90, 160, 255, 0.2);
            }
            
            input.valid, textarea.valid {
                border-color: #52c41a;
            }
            
            input.invalid, textarea.invalid {
                border-color: #ff4d4f;
            }
            
            .btn-submit:active {
                transform: translateY(2px);
            }
            
            .loading-spinner {
                display: inline-block;
                width: 16px;
                height: 16px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                border-top-color: #fff;
                animation: spin 1s ease-in-out infinite;
                margin-right: 8px;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        }
    `;
    document.head.appendChild(style);
    
    // Set input modes and autocomplete attributes
    const formInputs = document.querySelectorAll('#contactForm input, #contactForm textarea');
    formInputs.forEach(input => {
        // Set autocomplete attributes
        if (input.name === 'fullName') input.autocomplete = 'name';
        if (input.name === 'email') input.autocomplete = 'email';
        if (input.name === 'phone') input.autocomplete = 'tel';
        if (input.name === 'subject' || input.name === 'message') input.autocomplete = 'off';
        
        // Mobile-specific validation
        input.addEventListener('blur', () => {
            if (input.value || input.type === 'checkbox') {
                validateField(input.name, input.value, input);
            }
        });
        
        input.addEventListener('input', () => {
            if (input.value && input.classList.contains('invalid')) {
                validateField(input.name, input.value, input);
            }
        });
        
        // Touch-specific handling
        if ('ontouchstart' in window) {
            input.addEventListener('focus', () => {
                input.classList.add('touch-active');
            });
            
            input.addEventListener('blur', () => {
                input.classList.remove('touch-active');
            });
        }
    });
    
    // Form submission enhancement
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }
}

// Initialize form enhancements when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Protect email addresses
    protectEmail();
    
    // Mobile menu setup
    const toggleButton = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.site-nav');
    
    if (toggleButton && nav) {
        toggleButton.addEventListener('click', function (e) {
            e.stopPropagation();
            const expanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', String(!expanded));
            this.classList.toggle('active');
            nav.classList.toggle('open');
        });

        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function () {
                if (nav.classList.contains('open')) {
                    nav.classList.remove('open');
                    toggleButton.classList.remove('active');
                    toggleButton.setAttribute('aria-expanded', 'false');
                }
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function (e) {
            if (!nav.contains(e.target) && !toggleButton.contains(e.target)) {
                if (nav.classList.contains('open')) {
                    nav.classList.remove('open');
                    toggleButton.classList.remove('active');
                    toggleButton.setAttribute('aria-expanded', 'false');
                }
            }
        });
    }
    
    // Setup product card interactions
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('click', () => {
            const isExpanded = card.classList.contains('expanded');
            productCards.forEach(other => other.classList.remove('expanded'));
            if (!isExpanded) {
                card.classList.add('expanded');
            }
        });
    });
    
    // Setup vision card interaction
    const visionCard = document.querySelector('.vision-card');
    if (visionCard) {
        visionCard.addEventListener('click', () => {
            visionCard.classList.toggle('pop');
        });
        visionCard.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                visionCard.classList.toggle('pop');
            }
        });
    }
    
    // Initialize mobile form enhancements
    setupMobileFormEnhancements();
});