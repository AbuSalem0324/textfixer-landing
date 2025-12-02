/**
 * main.js - Application entry point
 * TextFixer Frontend
 */

import { Config } from './config.js';
import { UIController } from './ui-controller.js';
import { APIService } from './api-service.js';
import { NavigationService } from './navigation-service.js';
import { DemoService } from './demo-service.js';

document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the demo page
    const isDemoPage = window.location.pathname.includes('try.html') || 
                      window.location.pathname.endsWith('/try');
    
    if (isDemoPage) {
        // Initialize demo functionality
        const demoService = new DemoService();
        demoService.init();
        
        // Also initialize basic navigation
        const navigationService = new NavigationService();
        
        console.log('Demo page initialized');
    } else {
        // Initialize main application services
        // Using v2 API for user registration
        const apiService = new APIService(Config.API_URL_V2);
        const navigationService = new NavigationService();
        
        // Initialize UI controller with dependencies
        const uiController = new UIController(apiService, navigationService);
        
        // Start the main application
        uiController.init();

        console.log('Main application initialized with v2 API');
    }
});

