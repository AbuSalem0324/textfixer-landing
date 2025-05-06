/**
 * main.js - Application entry point
 * TextFixer Frontend
 */

import { Config } from './config.js';
import { UIController } from './ui-controller.js';
import { APIService } from './api-service.js';
import { NavigationService } from './navigation-service.js';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize services
    const apiService = new APIService(Config.API_URL);
    const navigationService = new NavigationService();
    
    // Initialize UI controller with dependencies
    const uiController = new UIController(
        apiService, 
        navigationService, 
        Config.PLANS
    );
    
    // Start the application
    uiController.init();
});
