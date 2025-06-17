/**
 * ui-controller.js - UI management and event handling
 * TextFixer Frontend
 */

import { Config } from './config.js';
import { PlansService } from './plans-service.js';
import { PlanCard } from './components/plan-card.js';

export class UIController {
    /**
     * @param {Object} apiService - API service instance
     * @param {Object} navigationService - Navigation service instance
     */
    constructor(apiService, navigationService) {
        this.apiService = apiService;
        this.navigationService = navigationService;
        this.plansService = new PlansService(apiService.baseUrl);
        
        // Internal state
        this.state = {
            selectedPlanId: null,
            plans: []
        };
        
        // DOM elements will be cached during initialization
        this.elements = {};
        
        // Make this instance available globally for event delegation
        window.uiController = this;
    }
    
    /**
     * Initialize the UI controller
     */
    async init() {
        this.cacheElements();
        this.setupEventListeners();
        
        // Load plans
        try {
            const plans = await this.plansService.getPlans();
            this.state.plans = plans;
            
            // Render plans if pricing section exists
            const pricingContainer = document.querySelector('.plan-comparison');
            if (pricingContainer) {
                this.renderPlans(pricingContainer);
            }
        } catch (error) {
            console.error('Failed to load plans:', error);
        }
    }
    
    /**
     * Render plans to the specified container
     * @param {HTMLElement} container - Container to render plans into
     */
    renderPlans(container) {
        // Clear container
        container.innerHTML = '';
        
        // Sort plans by price to ensure proper order
        const sortedPlans = [...this.state.plans].sort((a, b) => a.price - b.price);
        
        // Determine which plan to highlight
      let featuredPlanId = 'basic';
        
        // If we have exactly 3 plans, highlight the middle one (basic)
        if (sortedPlans.length === 3) {
            featuredPlanId = sortedPlans[1].id;
        }
        
        // Render each plan
        sortedPlans.forEach(plan => {
            const isFeatured = plan.id === featuredPlanId;
            new PlanCard(
                plan, 
                isFeatured,
                (planId) => this.openModal(planId)
            ).render(container);
        });
    }
    
    /**
     * Cache DOM elements for better performance
     */
    cacheElements() {
        this.elements = {
            modal: document.getElementById('subscription-modal'),
            mainCta: document.getElementById('main-cta'),
            closeButton: document.querySelector('.close-button'),
            subscriptionForm: document.getElementById('subscription-form'),
            formError: document.getElementById('form-error'),
            modalTitle: document.querySelector('.modal-content h2'),
            submitButton: document.querySelector('.modal-content button[type="submit"]'),
            emailInput: document.getElementById('email'),
            turnstileContainer: document.getElementById('turnstile-container'),
            turnstileWidget: document.getElementById('turnstile-widget')
        };
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Main CTA button
        if (this.elements.mainCta) {
            this.elements.mainCta.addEventListener('click', () => this.openModal('pro'));
        }
        
        // Modal close button
        if (this.elements.closeButton) {
            this.elements.closeButton.addEventListener('click', () => this.closeModal());
        }
        
        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === this.elements.modal) {
                this.closeModal();
            }
        });
        
        // Form submission
        if (this.elements.subscriptionForm) {
            this.elements.subscriptionForm.addEventListener('submit', 
                (event) => this.handleFormSubmit(event));
        }
    }
    
    /**
     * Open the modal with appropriate settings for the selected plan
     * @param {string} planId - Selected plan ID
     */
    async openModal(planId) {
        this.state.selectedPlanId = planId;
        
        // Get plan details
        const plan = await this.plansService.getPlan(planId);
        
        if (plan) {
            // Update modal title and button text based on plan
            if (plan.price > 0) {
                this.elements.modalTitle.textContent = `Get ${plan.name}`;
                this.elements.submitButton.textContent = Config.UI.BUTTON_LABELS.PRO_SUBMIT;
                // Hide Turnstile for paid plans
                this.elements.turnstileContainer.style.display = 'none';
            } else {
                this.elements.modalTitle.textContent = `Get ${plan.name}`;
                this.elements.submitButton.textContent = Config.UI.BUTTON_LABELS.FREE_SUBMIT;
                // Show and render Turnstile for free plans
                this.elements.turnstileContainer.style.display = 'block';
                this.renderTurnstile();
            }
        }
        
        this.elements.modal.style.display = 'flex';
    }
    

        /**
     * Render Turnstile widget for free plan verification
     */
    renderTurnstile() {
        // Clear any existing widget
        this.elements.turnstileWidget.innerHTML = '';
        
        // Render new Turnstile widget
        if (window.turnstile) {
            this.turnstileWidgetId = window.turnstile.render(this.elements.turnstileWidget, {
                sitekey: Config.TURNSTILE.SITE_KEY,
                callback: (token) => {
                    this.turnstileToken = token;
                    console.log('Turnstile validation successful');
                },
                'error-callback': () => {
                    this.turnstileToken = null;
                    this.showError('Verification failed. Please try again.');
                },
                'expired-callback': () => {
                    this.turnstileToken = null;
                    this.showError('Verification expired. Please verify again.');
                }
            });
        } else {
            console.error('Turnstile not loaded');
            this.showError('Security verification unavailable. Please refresh the page.');
        }
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
    
    // Reset terms checkbox
    document.getElementById('terms-checkbox').checked = false;
    
    // Reset Turnstile if it exists
    if (this.turnstileWidgetId && window.turnstile) {
        window.turnstile.reset(this.turnstileWidgetId);
    }
    this.turnstileToken = null;
}
    
    /**
     * Handle form submission
     * @param {Event} event - Form submission event
     */
/**
 * Handle form submission
 * @param {Event} event - Form submission event
 */
/**
 * Handle form submission
 * @param {Event} event - Form submission event
 */
async handleFormSubmit(event) {
    event.preventDefault();
    
    const email = this.elements.emailInput.value;
    const termsAccepted = document.getElementById('terms-checkbox').checked;
    
    // Validate email
    if (!email) {
        this.showError('Please enter your email address');
        return;
    }
    
    // Validate terms acceptance
    if (!termsAccepted) {
        this.showError('Please accept the Terms of Service and Privacy Policy to continue');
        return;
    }
    
    // Show loading state
    const originalButtonText = this.elements.submitButton.textContent;
    this.setLoadingState(true);
    
    try {
        // Get the selected plan
        const plan = await this.plansService.getPlan(this.state.selectedPlanId);
        
        if (!plan) {
            throw new Error('Selected plan not found');
        }
        
        if (plan.price > 0) {
            // For PAID plans, go directly to Stripe checkout
            try {
                const successUrl = this.navigationService.constructPath(Config.PAGES.UNIFIED_SUCCESS);
                const cancelUrl = this.navigationService.constructPath('index.html');
                
                console.log('Creating checkout session for', plan.id, 'plan');
                
                const checkoutData = await this.apiService.createCheckoutSession(
                    email,
                    successUrl,
                    cancelUrl,
                    plan.id
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
        } else {
            // For FREE plans, validate Turnstile first
            if (!this.turnstileToken) {
                this.showError('Please complete the security verification');
                this.setLoadingState(false, originalButtonText);
                return;
            }
            
            // Create user account with Turnstile token
            const data = await this.apiService.createUserAccount(email, plan.id, this.turnstileToken);
            this.handleSuccessfulRegistration(data);
        }
    } catch (error) {
        this.showError(error.message || 'An error occurred. Please try again.');
        console.error('Form submission error:', error);
        this.setLoadingState(false, originalButtonText);
    }
}

// Also update the resetForm method to reset the checkbox
resetForm() {
    this.elements.subscriptionForm.reset();
    this.elements.formError.textContent = '';
    
    // Reset terms checkbox
    document.getElementById('terms-checkbox').checked = false;
    
    // Reset Turnstile if it exists
    if (this.turnstileWidgetId && window.turnstile) {
        window.turnstile.reset(this.turnstileWidgetId);
    }
    this.turnstileToken = null;
}
    
    /**
     * Handle successful registration response
     * @param {Object} data - User account data from API
     */
    /**
 * Handle successful registration response
 * @param {Object} data - User account data from API
 */
handleSuccessfulRegistration(data) {
    const isPaid = this.state.selectedPlanId !== 'free';
    
    // For PAID plans, redirect to Stripe checkout
    // After payment, Stripe will redirect to unified success page
    if (isPaid) {
        // This method won't be called for paid plans in normal flow
        // as they redirect to Stripe checkout before reaching here
        return;
    }
    
    // For FREE plans, check if this is a new user or existing user
    if (data.is_new_user) {
        // New free user - use welcome page
        this.navigationService.navigateToPage(Config.PAGES.FREE_SUCCESS, {
            user_id: data.user_id
        });
    } else {
        // Existing user downgrading to free - use unified page
        this.navigationService.navigateToPage(Config.PAGES.UNIFIED_SUCCESS, {
            user_id: data.user_id
        });
    }
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