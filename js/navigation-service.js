/**
 * navigation-service.js - Navigation and URL handling
 * TextFixer Frontend
 */

export class NavigationService {
    /**
     * Construct a complete URL path relative to the current location
     * @param {string} pageName - Page name to navigate to
     * @returns {string} - Constructed URL
     */
    constructPath(pageName) {
        // Get current URL without filename and query parameters
        const currentUrl = window.location.href;
        const urlObj = new URL(currentUrl);
        const baseUrl = urlObj.origin; // Just the domain part
        
        // Get the pathname without the file at the end
        let pathname = urlObj.pathname;
        const lastSlash = pathname.lastIndexOf('/');
        if (lastSlash >= 0) {
            pathname = pathname.substring(0, lastSlash + 1);
        } else {
            pathname = '/';
        }
        
        // Combine parts
        return baseUrl + pathname + pageName;
    }
    
    /**
     * Navigate to a page with optional parameters
     * @param {string} pageName - Name of the page to navigate to
     * @param {Object} [params] - URL parameters to add to the page URL
     */
    navigateToPage(pageName, params = {}) {
        let url = this.constructPath(pageName);
        
        // Add query parameters if any
        if (Object.keys(params).length > 0) {
            const urlParams = new URLSearchParams();
            
            for (const [key, value] of Object.entries(params)) {
                if (value !== null && value !== undefined) {
                    urlParams.append(key, value);
                }
            }
            
            url = `${url}?${urlParams.toString()}`;
        }
        
        console.log('Navigating to:', url);
        window.location.href = url;
    }
}