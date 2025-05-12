/**
 * plan-card.js - Subscription plan card component
 * TextFixer Frontend
 */

export class PlanCard {
    /**
     * Create a new plan card component
     * @param {Object} planData - Plan information object
     * @param {boolean} isFeatured - Whether this plan should be highlighted
     * @param {Function} onSelectCallback - Callback when plan is selected
     */
    constructor(planData, isFeatured = false, onSelectCallback = null) {
        this.plan = planData;
        this.isFeatured = isFeatured;
        this.onSelect = onSelectCallback;
    }
    
    /**
     * Render the plan card to a container
     * @param {HTMLElement} container - Container element to render into
     * @returns {HTMLElement} The created card element
     */
    render(container) {
        // Create plan card element
        const card = document.createElement('div');
        card.className = `price-card ${this.isFeatured ? 'featured' : ''}`;
        
        // Add popular tag if featured
        if (this.isFeatured) {
            card.innerHTML = '<div class="popular-tag">Most Popular</div>';
        }
        
        // Format price display
        const priceDisplay = this.plan.price > 0 
            ? `£${this.plan.price}<span>/month</span>` 
            : `£0<span>/month</span>`;
        
        // Format features list
        const featuresList = this.plan.features
            .map(feature => `<li>${feature}</li>`)
            .join('');
        
        // Button text based on plan type
        const buttonText = this.plan.price > 0 ? 'Subscribe' : 'Get Started';
        const buttonClass = this.plan.price > 0 ? 'btn-primary' : 'btn-secondary';
        
        // Add card content
        const content = `
            <h3>${this.plan.name}</h3>
            <div class="price">${priceDisplay}</div>
            <ul class="benefits">
                ${featuresList}
            </ul>
            <button class="btn ${buttonClass}" data-plan-id="${this.plan.id}">
                ${buttonText}
            </button>
        `;
        
        // Append or set inner HTML based on whether we already added the popular tag
        if (this.isFeatured) {
            card.innerHTML += content;
        } else {
            card.innerHTML = content;
        }
        
        // Add event listener to button
        const button = card.querySelector('button');
        button.addEventListener('click', () => {
            if (this.onSelect) {
                this.onSelect(this.plan.id);
            }
        });
        
        // Add card to container
        container.appendChild(card);
        
        return card;
    }
}