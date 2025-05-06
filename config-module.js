/**
 * config.js - Application configuration
 * TextFixer Frontend
 */

export const Config = {
    /**
     * API URL - Make sure this exactly matches your deployed backend
     */
    API_URL: 'https://textfixer.onrender.com',
    
    /**
     * Available subscription plans
     */
    PLANS: {
        FREE: 'free',
        PRO: 'pro'
    },
    
    /**
     * UI configuration
     */
    UI: {
        BUTTON_LABELS: {
            PRO_SUBMIT: 'Continue to Payment',
            FREE_SUBMIT: 'Create Free Account',
            LOADING: 'Processing...'
        },
        MODAL_TITLES: {
            PRO: 'Get TextFixer Pro',
            FREE: 'Get TextFixer Free'
        }
    },
    
    /**
     * Redirection pages
     */
    PAGES: {
        PRO_SUCCESS: 'success.html',
        FREE_SUCCESS: 'free-success.html'
    }
};
