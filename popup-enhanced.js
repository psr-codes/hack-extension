document.addEventListener('DOMContentLoaded', async function() {
    const analyzeButton = document.getElementById('analyze-btn');
    if (analyzeButton) {
        analyzeButton.addEventListener('click', analyzeProduct);
    }
    await initializeConfig();
    initializeExtension();
});

async function initializeConfig() {
    if (typeof Config !== 'undefined') {
        const apiKey = await Config.getStoredGeminiApiKey();
        console.log('API Key initialized:', apiKey ? 'Available' : 'Not found');
    }
}

async function initializeExtension() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab) return;
        if (isEcommerceSite(tab.url)) {
            document.getElementById('analyze-btn').style.display = 'block';
        }
        
    } catch (error) {
        console.error('Error initializing extension:', error);
    }
}

function isEcommerceSite(url) {
    const ecommerceDomains = [
        'amazon.com', 'amazon.in', 'flipkart.com', 'myntra.com', 
        'snapdeal.com', 'ebay.com', 'shopify.com', 'etsy.com',
        'alibaba.com', 'walmart.com', 'target.com'
    ];
    
    return ecommerceDomains.some(domain => url.includes(domain));
}

async function analyzeProduct() {
    try {
        showLoading();
        hideError();
        hideAIAnalysis();
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab) {
            showError('No active tab found');
            return;
        }
        const [result] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: extractProductData
        });
        
        const productData = result.result;
        console.log('Extracted product data:', productData);
        
        if (!productData || productData.name === 'Product name not found') {
            showError('No product detected on this page. Please visit a product page on an e-commerce site.');
            return;
        }
        updateBasicProductInfo(productData);
        const geminiService = new GeminiService();
        const aiAnalysis = await geminiService.analyzeProduct(productData);
        console.log('AI Analysis:', aiAnalysis);
        displayAIAnalysis(aiAnalysis);
        hideLoading();
        
    } catch (error) {
        console.error('Error analyzing product:', error);
        hideLoading();
        showError('Failed to analyze product. Please try again.');
    }
}

function updateBasicProductInfo(productData) {
    updateElementText('price', productData.price);
    updateElementText('rating', productData.rating);
    updateElementText('numberOfRatings', productData.numRatings);
    updateElementText('numReviews', productData.numReviews);
    updateElementText('warranty', productData.warranty);
    updateElementText('returnPolicy', productData.returnPolicy);
    updateElementText('reviewArr', productData.reviews.length > 0 ? 
        productData.reviews.slice(0, 3).join(', ').substring(0, 100) + '...' : 'No reviews found');
    
    const score = productData.rating !== 'Rating not found' ? 
        Math.round((parseFloat(productData.rating) / 5) * 100) : 50;
    updateElementText('productScore', score);
    updateProgressRing(score);
}

function displayAIAnalysis(analysis) {

    updateElementText('ai-overall-score', analysis.overallScore);
    updateElementText('ai-value-score', analysis.valueScore);
    updateElementText('ai-trust-score', analysis.trustScore); 
    updateElementText('ai-warranty-analysis', analysis.warrantyAnalysis);
    updateElementText('ai-return-policy-analysis', analysis.returnPolicyAnalysis);
    updateElementText('ai-sentiment-summary', analysis.sentimentSummary);
    updateList('ai-pros-list', analysis.pros);
    updateList('ai-cons-list', analysis.cons);
    updateElementText('ai-recommendation', analysis.recommendation);
    updateElementText('ai-reasoning', analysis.reasoning);
    const recommendationBadge = document.querySelector('.recommendation-badge');
    if (recommendationBadge) {
        recommendationBadge.className = `recommendation-badge ${analysis.recommendation.toLowerCase()}`;
    }
    
    showAIAnalysis();
}

function updateElementText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text || '-';
    }
}

function updateList(listId, items) {
    const list = document.getElementById(listId);
    if (list && Array.isArray(items)) {
        list.innerHTML = '';
        items.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            list.appendChild(li);
        });
    }
}

function updateProgressRing(percentage) {
    const circle = document.querySelector('.progress-ring-circle');
    if (circle) {
        const radius = 50;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;
        
        circle.style.strokeDasharray = circumference;
        circle.style.strokeDashoffset = offset;
    }
}

function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'block';
    }
}

function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'none';
    }
}

function showError(message) {
    const errorSection = document.getElementById('error');
    const errorMessage = document.getElementById('error-message');
    
    if (errorSection && errorMessage) {
        errorMessage.textContent = message;
        errorSection.style.display = 'block';
    }
}

function hideError() {
    const errorSection = document.getElementById('error');
    if (errorSection) {
        errorSection.style.display = 'none';
    }
}

function showAIAnalysis() {
    const aiAnalysis = document.getElementById('ai-analysis');
    if (aiAnalysis) {
        aiAnalysis.style.display = 'block';
    }
}

function hideAIAnalysis() {
    const aiAnalysis = document.getElementById('ai-analysis');
    if (aiAnalysis) {
        aiAnalysis.style.display = 'none';
    }
}

// Include the extractProductData function here for the extension to work
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
        '.review-item',
        '[data-hook="review-body"]',
        '.review-text',
        '.user-review',
        '._2sc7ZR._2GoNaG',
        '.t-ZTKy',
        '.review-item-content'
    ];
    
    for (const selector of reviewSelectors) {
        const reviewElements = document.querySelectorAll(selector);
        reviewElements.forEach((element, index) => {
            if (index < 10) { // Limit to first 10 reviews
                const reviewText = element.textContent.trim();
                if (reviewText.length > 20) { // Only meaningful reviews
                    reviews.push(reviewText);
                }
            }
        });
        if (reviews.length > 0) break;
    }
    
    return reviews.length > 0 ? reviews : ['No reviews found'];
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
