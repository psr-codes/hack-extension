// Debug script to test if the extension is working properly
console.log('=== Shop Smart Extension Debug ===');

document.addEventListener('DOMContentLoaded', function() {
    console.log('✓ DOM loaded');
    
    if (typeof Config !== 'undefined') {
        console.log('✓ Config class loaded');
    } else {
        console.error('✗ Config class not found');
    }
    if (typeof GeminiService !== 'undefined') {
        console.log('✓ GeminiService class loaded');
    } else {
        console.error('✗ GeminiService class not found');
    }
    const analyzeBtn = document.getElementById('analyze-btn');
    if (analyzeBtn) {
        console.log('✓ Analyze button found');
    } else {
        console.error('✗ Analyze button not found');
    }
    
    const productScore = document.getElementById('productScore');
    if (productScore) {
        console.log('✓ Product score element found');
    } else {
        console.error('✗ Product score element not found');
    }
    
    console.log('=== Debug Complete ===');
});
