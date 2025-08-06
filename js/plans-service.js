/**
 * plans-service.js - Plans API service
 * TextFixer Frontend
 */

export class PlansService {
    /**
     * @param {string} baseUrl - Base URL for API endpoints
     */
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.plans = null;
    }
    
    /**
     * Get all available subscription plans
     * @returns {Promise<Array>} List of plan objects
     */
    async getPlans() {
        // Return cached plans if available
        if (this.plans) {
            return this.plans;
        }
        
        try {
            const response = await fetch(`${this.baseUrl}/plans`);
            if (!response.ok) {
                throw new Error('Failed to fetch plans');
            }
            
            const data = await response.json();
            this.plans = data.plans;
            return this.plans;
        } catch (error) {
            console.error('Error fetching plans:', error);
            // Return default plans as fallback
            return [
                {
                    id: 'free',
                    name: 'Free Plan',
                    price: 0,
                    features: [
                        '20 fixes / month',
                        'Up to 500 characters per fix',
                        'Access on all platforms',
                        'Use across multiple devices',
                        'No credit card required'
                    ]
                },
                {
                    id: 'basic',
                    name: 'Basic Plan',
                    price: 2.99,
                    features: [
                        '250 fixes / month',
                        'Up to 2,000 characters per fix',
                        'Access on all platforms',
                        'Cancel anytime'
                    ]
                },
                {
                    id: 'pro',
                    name: 'Pro Plan',
                    price: 5.99,
                    features: [
                        'Unlimited text corrections',
                        'No character limit per fix',
                        'Access on all platforms'
                    ]
                }
            ];
        }
    }
    
    /**
     * Get a specific plan by ID
     * @param {string} planId - Plan identifier
     * @returns {Promise<Object>} Plan details
     */
    async getPlan(planId) {
        const plans = await this.getPlans();
        return plans.find(plan => plan.id === planId);
    }
}