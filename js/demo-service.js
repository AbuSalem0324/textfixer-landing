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
        this.turnstileWidget = null;
        
        // Check if usage should be reset (new day)
        this.checkAndResetUsage();
    }
    
    /**
     * Initialize demo functionality
     */
    init() {
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
            
            // Get Turnstile token
            const turnstileToken = await this.getTurnstileToken();
            
            // Make API request
            const response = await this.callDemoAPI(text, turnstileToken);
            
            if (response.success) {
                this.displayResults(response.data);
                this.incrementUsage();
                this.updateUsageStatus();
            } else {
                this.showError(response.error || 'Failed to fix text', response.message);
            }
            
        } catch (error) {
            console.error('Demo API error:', error);
            this.showError('Connection Error', 'Please check your internet connection and try again.');
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
     * Get Turnstile token
     */
    async getTurnstileToken() {
        return new Promise((resolve, reject) => {
            if (window.turnstile) {
                const token = window.turnstile.getResponse();
                if (token) {
                    resolve(token);
                } else {
                    // Reset turnstile and try again
                    window.turnstile.reset();
                    setTimeout(() => {
                        const newToken = window.turnstile.getResponse();
                        if (newToken) {
                            resolve(newToken);
                        } else {
                            reject(new Error('Please complete the anti-bot verification'));
                        }
                    }, 1000);
                }
            } else {
                // For development or when Turnstile is not available
                resolve('dev-token');
            }
        });
    }
    
    /**
     * Call the demo API
     */
    async callDemoAPI(text, turnstileToken) {
        try {
            const response = await fetch(`${this.apiUrl}/api/demo/fix`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    turnstile_token: turnstileToken
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                return {
                    success: false,
                    error: data.error || 'API Error',
                    message: data.message || 'Please try again later',
                    data: data
                };
            }
            
            return {
                success: true,
                data: data
            };
            
        } catch (error) {
            return {
                success: false,
                error: 'Network Error',
                message: 'Please check your internet connection'
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
        
        // Reset Turnstile
        if (window.turnstile) {
            window.turnstile.reset();
        }
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
        try {
            await fetch(`${this.apiUrl}/api/demo/page-load`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
        } catch (error) {
            // Ignore page load tracking errors
            console.debug('Page load tracking failed:', error);
        }
    }
}