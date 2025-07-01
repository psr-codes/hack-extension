// Sentiment Analysis Module for Review Analysis
class SentimentAnalyzer {
    constructor() {
        // Simple sentiment word dictionaries
        this.positiveWords = [
            'excellent', 'amazing', 'great', 'good', 'fantastic', 'wonderful', 'awesome', 
            'perfect', 'love', 'beautiful', 'nice', 'best', 'recommend', 'happy', 'satisfied',
            'quality', 'durable', 'reliable', 'sturdy', 'comfortable', 'easy', 'smooth',
            'fast', 'quick', 'efficient', 'helpful', 'useful', 'valuable', 'worth',
            'pleased', 'impressed', 'outstanding', 'superior', 'fine', 'solid', 'brilliant'
        ];
        
        this.negativeWords = [
            'terrible', 'awful', 'bad', 'horrible', 'worst', 'hate', 'disappointing',
            'poor', 'cheap', 'flimsy', 'broken', 'defective', 'useless', 'waste',
            'regret', 'disappointed', 'frustrated', 'annoying', 'difficult', 'hard',
            'slow', 'expensive', 'overpriced', 'uncomfortable', 'unreliable', 'fragile',
            'problems', 'issues', 'fault', 'faults', 'wrong', 'failed', 'fails'
        ];
        
        this.intensifiers = [
            'very', 'extremely', 'really', 'quite', 'totally', 'completely', 'absolutely',
            'highly', 'super', 'incredibly', 'amazingly', 'exceptionally'
        ];
    }
    
    // Analyze sentiment of a single review
    analyzeSentiment(reviewText) {
        const words = reviewText.toLowerCase().split(/\s+/);
        let positiveScore = 0;
        let negativeScore = 0;
        let intensifierMultiplier = 1;
        
        for (let i = 0; i < words.length; i++) {
            const word = words[i].replace(/[^\w]/g, ''); // Remove punctuation
            
            // Check for intensifiers
            if (this.intensifiers.includes(word)) {
                intensifierMultiplier = 1.5;
                continue;
            }
            
            // Check for positive words
            if (this.positiveWords.includes(word)) {
                positiveScore += (1 * intensifierMultiplier);
            }
            
            // Check for negative words
            if (this.negativeWords.includes(word)) {
                negativeScore += (1 * intensifierMultiplier);
            }
            
            // Reset intensifier
            if (intensifierMultiplier > 1) {
                intensifierMultiplier = 1;
            }
        }
        
        // Calculate sentiment
        const totalScore = positiveScore - negativeScore;
        const normalizedScore = Math.max(-1, Math.min(1, totalScore / Math.max(words.length / 10, 1)));
        
        let sentiment = 'neutral';
        if (normalizedScore > 0.1) sentiment = 'positive';
        else if (normalizedScore < -0.1) sentiment = 'negative';
        
        return {
            sentiment: sentiment,
            score: normalizedScore,
            positiveScore: positiveScore,
            negativeScore: negativeScore,
            confidence: Math.abs(normalizedScore)
        };
    }
    
    // Analyze sentiment of multiple reviews
    analyzeReviews(reviews) {
        if (!reviews || reviews.length === 0 || reviews[0] === 'No reviews found') {
            return {
                overallSentiment: 'neutral',
                sentimentBreakdown: { positive: 0, negative: 0, neutral: 0 },
                averageScore: 0,
                totalReviews: 0,
                confidence: 0,
                details: []
            };
        }
        
        const results = [];
        let totalScore = 0;
        let positiveCount = 0;
        let negativeCount = 0;
        let neutralCount = 0;
        
        // Analyze each review
        reviews.forEach((review, index) => {
            if (typeof review === 'string' && review.length > 10) {
                const analysis = this.analyzeSentiment(review);
                results.push({
                    reviewIndex: index,
                    text: review.substring(0, 100) + '...',
                    sentiment: analysis.sentiment,
                    score: analysis.score,
                    confidence: analysis.confidence
                });
                
                totalScore += analysis.score;
                
                if (analysis.sentiment === 'positive') positiveCount++;
                else if (analysis.sentiment === 'negative') negativeCount++;
                else neutralCount++;
            }
        });
        
        const averageScore = results.length > 0 ? totalScore / results.length : 0;
        const totalReviews = results.length;
        
        // Determine overall sentiment
        let overallSentiment = 'neutral';
        if (positiveCount > negativeCount && positiveCount > neutralCount) {
            overallSentiment = 'positive';
        } else if (negativeCount > positiveCount && negativeCount > neutralCount) {
            overallSentiment = 'negative';
        }
        
        // Calculate confidence (how sure we are about the sentiment)
        const dominantCount = Math.max(positiveCount, negativeCount, neutralCount);
        const confidence = totalReviews > 0 ? dominantCount / totalReviews : 0;
        
        return {
            overallSentiment: overallSentiment,
            sentimentBreakdown: {
                positive: positiveCount,
                negative: negativeCount,
                neutral: neutralCount
            },
            percentageBreakdown: {
                positive: totalReviews > 0 ? Math.round((positiveCount / totalReviews) * 100) : 0,
                negative: totalReviews > 0 ? Math.round((negativeCount / totalReviews) * 100) : 0,
                neutral: totalReviews > 0 ? Math.round((neutralCount / totalReviews) * 100) : 0
            },
            averageScore: Math.round(averageScore * 100) / 100,
            totalReviews: totalReviews,
            confidence: Math.round(confidence * 100),
            details: results
        };
    }
    
    // Generate human-readable sentiment summary
    generateSentimentSummary(sentimentAnalysis) {
        const { overallSentiment, sentimentBreakdown, percentageBreakdown, totalReviews, confidence } = sentimentAnalysis;
        
        if (totalReviews === 0) {
            return "No reviews available for sentiment analysis.";
        }
        
        let summary = `Based on ${totalReviews} customer reviews, the overall sentiment is ${overallSentiment}. `;
        
        if (overallSentiment === 'positive') {
            summary += `${percentageBreakdown.positive}% of reviews are positive, indicating customers are generally satisfied with this product.`;
        } else if (overallSentiment === 'negative') {
            summary += `${percentageBreakdown.negative}% of reviews are negative, suggesting customers have concerns about this product.`;
        } else {
            summary += `Reviews are mixed with ${percentageBreakdown.positive}% positive, ${percentageBreakdown.negative}% negative, and ${percentageBreakdown.neutral}% neutral opinions.`;
        }
        
        if (confidence > 70) {
            summary += ` (High confidence: ${confidence}%)`;
        } else if (confidence > 50) {
            summary += ` (Moderate confidence: ${confidence}%)`;
        } else {
            summary += ` (Low confidence: ${confidence}%)`;
        }
        
        return summary;
    }
}

// Make the class available globally
window.SentimentAnalyzer = SentimentAnalyzer;
