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
        } else {
            errorElement.textContent = '';
            errorElement.parentElement.classList.remove('has-error');
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

// Handle form submission
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
        return;
    }
    
    // Disable submit button during processing
    submitButton.disabled = true;
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Sending...';
    
    // Collect form data
    const formData = new FormData(form);
    const data = {
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        phone: formData.get('phone') || 'Not provided',
        inquiryType: formData.get('inquiryType'),
        subject: formData.get('subject'),
        message: formData.get('message'),
        timestamp: new Date().toISOString()
    };
    
    // Simulate form submission (in production, send to backend)
    setTimeout(() => {
        try {
            // Store in localStorage for demo purposes
            const submissions = JSON.parse(localStorage.getItem('contactFormSubmissions') || '[]');
            submissions.push(data);
            localStorage.setItem('contactFormSubmissions', JSON.stringify(submissions));
            
            // Show success message
            messageDiv.textContent = 'Thank you! Your message has been sent successfully. We will get back to you shortly.';
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
        } catch (error) {
            messageDiv.textContent = 'An error occurred. Please try again.';
            messageDiv.classList.add('error');
            console.error('Form submission error:', error);
        } finally {
            // Re-enable submit button
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    }, 800);
}

document.addEventListener('DOMContentLoaded', function () {
    // Protect email addresses
    protectEmail();
    
    const toggleButton = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.site-nav');

    if (toggleButton && nav) {
        toggleButton.addEventListener('click', function () {
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
    }

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

    // Contact Form Handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        // Real-time validation
        contactForm.querySelectorAll('input, textarea, select').forEach(field => {
            field.addEventListener('blur', () => {
                if (field.value || field.type === 'checkbox') {
                    validateField(field.name, field.value, field);
                }
            });

            field.addEventListener('input', () => {
                if (field.value && field.classList.contains('has-error')) {
                    validateField(field.name, field.value, field);
                }
            });
        });

        // Form submission
        contactForm.addEventListener('submit', handleFormSubmit);
    }
});