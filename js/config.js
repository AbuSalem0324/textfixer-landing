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
     * Redirection pages
     */
    PAGES: {
    UNIFIED_SUCCESS: 'plan-change-success.html',  // New unified success page
    FREE_SUCCESS: 'free-success.html'             // Keep free-specific page
},
    
    /**
     * UI configuration
     */
    UI: {
        BUTTON_LABELS: {
            PRO_SUBMIT: 'Continue to Payment',
            FREE_SUBMIT: 'Create Free Account',
            LOADING: 'Processing...'
        }
    }
};
