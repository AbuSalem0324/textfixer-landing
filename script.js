document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const modal = document.getElementById('subscription-modal');
    const subscribeButton = document.getElementById('subscribe-button');
    const subscribeMonthly = document.getElementById('subscribe-monthly');
    const closeButton = document.querySelector('.close-button');
    const subscriptionForm = document.getElementById('subscription-form');
    const formError = document.getElementById('form-error');
    
    // Replace with your actual API URL
    const API_URL = 'https://textfixer.onrender.com';
    
    // Open modal when subscribe button is clicked
    subscribeButton.addEventListener('click', function() {
        modal.style.display = 'block';
    });
    
    subscribeMonthly.addEventListener('click', function() {
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
            // Make a real API call to our backend
            const response = await fetch(`${API_URL}/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    email: email,
                    success_url: window.location.origin + '/success.html',
                    cancel_url: window.location.origin + '/index.html'
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
            
        } catch (error) {
            formError.textContent = error.message || 'An error occurred. Please try again.';
            
            // Reset button
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        }
    });
    
    // Replace placeholder image with an actual screenshot if available
    const heroImage = document.getElementById('hero-image');
    if (heroImage) {
        // Here you could dynamically load different images based on device
        // For now, we'll just stick with the default
    }
});
