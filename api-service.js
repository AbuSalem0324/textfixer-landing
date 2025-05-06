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
     * Create a user account via API
     * @param {string} email - User's email address
     * @param {boolean} sendEmail - Whether to send welcome email
     * @returns {Promise<Object>} - API response data
     * @throws {Error} - If API call fails
     */
    async createUserAccount(email, sendEmail = true) {
        try {
            const response = await fetch(`${this.baseUrl}/admin/create_user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    email: email,
                    send_email: sendEmail
                })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API error:', errorText);
                throw new Error('Failed to create user account');
            }
            
            return await response.json();
        } catch (error) {
            console.error('API service error:', error);
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
