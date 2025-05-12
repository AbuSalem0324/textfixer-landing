/**
 * main.js - Application entry point
 * TextFixer Frontend
 */

import { Config } from './config.js';
import { UIController } from './ui-controller.js';
import { APIService } from './api-service.js';
import { NavigationService } from './navigation-service.js';

document.addEventListener('DOMContentLoaded', function() {

     // Handle dynamically created plan buttons
    document.body.addEventListener('click', function(event) {
        // Check if a plan button was clicked
        if (event.target.matches('[data-plan-id]') || 
            event.target.parentElement.matches('[data-plan-id]')) {
            
            const button = event.target.matches('[data-plan-id]') 
                ? event.target 
                : event.target.parentElement;
                
            const planId = button.getAttribute('data-plan-id');
            
            // If UI controller is available, open modal with this plan
            if (window.uiController) {
                window.uiController.openModal(planId);
            }
        }
    });
});

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

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the slideshow
    let slideIndex = 1;
    showSlides(slideIndex);
    
    // Add global functions for navigation
    window.plusSlides = function(n) {
        showSlides(slideIndex += n);
    };
    
    window.currentSlide = function(n) {
        showSlides(slideIndex = n);
    };
    
    // Auto-advance slides every 5 seconds
    setInterval(function() {
        plusSlides(1);
    }, 5000);
    
    function showSlides(n) {
        let i;
        let slides = document.getElementsByClassName("benefit-slide");
        let dots = document.getElementsByClassName("dot");
        
        // Reset to first slide when reaching the end
        if (n > slides.length) {
            slideIndex = 1;
        }
        
        // Go to last slide when going back from first slide
        if (n < 1) {
            slideIndex = slides.length;
        }
        
        // Hide all slides
        for (i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
            slides[i].classList.remove("active");
        }
        
        // Remove active class from all dots
        for (i = 0; i < dots.length; i++) {
            dots[i].classList.remove("active");
        }
        
        // Show the current slide and activate corresponding dot
        slides[slideIndex-1].style.display = "block";
        slides[slideIndex-1].classList.add("active");
        dots[slideIndex-1].classList.add("active");
    }
    
    // Add swipe support for mobile devices
    const slideshowContainer = document.querySelector('.slideshow-container');
    
    if (slideshowContainer) {
        let touchstartX = 0;
        let touchendX = 0;
        
        slideshowContainer.addEventListener('touchstart', function(e) {
            touchstartX = e.changedTouches[0].screenX;
        }, false);
        
        slideshowContainer.addEventListener('touchend', function(e) {
            touchendX = e.changedTouches[0].screenX;
            handleSwipe();
        }, false);
        
        function handleSwipe() {
            if (touchendX < touchstartX) {
                // Swipe left - next slide
                plusSlides(1);
            }
            
            if (touchendX > touchstartX) {
                // Swipe right - previous slide
                plusSlides(-1);
            }
        }
    }
});
