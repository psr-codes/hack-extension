// Enhanced product data extraction functions
function extractProductData() {
    const productData = {
        name: getProductName(),
        price: getPrice(),
        rating: getRating(),
        numRatings: getNumRatings(),
        numReviews: getNumReviews(),
        reviews: getReviews(),
        warranty: getWarranty(),
        returnPolicy: getReturnPolicy(),
        images: getProductImages(),
        description: getDescription()
    };
    
    console.log('Extracted product data:', productData);
    return productData;
}

function getProductName() {
    const selectors = [
        '#productTitle',
        '.product-title',
        'h1[data-automation-id="product-title"]',
        '.pdp-product-name',
        '.B_NuCI',
        'h1.x-item-title-label',
        '.notranslate',
        '.product-name',
        '.pdp-product-name-price h1',
        '.title',
        '.product-title-word-break',
        '._35KyD6'
    ];
    
    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim()) {
            return element.textContent.trim();
        }
    }
    
    // Fallback: look for h1 tags
    const h1Tags = document.querySelectorAll('h1');
    for (const h1 of h1Tags) {
        if (h1.textContent.trim().length > 10) {
            return h1.textContent.trim();
        }
    }
    
    return 'Product name not found';
}

function getPrice() {
    const selectors = [
        '.a-price-whole',
        '.notranslate',
        '.price',
        '.current-price',
        '.pdp-price',
        '.price-current',
        '[data-automation-id="product-price"]',
        '.a-price .a-offscreen',
        '.price-now',
        '._30jeq3._16Jk6d',
        '._30jeq3',
        '.CEmiEU .hl05eU',
        '.CEmiEU',
        '.selling-price'
    ];
    
    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
            return element.textContent.trim();
        }
    }
    
    // Look for price patterns in text
    const pricePattern = /[\$₹€£]\s*[\d,]+\.?\d*/g;
    const bodyText = document.body.textContent;
    const matches = bodyText.match(pricePattern);
    
    return matches ? matches[0] : 'Price not found';
}

function getRating() {
    const selectors = [
        '.a-icon-alt',
        '.rating',
        '.stars',
        '[data-automation-id="product-rating"]',
        '.average-rating',
        '.star-rating',
        '._3LWZlK',
        '.XQDdHH',
        '.gUuXy-'
    ];
    
    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
            const text = element.textContent || element.getAttribute('alt') || '';
            const ratingMatch = text.match(/(\d+\.?\d*)/);
            if (ratingMatch) {
                return parseFloat(ratingMatch[1]);
            }
        }
    }
    
    // Look for star patterns
    const starElements = document.querySelectorAll('[class*="star"], [class*="rating"]');
    for (const star of starElements) {
        const text = star.textContent;
        const ratingMatch = text.match(/(\d+\.?\d*)/);
        if (ratingMatch) {
            return parseFloat(ratingMatch[1]);
        }
    }
    
    return 'Rating not found';
}

function getNumRatings() {
    const selectors = [
        '#acrCustomerReviewText',
        '.rating-count',
        '.review-count',
        '[data-automation-id="reviews-count"]',
        '._2_R_DZ',
        '.row._2afbiS'
    ];
    
    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
            const match = element.textContent.match(/(\d+[\d,]*)/);
            return match ? match[1] : element.textContent.trim();
        }
    }
    
    return 'Rating count not found';
}

function getNumReviews() {
    const selectors = [
        '.review-count',
        '.reviews-count',
        '[data-hook="total-review-count"]',
        '._2_R_DZ',
        '.row._2afbiS'
    ];
    
    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
            const match = element.textContent.match(/(\d+[\d,]*)/);
            return match ? match[1] : element.textContent.trim();
        }
    }
    
    return 'Review count not found';
}

function getWarranty() {
    const selectors = [
        '[data-feature-name="warranty"]',
        '.warranty-info',
        '.product-warranty',
        '#warranty-section',
        '.warranty-details',
        '[class*="warranty"]'
    ];
    
    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) return element.textContent.trim();
    }
    
    // Search for warranty in text content
    const bodyText = document.body.textContent.toLowerCase();
    const warrantyPatterns = [
        /warranty[:\s-]+([^.\n]+)/i,
        /(\d+)\s*year[s]?\s*warranty/i,
        /(\d+)\s*month[s]?\s*warranty/i,
        /manufacturer[s]?\s*warranty[:\s-]+([^.\n]+)/i
    ];
    
    for (const pattern of warrantyPatterns) {
        const match = bodyText.match(pattern);
        if (match) {
            return match[0].trim();
        }
    }
    
    return 'Warranty information not found';
}

function getReturnPolicy() {
    const selectors = [
        '[data-feature-name="returns"]',
        '.return-policy',
        '.returns-policy',
        '#returns-section',
        '.return-info',
        '[class*="return"]'
    ];
    
    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) return element.textContent.trim();
    }
    
    // Search for return policy in text
    const bodyText = document.body.textContent.toLowerCase();
    const returnPatterns = [
        /return[s]?\s*policy[:\s-]+([^.\n]+)/i,
        /(\d+)\s*day[s]?\s*return/i,
        /easy\s*return[s]?/i,
        /no\s*return/i,
        /free\s*return[s]?/i
    ];
    
    for (const pattern of returnPatterns) {
        const match = bodyText.match(pattern);
        if (match) {
            return match[0].trim();
        }
    }
    
    return 'Return policy not found';
}

function getReviews() {
    const reviews = [];
    const reviewSelectors = [
        // Amazon selectors
        '[data-hook="review-body"]',
        '[data-hook="review-body"] span',
        '.review-text',
        '.cr-original-review-text',
        
        // Flipkart selectors
        '._2sc7ZR._2GoNaG',
        '.t-ZTKy',
        '._11pzQk',
        
        // Generic selectors
        '.review-item',
        '.user-review',
        '.review-content',
        '.review-item-content',
        '.customer-review',
        '.review-description',
        
        // eBay selectors
        '.reviews .ebay-review-text',
        '.review-item-content',
        
        // Myntra selectors
        '.user-review-main',
        '.user-review-reviewText'
    ];
    
    for (const selector of reviewSelectors) {
        const reviewElements = document.querySelectorAll(selector);
        reviewElements.forEach((element, index) => {
            if (index < 15) { // Increased limit for better analysis
                const reviewText = element.textContent.trim();
                // Filter out very short or very long reviews
                if (reviewText.length > 30 && reviewText.length < 500) {
                    // Remove common non-review text
                    if (!reviewText.toLowerCase().includes('helpful') && 
                        !reviewText.toLowerCase().includes('report') &&
                        !reviewText.toLowerCase().includes('verified purchase') &&
                        !reviewText.includes('★') &&
                        !reviewText.includes('⭐')) {
                        reviews.push(reviewText);
                    }
                }
            }
        });
        if (reviews.length >= 5) break; // Stop when we have enough meaningful reviews
    }
    
    // If no reviews found, try a different approach - look for review patterns
    if (reviews.length === 0) {
        const textContent = document.body.textContent;
        const reviewPatterns = [
            /good product/gi,
            /excellent/gi,
            /worth buying/gi,
            /satisfied/gi,
            /disappointed/gi,
            /not worth/gi
        ];
        
        // This is a very basic fallback - in reality, you'd want more sophisticated review detection
        const sentences = textContent.split(/[.!?]+/);
        sentences.forEach(sentence => {
            if (sentence.trim().length > 30 && sentence.trim().length < 200) {
                for (const pattern of reviewPatterns) {
                    if (pattern.test(sentence)) {
                        reviews.push(sentence.trim());
                        break;
                    }
                }
            }
        });
    }
    
    return reviews.length > 0 ? reviews.slice(0, 10) : ['No reviews found'];
}

function getProductImages() {
    const images = [];
    const imageSelectors = [
        '.product-image img',
        '#landingImage',
        '.product-photos img',
        '._396cs4',
        '.product-image-main img'
    ];
    
    for (const selector of imageSelectors) {
        const imgElements = document.querySelectorAll(selector);
        imgElements.forEach((img, index) => {
            if (index < 5 && img.src) { // Limit to first 5 images
                images.push(img.src);
            }
        });
        if (images.length > 0) break;
    }
    
    return images;
}

function getDescription() {
    const selectors = [
        '#feature-bullets',
        '.product-description',
        '.product-details',
        '#productDescription',
        '._1mXcCf',
        '.product-highlights'
    ];
    
    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
            return element.textContent.trim().substring(0, 500); // Limit description length
        }
    }
    
    return 'Product description not found';
}
