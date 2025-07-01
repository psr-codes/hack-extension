// Content script for product data extraction
console.log('Product extractor content script loaded');

// Main extraction function that will be called from popup
function extractProductData() {
    console.log('Starting product data extraction...');
    
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
    
    console.log('Product data extracted:', productData);
    return productData;
}

function getProductName() {
    const selectors = [
        // Amazon selectors
        '#productTitle',
        'h1#title',
        'h1.a-size-large',
        '.product-title',
        
        // Flipkart selectors
        '.B_NuCI',
        '._35KyD6',
        '.product-title-word-break',
        
        // Generic selectors
        'h1[data-automation-id="product-title"]',
        '.pdp-product-name',
        'h1.x-item-title-label',
        '.product-name',
        '.pdp-product-name-price h1',
        '.title',
        
        // Fallback selectors
        'h1'
    ];
    
    for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
            if (element && element.textContent && element.textContent.trim().length > 10) {
                const text = element.textContent.trim();
                console.log(`Found product name with selector ${selector}:`, text);
                return text;
            }
        }
    }
    
    console.log('Product name not found');
    return 'Product name not found';
}

function getPrice() {
    const selectors = [
        // Amazon price selectors
        '.a-price-whole',
        '.a-price .a-offscreen',
        '.a-price-range',
        'span.a-price.a-text-price.a-size-medium.apexPriceToPay',
        
        // Flipkart price selectors
        '._30jeq3._16Jk6d',
        '._30jeq3',
        '.CEmiEU .hl05eU',
        '.CEmiEU',
        '._1_WHN1',
        
        // Generic price selectors
        '.price',
        '.current-price',
        '.pdp-price',
        '.price-current',
        '[data-automation-id="product-price"]',
        '.price-now',
        '.selling-price',
        '.notranslate'
    ];
    
    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent) {
            const priceText = element.textContent.trim();
            console.log(`Found price with selector ${selector}:`, priceText);
            return priceText;
        }
    }
    
    // Look for price patterns in the entire page text
    const bodyText = document.body.textContent;
    const pricePatterns = [
        /₹[\s]*[\d,]+\.?\d*/g,
        /\$[\s]*[\d,]+\.?\d*/g,
        /€[\s]*[\d,]+\.?\d*/g,
        /£[\s]*[\d,]+\.?\d*/g
    ];
    
    for (const pattern of pricePatterns) {
        const matches = bodyText.match(pattern);
        if (matches && matches.length > 0) {
            // Return the first reasonable price (not too small, not too large)
            for (const match of matches) {
                const numValue = parseInt(match.replace(/[^\d]/g, ''));
                if (numValue > 10 && numValue < 1000000) {
                    console.log('Found price via pattern matching:', match);
                    return match;
                }
            }
        }
    }
    
    console.log('Price not found');
    return 'Price not found';
}

function getRating() {
    const selectors = [
        // Amazon rating selectors
        '.a-icon-alt',
        'span.a-icon-alt',
        'i.a-icon-star span',
        
        // Flipkart rating selectors  
        '._3LWZlK',
        '.XQDdHH',
        '.gUuXy-',
        
        // Generic rating selectors
        '.rating',
        '.stars',
        '[data-automation-id="product-rating"]',
        '.average-rating',
        '.star-rating'
    ];
    
    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
            const text = element.textContent || element.getAttribute('alt') || element.getAttribute('title') || '';
            const ratingMatch = text.match(/(\d+\.?\d*)/);
            if (ratingMatch) {
                const rating = parseFloat(ratingMatch[1]);
                if (rating >= 0 && rating <= 5) {
                    console.log(`Found rating with selector ${selector}:`, rating);
                    return rating;
                }
            }
        }
    }
    
    // Look for star patterns in the page
    const starElements = document.querySelectorAll('[class*="star"], [class*="rating"]');
    for (const star of starElements) {
        const text = star.textContent || star.getAttribute('alt') || '';
        const ratingMatch = text.match(/(\d+\.?\d*)/);
        if (ratingMatch) {
            const rating = parseFloat(ratingMatch[1]);
            if (rating >= 0 && rating <= 5) {
                console.log('Found rating via star pattern:', rating);
                return rating;
            }
        }
    }
    
    console.log('Rating not found');
    return 'Rating not found';
}

function getNumRatings() {
    const selectors = [
        // Amazon rating count selectors
        '#acrCustomerReviewText',
        'a[href*="customerReviews"]',
        
        // Flipkart rating count selectors
        '._2_R_DZ',
        '.row._2afbiS',
        
        // Generic selectors
        '.rating-count',
        '.review-count',
        '[data-automation-id="reviews-count"]'
    ];
    
    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
            const text = element.textContent;
            const match = text.match(/(\d+[\d,]*)/);
            if (match) {
                console.log(`Found rating count with selector ${selector}:`, match[1]);
                return match[1];
            }
        }
    }
    
    console.log('Rating count not found');
    return 'Rating count not found';
}

function getNumReviews() {
    const selectors = [
        // Amazon review count selectors
        '[data-hook="total-review-count"]',
        'a[href*="customerReviews"] span',
        
        // Flipkart review count selectors
        '._2_R_DZ',
        '.row._2afbiS',
        
        // Generic selectors
        '.review-count',
        '.reviews-count'
    ];
    
    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
            const text = element.textContent;
            const match = text.match(/(\d+[\d,]*)/);
            if (match) {
                console.log(`Found review count with selector ${selector}:`, match[1]);
                return match[1];
            }
        }
    }
    
    console.log('Review count not found');
    return 'Review count not found';
}

function getWarranty() {
    const selectors = [
        // Amazon warranty selectors
        '[data-feature-name="warranty"]',
        '#warranty-section',
        
        // Generic warranty selectors
        '.warranty-info',
        '.product-warranty',
        '.warranty-details',
        '[class*="warranty"]'
    ];
    
    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim()) {
            console.log(`Found warranty with selector ${selector}:`, element.textContent.trim());
            return element.textContent.trim();
        }
    }
    
    // Search for warranty patterns in text
    const bodyText = document.body.textContent.toLowerCase();
    const warrantyPatterns = [
        /(\d+)\s*year[s]?\s*warranty/i,
        /(\d+)\s*month[s]?\s*warranty/i,
        /warranty[:\s-]+([^.\n]{10,50})/i,
        /manufacturer[s]?\s*warranty[:\s-]+([^.\n]{10,50})/i
    ];
    
    for (const pattern of warrantyPatterns) {
        const match = bodyText.match(pattern);
        if (match) {
            console.log('Found warranty via pattern matching:', match[0]);
            return match[0].trim();
        }
    }
    
    console.log('Warranty information not found');
    return 'Warranty information not found';
}

function getReturnPolicy() {
    const selectors = [
        // Amazon return policy selectors
        '[data-feature-name="returns"]',
        '#returns-section',
        
        // Generic return policy selectors
        '.return-policy',
        '.returns-policy',
        '.return-info',
        '[class*="return"]'
    ];
    
    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim()) {
            console.log(`Found return policy with selector ${selector}:`, element.textContent.trim());
            return element.textContent.trim();
        }
    }
    
    // Search for return policy patterns
    const bodyText = document.body.textContent.toLowerCase();
    const returnPatterns = [
        /(\d+)\s*day[s]?\s*return/i,
        /easy\s*return[s]?/i,
        /free\s*return[s]?/i,
        /no\s*return/i,
        /return[s]?\s*policy[:\s-]+([^.\n]{10,50})/i
    ];
    
    for (const pattern of returnPatterns) {
        const match = bodyText.match(pattern);
        if (match) {
            console.log('Found return policy via pattern matching:', match[0]);
            return match[0].trim();
        }
    }
    
    console.log('Return policy not found');
    return 'Return policy not found';
}

function getReviews() {
    const reviews = [];
    
    // Enhanced review selectors for extracting more reviews
    const reviewSelectors = [
        // Amazon review selectors - various types
        '[data-hook="review-body"]',
        '[data-hook="review-body"] span',
        '.cr-original-review-text',
        '.review-text',
        '.review-item-content',
        '.a-expander-content .review-text',
        
        // Flipkart review selectors
        '._2sc7ZR._2GoNaG',
        '.t-ZTKy',
        '._11pzQk',
        '.qwjRop',
        '._6K-7Co',
        '._3DCdKt',
        
        // Generic review selectors
        '.review-text',
        '.review-item',
        '.user-review',
        '.review-content',
        '.review-item-content',
        '.customer-review',
        '.review-description',
        '.review-body',
        '.comment-text',
        '.user-comment'
    ];
    
    console.log('Extracting up to 20 reviews for sentiment analysis...');
    
    // Try to extract reviews from different sections
    for (const selector of reviewSelectors) {
        const reviewElements = document.querySelectorAll(selector);
        console.log(`Found ${reviewElements.length} elements with selector: ${selector}`);
        
        reviewElements.forEach((element, index) => {
            if (reviews.length < 20) { // Extract up to 20 reviews
                let reviewText = element.textContent.trim();
                
                // Clean up the review text
                reviewText = reviewText.replace(/\s+/g, ' '); // Normalize whitespace
                reviewText = reviewText.replace(/^\d+\s*stars?\s*/i, ''); // Remove star ratings
                reviewText = reviewText.replace(/verified purchase/i, ''); // Remove verified purchase text
                reviewText = reviewText.replace(/helpful\s*\|\s*report/i, ''); // Remove action buttons
                
                // Filter for meaningful reviews
                if (reviewText.length > 20 && reviewText.length < 1000) {
                    // Check if review doesn't contain common non-review elements
                    const lowercaseText = reviewText.toLowerCase();
                    const skipKeywords = [
                        'helpful', 'report abuse', 'see more', 'show less', 
                        'read more', 'verified purchase only', 'sort by',
                        'filter by', 'top reviews', 'write a review',
                        'was this review helpful', 'yes', 'no', 'comment'
                    ];
                    
                    const shouldSkip = skipKeywords.some(keyword => 
                        lowercaseText.includes(keyword) && reviewText.length < 100
                    );
                    
                    if (!shouldSkip && !reviews.includes(reviewText)) {
                        reviews.push(reviewText);
                        console.log(`Added review ${reviews.length}: ${reviewText.substring(0, 50)}...`);
                    }
                }
            }
        });
        
        if (reviews.length >= 20) {
            console.log('Found 20 reviews, stopping extraction');
            break;
        }
    }
    
    // If we don't have enough reviews, try to get more from review-like content
    if (reviews.length < 20) {
        console.log(`Only found ${reviews.length} reviews, trying additional selectors...`);
        
        // Try more specific review-related selectors
        const additionalSelectors = [
            '[class*="review"]',
            '[class*="comment"]',
            '[class*="feedback"]',
            '[id*="review"]'
        ];
        
        for (const selector of additionalSelectors) {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (reviews.length < 20) {
                    const text = element.textContent.trim();
                    
                    // Look for text that looks like a review
                    if (text.length > 50 && text.length < 800 && 
                        (text.includes('bought') || text.includes('purchase') || 
                         text.includes('product') || text.includes('quality') ||
                         text.includes('recommend') || text.includes('good') ||
                         text.includes('bad') || text.includes('excellent') ||
                         text.includes('satisfied') || text.includes('disappointed'))) {
                        
                        // Check if it's not already in our list and doesn't contain page elements
                        const lowercaseText = text.toLowerCase();
                        if (!reviews.includes(text) && 
                            !lowercaseText.includes('add to cart') &&
                            !lowercaseText.includes('buy now') &&
                            !lowercaseText.includes('price') &&
                            !lowercaseText.includes('delivery') &&
                            !lowercaseText.includes('specification')) {
                            
                            reviews.push(text);
                            console.log(`Added additional review ${reviews.length}: ${text.substring(0, 50)}...`);
                        }
                    }
                }
            });
            
            if (reviews.length >= 20) break;
        }
    }
    
    console.log(`Final review count: ${reviews.length}`);
    return reviews.length > 0 ? reviews : ['No reviews found'];
}

function getProductImages() {
    const images = [];
    const imageSelectors = [
        // Amazon image selectors
        '#landingImage',
        '.product-image img',
        '#imgTagWrapperId img',
        
        // Flipkart image selectors
        '._396cs4',
        '.product-image-main img',
        
        // Generic image selectors
        '.product-photos img',
        '.product-image img'
    ];
    
    for (const selector of imageSelectors) {
        const imgElements = document.querySelectorAll(selector);
        imgElements.forEach((img, index) => {
            if (index < 5 && img.src && images.length < 5) {
                images.push(img.src);
            }
        });
        if (images.length > 0) break;
    }
    
    console.log(`Found ${images.length} images`);
    return images;
}

function getDescription() {
    const selectors = [
        // Amazon description selectors
        '#feature-bullets',
        '#productDescription',
        '.product-description',
        
        // Flipkart description selectors
        '._1mXcCf',
        '.product-highlights',
        
        // Generic description selectors
        '.product-details',
        '.product-description'
    ];
    
    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim()) {
            const description = element.textContent.trim().substring(0, 500);
            console.log(`Found description with selector ${selector}:`, description.substring(0, 100) + '...');
            return description;
        }
    }
    
    console.log('Product description not found');
    return 'Product description not found';
}

// Make functions available globally for the extension
window.extractProductData = extractProductData;
window.getProductName = getProductName;
window.getPrice = getPrice;
window.getRating = getRating;
window.getNumRatings = getNumRatings;
window.getNumReviews = getNumReviews;
window.getWarranty = getWarranty;
window.getReturnPolicy = getReturnPolicy;
window.getReviews = getReviews;
window.getProductImages = getProductImages;
window.getDescription = getDescription;
