// Test file for sentiment analysis functionality
console.log('Testing Sentiment Analysis...');

// Create test reviews
const testReviews = [
    "This product is absolutely amazing! Great quality and excellent value for money.",
    "Terrible quality, broke after one day. Complete waste of money.",
    "Good product, works as expected. Nothing special but does the job.",
    "Outstanding! Highly recommend this to everyone. Best purchase ever!",
    "Poor quality control. Product arrived damaged and customer service was unhelpful.",
    "Decent product for the price. Some minor issues but overall satisfied.",
    "Excellent build quality and fast shipping. Very happy with this purchase.",
    "Not worth the money. Cheap materials and poor construction.",
    "Perfect! Exactly what I was looking for. Great seller too.",
    "Average product. Works fine but nothing extraordinary about it.",
    "Fantastic quality and arrived quickly. Would definitely buy again!",
    "Disappointing. Expected much better quality for this price point.",
    "Really impressed with this purchase. Exceeded my expectations completely.",
    "Okay product but overpriced. You can find better alternatives elsewhere.",
    "Superior quality and great customer service. Highly recommended!",
    "Faulty product received. Had to return it. Very frustrating experience.",
    "Good value for money. Solid build and reliable performance.",
    "Worst purchase ever. Complete junk. Don't waste your money.",
    "Impressed with the quality. Well made and functions perfectly.",
    "Mediocre at best. Neither good nor bad, just average all around."
];

// Test the sentiment analyzer
if (typeof SentimentAnalyzer !== 'undefined') {
    const analyzer = new SentimentAnalyzer();
    const results = analyzer.analyzeReviews(testReviews);
    
    console.log('=== SENTIMENT ANALYSIS TEST RESULTS ===');
    console.log('Total Reviews:', results.totalReviews);
    console.log('Overall Sentiment:', results.overallSentiment);
    console.log('Breakdown:', results.sentimentBreakdown);
    console.log('Percentages:', results.percentageBreakdown);
    console.log('Average Score:', results.averageScore);
    console.log('Confidence:', results.confidence + '%');
    
    console.log('\n=== INDIVIDUAL REVIEW ANALYSIS ===');
    results.details.forEach((detail, index) => {
        console.log(`Review ${index + 1}: ${detail.sentiment} (Score: ${detail.score.toFixed(2)})`);
    });
    
    console.log('\n=== GENERATED SUMMARY ===');
    const summary = analyzer.generateSentimentSummary(results);
    console.log(summary);
    
    console.log('\n✅ Sentiment Analysis Test Completed Successfully!');
} else {
    console.error('❌ SentimentAnalyzer not loaded');
}

// Test individual sentiment analysis
function testIndividualSentiment() {
    if (typeof SentimentAnalyzer !== 'undefined') {
        const analyzer = new SentimentAnalyzer();
        
        const testCases = [
            "This is absolutely amazing and wonderful!",
            "Terrible and awful quality, very disappointing.",
            "It's an okay product, nothing special."
        ];
        
        console.log('\n=== INDIVIDUAL SENTIMENT TEST ===');
        testCases.forEach((text, index) => {
            const result = analyzer.analyzeSentiment(text);
            console.log(`Test ${index + 1}: "${text}"`);
            console.log(`Result: ${result.sentiment} (Score: ${result.score.toFixed(2)}, Confidence: ${result.confidence.toFixed(2)})`);
        });
    }
}

// Run tests
setTimeout(() => {
    testIndividualSentiment();
}, 1000);
