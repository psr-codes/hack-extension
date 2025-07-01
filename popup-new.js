document.addEventListener('DOMContentLoaded', async function() {
    console.log('Shop Smart AI Extension loaded');
    await initializeExtension();
    
    setupEventListeners();
    setTimeout(autoAnalyzeIfProductPage, 1000);
});

async function initializeExtension() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (tab && isEcommerceSite(tab.url)) {
            console.log('E-commerce site detected:', tab.url);
            showAnalyzeButton();
        } else {
            showMessage('Visit an e-commerce product page to analyze');
        }
    } catch (error) {
        console.error('Error initializing extension:', error);
        showMessage('Extension initialization failed');
    }
}

function setupEventListeners() {
    const analyzeButton = document.getElementById('analyze-btn');
    if (analyzeButton) {
        analyzeButton.addEventListener('click', analyzeCurrentProduct);
    }
}

function isEcommerceSite(url) {
    const ecommerceDomains = [
        'amazon.com', 'amazon.in', 'amazon.co.uk', 'amazon.ca',
        'flipkart.com', 'myntra.com', 'snapdeal.com', 
        'ebay.com', 'ebay.in', 'shopify.com', 'etsy.com',
        'alibaba.com', 'walmart.com', 'target.com',
        'bestbuy.com', 'costco.com', 'homedepot.com'
    ];
    
    return ecommerceDomains.some(domain => url.includes(domain));
}

function showAnalyzeButton() {
    const analyzeButton = document.getElementById('analyze-btn');
    if (analyzeButton) {
        analyzeButton.style.display = 'block';
        analyzeButton.disabled = false;
    }
}

function showMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    messageElement.textContent = message;
    messageElement.style.padding = '10px';
    messageElement.style.textAlign = 'center';
    messageElement.style.color = '#666';
    
    const container = document.querySelector('.header');
    if (container) {
        container.appendChild(messageElement);
    }
}

async function autoAnalyzeIfProductPage() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (tab && isEcommerceSite(tab.url)) {
            // Inject content script first
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['contentScript.js']
            });
            
            // Check if this looks like a product page
            const [result] = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: () => {
                    // Quick check to see if this looks like a product page
                    const productIndicators = [
                        '#productTitle', '.product-title', '.pdp-product-name',
                        '.price', '.current-price', '.a-price',
                        '.rating', '.stars', '.reviews'
                    ];
                    
                    return productIndicators.some(selector => document.querySelector(selector));
                }
            });
            
            if (result.result) {
                console.log('Product page detected, starting auto-analysis');
                // Small delay to let the page load
                setTimeout(analyzeCurrentProduct, 1000);
            }
        }
    } catch (error) {
        console.error('Auto-analyze failed:', error);
    }
}

function checkIfProductPage() {
    // Quick check to see if this looks like a product page
    const productIndicators = [
        '#productTitle', '.product-title', '.pdp-product-name',
        '.price', '.current-price', '.a-price',
        '.rating', '.stars', '.reviews'
    ];
    
    return productIndicators.some(selector => document.querySelector(selector));
}

async function analyzeCurrentProduct() {
    try {
        showLoading();
        hideError();
        hideAIAnalysis();
        
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab) {
            showError('No active tab found');
            return;
        }
        
        console.log('Extracting product data from:', tab.url);
        
        // First inject the content script
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['contentScript.js']
        });
        
        // Small delay to let the script load
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Extract product data
        const [result] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => {
                if (typeof window.extractProductData === 'function') {
                    return window.extractProductData();
                } else {
                    console.error('extractProductData function not found');
                    return null;
                }
            }
        });
        
        const productData = result.result;
        console.log('Extracted product data:', productData);
        
        if (!productData || productData.name === 'Product name not found') {
            showError('No product detected. Please ensure you\'re on a product page.');
            return;
        }
        
        // Update basic product info first
        updateBasicProductInfo(productData);
        
        // Perform sentiment analysis on reviews
        console.log('Performing sentiment analysis on reviews...');
        const sentimentAnalyzer = new SentimentAnalyzer();
        const sentimentAnalysis = sentimentAnalyzer.analyzeReviews(productData.reviews);
        console.log('Sentiment analysis completed:', sentimentAnalysis);
        
        // Display sentiment analysis
        displaySentimentAnalysis(sentimentAnalysis);
        
        // Get AI analysis
        console.log('Starting AI analysis...');
        const geminiService = new GeminiService();
        // Include sentiment analysis in the product data for AI
        const enhancedProductData = {
            ...productData,
            sentimentAnalysis: sentimentAnalysis
        };
        const aiAnalysis = await geminiService.analyzeProduct(enhancedProductData);
        console.log('AI Analysis completed:', aiAnalysis);
        
        // Display AI results
        displayAIAnalysis(aiAnalysis);
        hideLoading();
        
    } catch (error) {
        console.error('Error analyzing product:', error);
        hideLoading();
        showError('Analysis failed: ' + error.message);
    }
}

function updateBasicProductInfo(productData) {
    // Update product score based on multiple factors
    let score = 50; // Default score
    
    if (productData.rating !== 'Rating not found') {
        const rating = parseFloat(productData.rating);
        if (!isNaN(rating)) {
            score = Math.round((rating / 5) * 100);
        }
    }
    
    // Adjust score based on number of reviews
    if (productData.numReviews !== 'Review count not found') {
        const numReviews = parseInt(productData.numReviews.replace(/,/g, ''));
        if (!isNaN(numReviews)) {
            if (numReviews > 1000) score += 5;
            else if (numReviews > 100) score += 3;
            else if (numReviews < 10) score -= 10;
        }
    }
    
    // Cap the score at 100
    score = Math.min(100, Math.max(0, score));
    
    // Update UI elements
    updateElementText('price', productData.price);
    updateElementText('rating', productData.rating);
    updateElementText('numberOfRatings', productData.numRatings);
    updateElementText('numReviews', productData.numReviews);
    updateElementText('warranty', productData.warranty);
    updateElementText('returnPolicy', productData.returnPolicy);
    updateElementText('reviewArr', 
        productData.reviews.length > 0 ? 
        `${productData.reviews.length} reviews analyzed` : 
        'No reviews found'
    );
    updateElementText('productScore', score);
    updateProgressRing(score);
}

function displayAIAnalysis(analysis) {
    // Update AI scores
    updateElementText('ai-overall-score', analysis.overallScore || 'N/A');
    updateElementText('ai-value-score', analysis.valueScore || 'N/A');
    updateElementText('ai-trust-score', analysis.trustScore || 'N/A');
    
    // Update AI details
    updateElementText('ai-warranty-analysis', analysis.warrantyAnalysis || 'No analysis available');
    updateElementText('ai-return-policy-analysis', analysis.returnPolicyAnalysis || 'No analysis available');
    updateElementText('ai-sentiment-summary', analysis.sentimentSummary || 'No sentiment data available');
    
    // Update pros and cons
    updateList('ai-pros-list', analysis.pros || []);
    updateList('ai-cons-list', analysis.cons || []);
    
    // Update recommendation
    updateElementText('ai-recommendation', analysis.recommendation || 'No recommendation');
    updateElementText('ai-reasoning', analysis.reasoning || 'No reasoning provided');
    
    // Set recommendation badge style
    const recommendationBadge = document.querySelector('.recommendation-badge');
    if (recommendationBadge && analysis.recommendation) {
        recommendationBadge.className = `recommendation-badge ${analysis.recommendation.toLowerCase()}`;
    }
    
    showAIAnalysis();
}

function displaySentimentAnalysis(sentimentAnalysis) {
    console.log('Displaying sentiment analysis:', sentimentAnalysis);
    
    // Update sentiment summary
    const sentimentSummary = document.getElementById('ai-sentiment-summary');
    if (sentimentSummary) {
        const analyzer = new SentimentAnalyzer();
        const summary = analyzer.generateSentimentSummary(sentimentAnalysis);
        sentimentSummary.textContent = summary;
    }
    
    // Update sentiment breakdown if elements exist
    const positivePercentage = document.getElementById('positive-percentage');
    const negativePercentage = document.getElementById('negative-percentage');
    const neutralPercentage = document.getElementById('neutral-percentage');
    const positiveCount = document.getElementById('positive-count');
    const negativeCount = document.getElementById('negative-count');
    const neutralCount = document.getElementById('neutral-count');
    
    if (positivePercentage) positivePercentage.textContent = `${sentimentAnalysis.percentageBreakdown.positive}%`;
    if (negativePercentage) negativePercentage.textContent = `${sentimentAnalysis.percentageBreakdown.negative}%`;
    if (neutralPercentage) neutralPercentage.textContent = `${sentimentAnalysis.percentageBreakdown.neutral}%`;
    if (positiveCount) positiveCount.textContent = sentimentAnalysis.sentimentBreakdown.positive;
    if (negativeCount) negativeCount.textContent = sentimentAnalysis.sentimentBreakdown.negative;
    if (neutralCount) neutralCount.textContent = sentimentAnalysis.sentimentBreakdown.neutral;
    
    // Show sentiment details section
    const sentimentDetails = document.getElementById('sentiment-details');
    if (sentimentDetails && sentimentAnalysis.totalReviews > 0) {
        sentimentDetails.style.display = 'block';
        
        // Set up toggle button
        const toggleBtn = document.getElementById('toggle-sentiment');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', function() {
                const stats = document.querySelector('.sentiment-stats');
                if (stats.style.display === 'none') {
                    stats.style.display = 'flex';
                    toggleBtn.textContent = 'Hide Details';
                } else {
                    stats.style.display = 'none';
                    toggleBtn.textContent = 'Show Details';
                }
            });
            
            // Initially hide details
            const stats = document.querySelector('.sentiment-stats');
            if (stats) {
                stats.style.display = 'none';
                toggleBtn.textContent = 'Show Details';
            }
        }
    }
}

function updateElementText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text || 'N/A';
        console.log(`Updated ${elementId}: ${text || 'N/A'}`);
    } else {
        console.warn(`Element not found: ${elementId}`);
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

// UI State Management Functions
function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'block';
    }
    
    const analyzeBtn = document.getElementById('analyze-btn');
    if (analyzeBtn) {
        analyzeBtn.disabled = true;
        analyzeBtn.textContent = 'Analyzing...';
    }
}

function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'none';
    }
    
    const analyzeBtn = document.getElementById('analyze-btn');
    if (analyzeBtn) {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = 'Analyze Product';
    }
}

function showError(message) {
    const errorSection = document.getElementById('error');
    const errorMessage = document.getElementById('error-message');
    
    if (errorSection && errorMessage) {
        errorMessage.textContent = message;
        errorSection.style.display = 'block';
    }
    
    console.error('Extension Error:', message);
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
        aiAnalysis.style.visibility = 'visible';
        aiAnalysis.style.opacity = '1';
        console.log('AI Analysis section shown');
    } else {
        console.error('AI Analysis section element not found');
    }
}

function hideAIAnalysis() {
    const aiAnalysis = document.getElementById('ai-analysis');
    if (aiAnalysis) {
        aiAnalysis.style.display = 'none';
    }
}
