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
    const API_URL = 'https://your-textfixer-api.render.com';
    
    // Track which plan was selected
    let selectedPlan = 'pro'; // Default to pro plan
    
    // Open modal when buttons are clicked
    if (subscribeButton) {
        subscribeButton.addEventListener('click', function() {
            selectedPlan = 'pro';
            document.querySelector('.modal-content h2').textContent = 'Get TextFixer Pro';
            document.querySelector('.modal-content button[type="submit"]').textContent = 'Continue to Payment';
            modal.style.display = 'block';
        });
    }
    
    if (subscribeMonthly) {
        subscribeMonthly.addEventListener('click', function() {
            selectedPlan = 'pro';
            document.querySelector('.modal-content h2').textContent = 'Get TextFixer Pro';
            document.querySelector('.modal-content button[type="submit"]').textContent = 'Continue to Payment';
            modal.style.display = 'block';
        });
    }
    
    if (tryFreeButton) {
        tryFreeButton.addEventListener('click', function() {
            console.log('Free button clicked'); // Debug log
            selectedPlan = 'free';
            document.querySelector('.modal-content h2').textContent = 'Get TextFixer Free';
            document.querySelector('.modal-content button[type="submit"]').textContent = 'Create Free Account';
            modal.style.display = 'block';
        });
    } else {
        console.error('Free button not found!'); // Error log
    }
    
    // Rest of your code...
    // ...
});
