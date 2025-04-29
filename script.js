document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const modal = document.getElementById('subscription-modal');
    const subscribeButton = document.getElementById('subscribe-button');
    const subscribeMonthly = document.getElementById('subscribe-monthly');
    const tryFreeButton = document.getElementById('try-free');
    const closeButton = document.querySelector('.close-button');
    const subscriptionForm = document.getElementById('subscription-form');
    const formError = document.getElementById('form-error');
    
    // API URL - Make sure this exactly matches your Render deployment URL
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
        formError.textContent = '';
        
        try {
            if (selectedPlan === 'pro') {
                // Pro plan - Stripe checkout
                console.log('Sending pro subscription request');
                
                // Use the admin/create_user endpoint since it's confirmed to be registered
                const response = await fetch(`${API_URL}/admin/create_user`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        email: email
                    })
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Admin endpoint error:', errorText);
                    throw new Error('Failed to create user account');
                }
                
                const data = await response.json();
                console.log('User created successfully:', data);
                
                // For GitHub Pages at root
                console.log('Redirecting to success.html');
                
                // Redirect to success page with API key
                window.location.href = `/success.html${data.api_key ? `?api_key=${data.api_key}` : ''}`;
            } else {
                // Free plan - use admin/create_user endpoint
                console.log('Creating free account');
                
                const response = await fetch(`${API_URL}/admin/create_user`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        email: email
                    })
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Admin endpoint error:', errorText);
                    throw new Error('Failed to create free account');
                }
                
                const data = await response.json();
                console.log('Free account created successfully:', data);
                
                // For GitHub Pages at root
                console.log('Redirecting to free-success.html');
                
                // Redirect to free success page
                window.location.href = '/free-success.html';
            }
        } catch (error) {
            formError.textContent = error.message || 'An error occurred. Please try again.';
            console.error('Form submission error:', error);
            
            // Reset button
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        }
    });
});
