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
    // Sometimes the URL might have additional path components or be slightly different
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
    
    // Check the health of the API to validate it's reachable
    async function checkApiHealth() {
        try {
            console.log('Checking API health at:', `${API_URL}/health`);
            const response = await fetch(`${API_URL}/health`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('API health check successful:', data);
                return { status: true, data };
            } else {
                console.warn('API health check failed with status:', response.status);
                return { status: false, error: `Status code: ${response.status}` };
            }
        } catch (error) {
            console.error('API health check error:', error);
            return { status: false, error: error.message };
        }
    }
    
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
        
        // First check if API is reachable
        const healthCheck = await checkApiHealth();
        formError.textContent = '';
        
        if (!healthCheck.status) {
            formError.textContent = 'Cannot connect to the service. Please try again later.';
            console.error('API health check failed before submission:', healthCheck.error);
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
            return;
        }
        
        try {
            if (selectedPlan === 'pro') {
                // Pro plan - Stripe checkout
                console.log('Sending request to:', `${API_URL}/subscribe`);
                const response = await fetch(`${API_URL}/subscribe`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ 
                        email: email,
                        success_url: new URL('/success.html', window.location.origin).href,
                        cancel_url: new URL('/index.html', window.location.origin).href
                    })
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Error response:', errorText);
                    try {
                        const errorJson = JSON.parse(errorText);
                        throw new Error(errorJson.error || 'Subscription request failed');
                    } catch (jsonError) {
                        throw new Error(`Subscription request failed (${response.status})`);
                    }
                }
                
                const data = await response.json();
                
                if (data.checkout_url) {
                    // Redirect to Stripe checkout
                    window.location.href = data.checkout_url;
                } else {
                    throw new Error('No checkout URL returned');
                }
            } else {
                // Free plan - direct registration
                console.log('Sending request to:', `${API_URL}/register-free`);
                
                // Check if the /register-free endpoint exists or if we should use /admin/create_user
                // Some deployments might use the admin endpoint instead
                let endpoint = '/register-free';
                
                const response = await fetch(`${API_URL}${endpoint}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ 
                        email: email,
                        send_email: true
                    })
                });
                
                if (!response.ok) {
                    if (response.status === 404 && endpoint === '/register-free') {
                        // If register-free is not found, try the admin endpoint
                        console.log('Falling back to admin endpoint');
                        endpoint = '/admin/create_user';
                        
                        const adminResponse = await fetch(`${API_URL}${endpoint}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            },
                            body: JSON.stringify({ 
                                email: email,
                                send_email: true
                            })
                        });
                        
                        if (!adminResponse.ok) {
                            const errorText = await adminResponse.text();
                            console.error('Admin endpoint error response:', errorText);
                            throw new Error(`Registration failed (${adminResponse.status})`);
                        }
                        
                        const adminData = await adminResponse.json();
                        console.log('Registration successful via admin endpoint:', adminData);
                        
                        // Redirect to free success page
                        window.location.href = new URL('/free-success.html', window.location.origin).href;
                        return;
                    }
                    
                    const errorText = await response.text();
                    console.error('Error response:', errorText);
                    try {
                        const errorJson = JSON.parse(errorText);
                        throw new Error(errorJson.error || 'Registration failed');
                    } catch (jsonError) {
                        throw new Error(`Registration failed (${response.status})`);
                    }
                }
                
                const data = await response.json();
                console.log('Registration successful:', data);
                
                // Redirect to free success page
                window.location.href = new URL('/free-success.html', window.location.origin).href;
            }
            
        } catch (error) {
            formError.textContent = error.message || 'An error occurred. Please try again.';
            console.error('Form submission error:', error);
            
            // Reset button
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        }
    });
    
    // Check API health when the page loads
    (async function() {
        const health = await checkApiHealth();
        if (!health.status) {
            console.warn('API might not be available. Features requiring API calls may not work correctly.');
        }
    })();
});
