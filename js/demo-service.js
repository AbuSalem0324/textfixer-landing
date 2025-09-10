/**
 * demo-service.js - Demo functionality for TextFixer try page
 * TextFixer Frontend - Demo Service
 */

import { Config } from './config.js';

export class DemoService {
    constructor() {
        this.apiUrl = Config.API_URL;
        this.maxLength = 2000;
        this.minLength = 5;
        this.usageCount = this.loadUsageCount();
        this.lastResetDate = this.loadLastResetDate();
        
        // Check if usage should be reset (new day)
        this.checkAndResetUsage();
    }
    
    /**
     * Initialize demo functionality
     */
    async init() {
        this.bindEvents();
        this.updateCharCounter();
        this.updateUsageStatus();
        
        this.trackPageLoad();
    }
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        const inputText = document.getElementById('input-text');
        const fixBtn = document.getElementById('fix-btn');
        const copyBtn = document.getElementById('copy-btn');
        const refixBtn = document.getElementById('refix-btn');
        const clearBtn = document.getElementById('clear-btn');
        const retryBtn = document.getElementById('retry-btn');
        
        if (inputText) {
            inputText.addEventListener('input', () => this.handleInputChange());
            inputText.addEventListener('paste', () => {
                // Delay to allow paste to complete
                setTimeout(() => this.handleInputChange(), 10);
            });
        }
        
        if (fixBtn) {
            fixBtn.addEventListener('click', () => this.handleFixText());
        }
        
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.handleCopyText());
        }
        
        if (refixBtn) {
            refixBtn.addEventListener('click', () => this.handleRefixText());
        }
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.handleClear());
        }
        
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.handleRetry());
        }
    }
    
    /**
     * Handle input text changes
     */
    handleInputChange() {
        this.updateCharCounter();
        this.validateInput();
        this.hideError();
    }
    
    /**
     * Update character counter
     */
    updateCharCounter() {
        const inputText = document.getElementById('input-text');
        const charCount = document.getElementById('char-count');
        const charLimit = document.getElementById('char-limit');
        
        if (inputText && charCount && charLimit) {
            const currentLength = inputText.value.length;
            charCount.textContent = currentLength;
            charLimit.textContent = this.maxLength;
            
            // Color coding for character count
            if (currentLength > this.maxLength * 0.9) {
                charCount.style.color = 'var(--color-error)';
            } else if (currentLength > this.maxLength * 0.8) {
                charCount.style.color = 'var(--color-warning)';
            } else {
                charCount.style.color = 'var(--color-text-light)';
            }
        }
    }
    
    /**
     * Validate input text
     */
    validateInput() {
        const inputText = document.getElementById('input-text');
        const validationMessage = document.getElementById('validation-message');
        const fixBtn = document.getElementById('fix-btn');
        
        if (!inputText || !validationMessage || !fixBtn) return;
        
        const text = inputText.value.trim();
        const length = text.length;
        
        validationMessage.className = 'validation-message';
        
        if (length === 0) {
            validationMessage.textContent = '';
            fixBtn.disabled = true;
            return;
        }
        
        if (length < this.minLength) {
            validationMessage.textContent = `Text too short - please provide at least ${this.minLength} characters`;
            validationMessage.classList.add('error');
            fixBtn.disabled = true;
            return;
        }
        
        if (length > this.maxLength) {
            validationMessage.textContent = `Text exceeds ${this.maxLength} character limit`;
            validationMessage.classList.add('error');
            fixBtn.disabled = true;
            return;
        }
        
        // Check rate limit
        if (this.usageCount >= 2) {
            validationMessage.textContent = 'Daily limit reached (2 fixes per day)';
            validationMessage.classList.add('error');
            fixBtn.disabled = true;
            return;
        }
        
        // Text is valid
        validationMessage.textContent = `Ready to fix (${length} characters)`;
        validationMessage.classList.add('success');
        fixBtn.disabled = false;
    }
    
    /**
     * Handle fix text button click
     */
    async handleFixText() {
        const inputText = document.getElementById('input-text');
        if (!inputText || !this.validateBeforeSubmit()) return;
        
        const text = inputText.value.trim();
        
        try {
            this.showLoading();
            
            
            // Make API request
            const response = await this.callDemoAPI(text);
            
            if (response.success) {
                this.displayResults(response.data);
                this.incrementUsage();
                this.updateUsageStatus();
            } else {
                this.showError(response.error || 'Failed to fix text', response.message);
            }
            
        } catch (error) {
            console.error('Demo API error:', error);
            
            // Provide more specific error messages based on error type
            if (error.message && error.message.includes('Failed to fetch')) {
                this.showError('Connection Error', 'Unable to connect to the TextFixer service. Please check your internet connection or try again later.');
            } else if (error.message && error.message.includes('NetworkError')) {
                this.showError('Network Error', 'There appears to be a network connectivity issue. Please try again in a moment.');
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                this.showError('API Unavailable', 'The TextFixer demo service is currently unavailable. Please try again later.');
            } else {
                this.showError('Service Error', 'An unexpected error occurred. Please try again in a moment.');
            }
        } finally {
            this.hideLoading();
        }
    }
    
    /**
     * Validate before submitting
     */
    validateBeforeSubmit() {
        const inputText = document.getElementById('input-text');
        const text = inputText.value.trim();
        
        if (text.length < this.minLength) {
            this.showError('Text Too Short', `Please provide at least ${this.minLength} characters.`);
            return false;
        }
        
        if (text.length > this.maxLength) {
            this.showError('Text Too Long', `Please limit your text to ${this.maxLength} characters.`);
            return false;
        }
        
        if (this.usageCount >= 2) {
            this.showError('Daily Limit Reached', 'You can fix 2 texts per day. Try again tomorrow!');
            return false;
        }
        
        return true;
    }
    
    /**
     * Call the demo API
     */
    async callDemoAPI(text) {
        console.log('Calling demo API with:', {
            url: `${this.apiUrl}/api/demo/fix`,
            textLength: text.length
        });
        
        try {
            const response = await fetch(`${this.apiUrl}/api/demo/fix`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text
                })
            });
            
            console.log('API Response:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
                headers: Object.fromEntries(response.headers.entries())
            });
            
            const data = await response.json();
            console.log('API Response Data:', data);
            
            if (!response.ok) {
                // Handle specific HTTP status codes
                let errorMessage = data.error || 'API Error';
                let errorDetail = data.message || 'Please try again later';
                
                if (response.status === 404) {
                    errorMessage = 'Service Unavailable';
                    errorDetail = 'The TextFixer demo service endpoint is not available. This may be a temporary deployment issue.';
                } else if (response.status === 500) {
                    errorMessage = 'Server Error';
                    errorDetail = 'The TextFixer service is experiencing issues. Please try again later.';
                } else if (response.status === 429) {
                    errorMessage = 'Rate Limited';
                    errorDetail = 'You have exceeded the daily limit for demo usage. Please try again tomorrow.';
                }
                
                return {
                    success: false,
                    error: errorMessage,
                    message: errorDetail,
                    data: data,
                    statusCode: response.status
                };
            }
            
            return {
                success: true,
                data: data
            };
            
        } catch (error) {
            console.error('API Call Error Details:', {
                name: error.name,
                message: error.message,
                stack: error.stack,
                apiUrl: `${this.apiUrl}/api/demo/fix`
            });
            
            // Provide more specific error messages
            let errorMessage = 'Connection failed';
            let errorDetail = error.message;
            
            if (error.message && error.message.includes('Failed to fetch')) {
                errorMessage = 'Unable to reach the API server';
                errorDetail = 'The TextFixer service may be temporarily unavailable. Please try again later.';
            } else if (error.name === 'TypeError') {
                errorMessage = 'Network connectivity issue';
                errorDetail = 'Please check your internet connection and try again.';
            } else if (error.message && error.message.includes('CORS')) {
                errorMessage = 'API access issue';
                errorDetail = 'There is a technical issue with the service. Please try again later.';
            }
            
            return {
                success: false,
                error: errorMessage,
                message: errorDetail
            };
        }
    }
    
    /**
     * Display results
     */
    displayResults(data) {
        const outputText = document.getElementById('output-text');
        const resultsCard = document.getElementById('results-card');
        const resultsCharCount = document.getElementById('results-char-count');
        const demoGrid = document.querySelector('.demo-grid');
        
        if (outputText && resultsCard && resultsCharCount) {
            outputText.value = data.fixedText || data.fixed_text || '';
            resultsCharCount.textContent = outputText.value.length;
            
            // Show results card and switch to two-column layout
            resultsCard.style.display = 'block';
            if (demoGrid) {
                demoGrid.classList.add('has-results');
            }
            
            // Scroll to results
            resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    
    /**
     * Handle copy text
     */
    async handleCopyText() {
        const outputText = document.getElementById('output-text');
        const copyBtn = document.getElementById('copy-btn');
        
        if (!outputText || !copyBtn) return;
        
        try {
            await navigator.clipboard.writeText(outputText.value);
            
            // Visual feedback
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="material-icons">check</i>Copied!';
            copyBtn.style.backgroundColor = 'var(--color-success)';
            
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.style.backgroundColor = '';
            }, 2000);
            
        } catch (error) {
            console.error('Copy failed:', error);
            
            // Fallback: select text
            outputText.select();
            outputText.setSelectionRange(0, 99999); // For mobile devices
            
            // Visual feedback for fallback
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="material-icons">info</i>Text Selected';
            
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
            }, 2000);
        }
    }
    
    /**
     * Handle refix text
     */
    async handleRefixText() {
        const outputText = document.getElementById('output-text');
        const inputText = document.getElementById('input-text');
        
        if (!outputText || !inputText) return;
        
        // Move output to input for refixing
        inputText.value = outputText.value;
        
        // Hide results
        this.handleClear();
        
        // Update character counter and validation
        this.handleInputChange();
        
        // Scroll to input
        inputText.scrollIntoView({ behavior: 'smooth', block: 'start' });
        inputText.focus();
    }
    
    /**
     * Handle clear results
     */
    handleClear() {
        const resultsCard = document.getElementById('results-card');
        const outputText = document.getElementById('output-text');
        const demoGrid = document.querySelector('.demo-grid');
        
        if (resultsCard) {
            resultsCard.style.display = 'none';
        }
        
        if (outputText) {
            outputText.value = '';
        }
        
        // Switch back to single-column layout
        if (demoGrid) {
            demoGrid.classList.remove('has-results');
        }
    }
    
    /**
     * Handle retry after error
     */
    handleRetry() {
        this.hideError();
        
    }
    
    /**
     * Show loading state
     */
    showLoading() {
        const fixSection = document.querySelector('.fix-section');
        const loadingState = document.getElementById('loading-state');
        
        if (fixSection) fixSection.style.display = 'none';
        if (loadingState) loadingState.style.display = 'block';
    }
    
    /**
     * Hide loading state
     */
    hideLoading() {
        const fixSection = document.querySelector('.fix-section');
        const loadingState = document.getElementById('loading-state');
        
        if (fixSection) fixSection.style.display = 'block';
        if (loadingState) loadingState.style.display = 'none';
    }
    
    /**
     * Show error state
     */
    showError(title, message) {
        const fixSection = document.querySelector('.fix-section');
        const errorState = document.getElementById('error-state');
        const errorTitle = document.getElementById('error-title');
        const errorMessage = document.getElementById('error-message');
        
        if (fixSection) fixSection.style.display = 'none';
        if (errorState) errorState.style.display = 'block';
        if (errorTitle) errorTitle.textContent = title;
        if (errorMessage) errorMessage.textContent = message;
    }
    
    /**
     * Hide error state
     */
    hideError() {
        const fixSection = document.querySelector('.fix-section');
        const errorState = document.getElementById('error-state');
        
        if (fixSection) fixSection.style.display = 'block';
        if (errorState) errorState.style.display = 'none';
    }
    
    /**
     * Update usage status display
     */
    updateUsageStatus() {
        const rateLimitInfo = document.getElementById('rate-limit-info');
        
        if (!rateLimitInfo) return;
        
        const remaining = Math.max(0, 2 - this.usageCount);
        const icon = rateLimitInfo.querySelector('i');
        const span = rateLimitInfo.querySelector('span');
        
        if (remaining === 0) {
            rateLimitInfo.className = 'rate-limit-info error';
            icon.textContent = 'block';
            span.textContent = 'Daily limit reached - try again tomorrow';
        } else if (remaining === 1) {
            rateLimitInfo.className = 'rate-limit-info warning';
            icon.textContent = 'warning';
            span.textContent = `${remaining} fix remaining today`;
        } else {
            rateLimitInfo.className = 'rate-limit-info';
            icon.textContent = 'info';
            span.textContent = `${remaining} free fixes remaining today`;
        }
    }
    
    /**
     * Increment usage count
     */
    incrementUsage() {
        this.usageCount++;
        this.saveUsageCount();
    }
    
    /**
     * Check and reset usage if new day
     */
    checkAndResetUsage() {
        const today = new Date().toDateString();
        
        if (this.lastResetDate !== today) {
            this.usageCount = 0;
            this.lastResetDate = today;
            this.saveUsageCount();
            this.saveLastResetDate();
        }
    }
    
    /**
     * Load usage count from localStorage
     */
    loadUsageCount() {
        try {
            return parseInt(localStorage.getItem('textfixer_demo_usage') || '0', 10);
        } catch (error) {
            return 0;
        }
    }
    
    /**
     * Save usage count to localStorage
     */
    saveUsageCount() {
        try {
            localStorage.setItem('textfixer_demo_usage', this.usageCount.toString());
        } catch (error) {
            console.warn('Unable to save usage count:', error);
        }
    }
    
    /**
     * Load last reset date from localStorage
     */
    loadLastResetDate() {
        try {
            return localStorage.getItem('textfixer_demo_reset_date') || '';
        } catch (error) {
            return '';
        }
    }
    
    /**
     * Save last reset date to localStorage
     */
    saveLastResetDate() {
        try {
            localStorage.setItem('textfixer_demo_reset_date', this.lastResetDate);
        } catch (error) {
            console.warn('Unable to save reset date:', error);
        }
    }
    
    /**
     * Track page load
     */
    async trackPageLoad() {
        console.log('Tracking page load to:', `${this.apiUrl}/api/demo/page-load`);
        
        try {
            const response = await fetch(`${this.apiUrl}/api/demo/page-load`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            console.log('Page load tracking response:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('Page load tracking success:', data);
            } else {
                console.warn('Page load tracking failed with status:', response.status);
            }
        } catch (error) {
            console.warn('Page load tracking error:', {
                name: error.name,
                message: error.message
            });
        }
    }
}