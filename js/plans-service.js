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
                        '20 text fixes per month',
                        'Up to 500 characters per fix',
                        'Basic grammar fixing',
                        'Works in any app',
                        'No credit card required'
                    ]
                },
                {
                    id: 'basic',
                    name: 'Basic Plan',
                    price: 2.99,
                    features: [
                        'Unlimited text corrections',
                        'Up to 2000 characters per fix',
                        'Standard grammar and style improvements',
                        'Works in any app',
                        'Cancel anytime'
                    ]
                },
                {
                    id: 'pro',
                    name: 'Pro Plan',
                    price: 4.99,
                    features: [
                        'Unlimited text corrections',
                        'No word limit per fix',
                        'Advanced style improvements',
                        'Priority processing',
                        'Use on multiple devices',
                        'Cancel anytime'
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