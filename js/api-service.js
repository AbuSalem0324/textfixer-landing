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
     * Create a new user account
     * @param {string} email - User's email address
     * @param {string} subscriptionType - Type of subscription ("free" or "pro")
     * @returns {Promise<Object>} - User account details
     * @throws {Error} - If API call fails
     */
    async createUserAccount(email, subscriptionType = "free", turnstileToken = null) {
        try {
            const response = await fetch(`${this.baseUrl}/register-free`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    email,
                    subscription_type: subscriptionType,
                    turnstile_token: turnstileToken
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                const errorMessage = errorData && errorData.error 
                    ? errorData.error 
                    : 'Failed to create user account';
                throw new Error(errorMessage);
            }
            
            return await response.json();
        } catch (error) {
            console.error('User creation error:', error);
            throw error;
        }
    }
    
/**
 * Create a subscription checkout session
 * @param {string} email - User's email address
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
     let errorMessage = 'Failed to create checkout session';
     try {
         const errorData = await response.json();
         if (errorData.error) {
             errorMessage = errorData.error;
         }
     } catch (jsonError) {
         // If JSON parsing fails, try getting text
         try {
             const errorText = await response.text();
             console.error('Checkout session error response:', errorText);
             // Extract meaningful error if possible
             if (errorText.includes('Invalid payment configuration')) {
                 errorMessage = 'Payment configuration error. Please contact support.';
             } else if (errorText.includes('temporarily unavailable')) {
                 errorMessage = 'Payment service temporarily unavailable. Please try again in a few minutes.';
             } else if (errorText.includes('configuration error')) {
                 errorMessage = 'Payment service configuration error. Please contact support.';
             }
         } catch (textError) {
             console.error('Could not parse error response:', textError);
         }
     }
     
     console.error('Checkout session error:', errorMessage);
     throw new Error(errorMessage);
 }
 
 return await response.json();
} catch (error) {
console.error('Checkout session error:', error);
throw error;
}
}
}