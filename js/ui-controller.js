/**
 * ui-controller.js - UI management and event handling
 * TextFixer Frontend
 */

import { Config } from './config.js';

export class UIController {
    /**
     * @param {Object} apiService - API service instance
     * @param {Object} navigationService - Navigation service instance
     * @param {Object} plans - Available subscription plans
     */
    constructor(apiService, navigationService, plans) {
        this.apiService = apiService;
        this.navigationService = navigationService;
        this.plans = plans;
        
        // Internal state
        this.state = {
            selectedPlan: plans.PRO
        };
        
        // DOM elements will be cached during initialization
        this.elements = {};
    }
    
    /**
     * Initialize the UI controller
     */
    init() {
        this.cacheElements();
        this.setupEventListeners();
    }
    
    /**
     * Cache DOM elements for better performance
     */
    cacheElements() {
        this.elements = {
            modal: document.getElementById('subscription-modal'),
            subscribeButton: document.getElementById('subscribe-button'),
            subscribeMonthly: document.getElementById('subscribe-monthly'),
            tryFreeButton: document.getElementById('try-free'),
            closeButton: document.querySelector('.close-button'),
            subscriptionForm: document.getElementById('subscription-form'),
            formError: document.getElementById('form-error'),
            modalTitle: document.querySelector('.modal-content h2'),
            submitButton: document.querySelector('.modal-content button[type="submit"]'),
            emailInput: document.getElementById('email')
        };
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Pro subscription buttons
        this.elements.subscribeButton.addEventListener('click', 
            () => this.openModal(this.plans.PRO));
            
        this.elements.subscribeMonthly.addEventListener('click', 
            () => this.openModal(this.plans.PRO));
        
        // Free tier button
        this.elements.tryFreeButton.addEventListener('click', 
            () => this.openModal(this.plans.FREE));
        
        // Modal close button
        this.elements.closeButton.addEventListener('click', 
            () => this.closeModal());
        
        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === this.elements.modal) {
                this.closeModal();
            }
        });
        
        // Form submission
        this.elements.subscriptionForm.addEventListener('submit', 
            (event) => this.handleFormSubmit(event));
    }
    
    /**
     * Open the modal with appropriate settings for the selected plan
     * @param {string} plan - Selected plan type
     */
    openModal(plan) {
        this.state.selectedPlan = plan;
        
        if (plan === this.plans.PRO) {
            this.elements.modalTitle.textContent = Config.UI.MODAL_TITLES.PRO;
            this.elements.submitButton.textContent = Config.UI.BUTTON_LABELS.PRO_SUBMIT;
        } else {
            this.elements.modalTitle.textContent = Config.UI.MODAL_TITLES.FREE;
            this.elements.submitButton.textContent = Config.UI.BUTTON_LABELS.FREE_SUBMIT;
        }
        
        this.elements.modal.style.display = 'block';
    }
    
    /**
     * Close the modal
     */
    closeModal() {
        this.elements.modal.style.display = 'none';
        this.resetForm();
    }
    
    /**
     * Reset the form to its initial state
     */
    resetForm() {
        this.elements.subscriptionForm.reset();
        this.elements.formError.textContent = '';
    }
    
    /**
     * Handle form submission
     * @param {Event} event - Form submission event
     */
    async handleFormSubmit(event) {
        event.preventDefault();
        
        const email = this.elements.emailInput.value;
        
        if (!email) {
            this.showError('Please enter your email address');
            return;
        }
        
        // Show loading state
        const originalButtonText = this.elements.submitButton.textContent;
        this.setLoadingState(true);
        
        try {
            // Determine subscription type based on selected plan
            const subscriptionType = this.state.selectedPlan === this.plans.PRO ? "pro" : "free";
            console.log(`Creating user account with subscription type: ${subscriptionType}`);
            
            // Create user account via API with the correct subscription type
            const data = await this.apiService.createUserAccount(email, subscriptionType);
            
            if (this.state.selectedPlan === this.plans.PRO) {
                // For PRO plans, create a checkout session and redirect to Stripe
                try {
                    const checkoutData = await this.apiService.createCheckoutSession(
                        email,
                        window.location.origin + '/' + Config.PAGES.PRO_SUCCESS,
                        window.location.origin + '/' + Config.PAGES.CANCEL
                    );
                    
                    // Redirect to Stripe checkout
                    window.location.href = checkoutData.checkout_url;
                    return;
                } catch (checkoutError) {
                    console.error('Checkout error:', checkoutError);
                    this.showError('Failed to create checkout session. Please try again.');
                    this.setLoadingState(false, originalButtonText);
                    return;
                }
            }
            
            // For FREE plans, redirect to success page
            this.handleSuccessfulRegistration(data);
        } catch (error) {
            this.showError(error.message || 'An error occurred. Please try again.');
            console.error('Form submission error:', error);
            this.setLoadingState(false, originalButtonText);
        }
    }
    
    /**
     * Handle successful registration response
     * @param {Object} data - User account data from API
     */
    handleSuccessfulRegistration(data) {
        const isPro = this.state.selectedPlan === this.plans.PRO;
        const successPage = isPro ? Config.PAGES.PRO_SUCCESS : Config.PAGES.FREE_SUCCESS;
        
        // Prepare URL parameters
        const params = {};
        if (data.api_key) {
            params.api_key = data.api_key;
        }
        
        // Navigate to success page
        this.navigationService.navigateToPage(successPage, params);
    }
    
    /**
     * Set the loading state of the submit button
     * @param {boolean} isLoading - Whether loading is in progress
     * @param {string} [originalText] - Original button text to restore when done
     */
    setLoadingState(isLoading, originalText = null) {
        if (isLoading) {
            this.elements.submitButton.textContent = Config.UI.BUTTON_LABELS.LOADING;
            this.elements.submitButton.disabled = true;
            this.elements.formError.textContent = '';
        } else {
            this.elements.submitButton.textContent = originalText;
            this.elements.submitButton.disabled = false;
        }
    }
    
    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    showError(message) {
        this.elements.formError.textContent = message;
    }
}