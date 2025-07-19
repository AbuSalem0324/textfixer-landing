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
    const uiController = new UIController(apiService, navigationService);
    
    // Start the application
    uiController.init();
    
    // Initialize the slideshow if it exists
    initializeSlideshow();
});

// Slideshow functionality
function initializeSlideshow() {
    let slideIndex = 1;
    const slides = document.getElementsByClassName("benefit-slide");
    const dots = document.getElementsByClassName("dot");
    
    if (slides.length === 0) return;
    
    // Show the first slide
    showSlide(slideIndex);
    
    // Add global functions for navigation
    window.plusSlides = function(n) {
        showSlide(slideIndex += n);
    };
    
    window.currentSlide = function(n) {
        showSlide(slideIndex = n);
    };
    
    // Auto-advance slides every 5 seconds
    setInterval(function() {
        window.plusSlides(1);
    }, 5000);
    
    function showSlide(n) {
        // Reset to first slide when reaching the end
        if (n > slides.length) {
            slideIndex = 1;
        }
        
        // Go to last slide when going back from first slide
        if (n < 1) {
            slideIndex = slides.length;
        }
        
        // Hide all slides
        for (let i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
            slides[i].classList.remove("active");
        }
        
        // Remove active class from all dots
        for (let i = 0; i < dots.length; i++) {
            dots[i].classList.remove("active");
        }
        
        // Show the current slide and activate corresponding dot
        slides[slideIndex-1].style.display = "block";
        slides[slideIndex-1].classList.add("active");
        
        if (dots.length > 0 && slideIndex <= dots.length) {
            dots[slideIndex-1].classList.add("active");
        }
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
                window.plusSlides(1);
            }
            
            if (touchendX > touchstartX) {
                // Swipe right - previous slide
                window.plusSlides(-1);
            }
        }
    }
}