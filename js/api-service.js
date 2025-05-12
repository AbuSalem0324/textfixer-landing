/**
 * api-service.js - API communication layer
 * TextFixer Frontend
 */

export class APIService {
    /**
     * @param {string} baseUrl - Base URL for API endpoints
     */
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }
    
    /**
     @param {string} email - User's email address
 * @param {string} successUrl - URL to redirect after successful payment
 * @param {string} cancelUrl - URL to redirect after cancelled payment
 * @param {string} planId - Plan ID to subscribe to
 * @returns {Promise<Object>} - Checkout session details
 * @throws {Error} - If API call fails
     */
  async createCheckoutSession(email, successUrl, cancelUrl, planId = "pro") {
    try {
        const response = await fetch(`${this.baseUrl}/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                email,
                success_url: successUrl,
                cancel_url: cancelUrl,
                plan_id: planId
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Checkout session error:', errorText);
            throw new Error('Failed to create checkout session');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Checkout session error:', error);
        throw error;
    }
}
    
    /**
     * Create a subscription checkout session
     * @param {string} email - User's email address
     * @param {string} successUrl - URL to redirect after successful payment
     * @param {string} cancelUrl - URL to redirect after cancelled payment
     * @returns {Promise<Object>} - Checkout session details
     * @throws {Error} - If API call fails
     */
    async createCheckoutSession(email, successUrl, cancelUrl) {
        try {
            const response = await fetch(`${this.baseUrl}/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    email,
                    success_url: successUrl,
                    cancel_url: cancelUrl
                })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Checkout session error:', errorText);
                throw new Error('Failed to create checkout session');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Checkout session error:', error);
            throw error;
        }
    }
}