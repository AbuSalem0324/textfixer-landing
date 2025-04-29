document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const modal = document.getElementById('subscription-modal');
    const subscribeButton = document.getElementById('subscribe-button');
    const subscribeMonthly = document.getElementById('subscribe-monthly');
    const tryFreeButton = document.getElementById('try-free');
    const closeButton = document.querySelector('.close-button');
    const subscriptionForm = document.getElementById('subscription-form');
    const formError = document.getElementById('form-error');
    
    // Replace with your actual API URL
    const API_URL = 'https://textfixer.onrender.com';
    
    // Track which plan was selected
    let selectedPlan = 'pro'; // Default to pro plan
    
    // Open modal when buttons are clicked
    subscribeButton.addEventListener('click', function() {
        selectedPlan = 'pro';
        document.querySelector('.modal-content h2').textContent = 'Get TextFixer Pro';
        document.querySelector('.modal-content button[type="submit"]').textContent = 'Continue to Payment';
        modal.style.display = 'block';
    });
    
    subscribeMonthly.addEventListener('click', function() {
        selectedPlan = 'pro';
        document.querySelector('.modal-content h2').textContent = 'Get TextFixer Pro';
        document.querySelector('.modal-content button[type="submit"]').textContent = 'Continue to Payment';
        modal.style.display = 'block';
    });
    
    tryFreeButton.addEventListener('click', function() {
        selectedPlan = 'free';
        document.querySelector('.modal-content h2').textContent = 'Get TextFixer Free';
        document.querySelector('.modal-content button[type="submit"]').textContent = 'Create Free Account';
        modal.style.display = 'block';
    });
    
    // Close modal when close button is clicked
    closeButton.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Handle form submission
    subscriptionForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const email = document.getElementById('email').value;
        
        if (!email) {
            formError.textContent = 'Please enter your email address';
            return;
        }
        
        // Show loading state
        const submitButton = subscriptionForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Processing...';
        submitButton.disabled = true;
        
        try {
            if (selectedPlan === 'pro') {
                // Pro plan - Stripe checkout
                const response = await fetch(`${API_URL}/subscribe`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        email: email,
                        // Fix the success and cancel URLs to use the correct path construction
                        success_url: new URL('/success.html', window.location.origin).href,
                        cancel_url: new URL('/index.html', window.location.origin).href
                    })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Subscription request failed');
                }
                
                if (data.checkout_url) {
                    // Redirect to Stripe checkout
                    window.location.href = data.checkout_url;
                } else {
                    throw new Error('No checkout URL returned');
                }
            } else {
                // Free plan - direct registration
                const response = await fetch(`${API_URL}/register-free`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        email: email
                    })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Registration failed');
                }
                
                // Redirect to free success page with correct path construction
                window.location.href = new URL('/free-success.html', window.location.origin).href;
            }
            
        } catch (error) {
            formError.textContent = error.message || 'An error occurred. Please try again.';
            console.error('Error:', error);
            
            // Reset button
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        }
    });
    
    // Remove the hero image reference as it doesn't exist in the HTML structure
    // The hero image in index.html is using an iframe, not an img element
});
