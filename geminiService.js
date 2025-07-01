class GeminiService {
    constructor() {
        this.API_KEY = null;
        this.BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
        this.initializeApiKey();
    }

    async initializeApiKey() {
        if (typeof Config !== 'undefined') {
            this.API_KEY = await Config.getStoredGeminiApiKey();
        }
        
        if (!this.API_KEY) {
            console.warn('No Gemini API key found. Please configure your API key.');
        }
    }

    async ensureApiKey() {
        if (!this.API_KEY) {
            await this.initializeApiKey();
        }
        return this.API_KEY;
    }

    async analyzeProduct(productData) {
        const apiKey = await this.ensureApiKey();
        const sentimentInfo = productData.sentimentAnalysis ? `
        
        Sentiment Analysis Results:
        - Overall Sentiment: ${productData.sentimentAnalysis.overallSentiment}
        - Positive Reviews: ${productData.sentimentAnalysis.percentageBreakdown.positive}% (${productData.sentimentAnalysis.sentimentBreakdown.positive} reviews)
        - Negative Reviews: ${productData.sentimentAnalysis.percentageBreakdown.negative}% (${productData.sentimentAnalysis.sentimentBreakdown.negative} reviews)
        - Neutral Reviews: ${productData.sentimentAnalysis.percentageBreakdown.neutral}% (${productData.sentimentAnalysis.sentimentBreakdown.neutral} reviews)
        - Total Reviews Analyzed: ${productData.sentimentAnalysis.totalReviews}
        - Confidence Level: ${productData.sentimentAnalysis.confidence}%
        ` : '';
        
        const prompt = `
        Analyze this e-commerce product and provide a comprehensive assessment:
        
        Product: ${productData.name}
        Price: ${productData.price}
        Rating: ${productData.rating}/5
        Number of Ratings: ${productData.numRatings}
        Number of Reviews: ${productData.numReviews}
        Warranty: ${productData.warranty}
        Return Policy: ${productData.returnPolicy}
        Description: ${productData.description}
        Sample Reviews: ${productData.reviews.slice(0, 3).join('. ')}${sentimentInfo}
        
        Please provide a detailed analysis and return ONLY a valid JSON response with these exact keys:
        {
            "overallScore": number (0-100),
            "valueScore": number (0-100),
            "qualityScore": number (0-100),
            "warrantyAnalysis": "detailed warranty assessment",
            "returnPolicyAnalysis": "return policy evaluation",
            "sentimentSummary": "overall customer sentiment",
            "pros": ["pro1", "pro2", "pro3"],
            "cons": ["con1", "con2", "con3"],
            "recommendation": "Buy/Consider/Avoid",
            "reasoning": "detailed explanation for recommendation",
            "trustScore": number (0-100),
            "riskFactors": ["risk1", "risk2"]
        }
        
        Base your scores on:
        - Overall Score: Product quality, reviews, ratings, price value
        - Value Score: Price vs features/quality ratio
        - Quality Score: Build quality, durability, performance based on reviews
        - Trust Score: Seller reliability, return policy, warranty terms
        `;

        try {
            const response = await fetch(`${this.BASE_URL}?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.3,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            const analysisText = data.candidates[0].content.parts[0].text;
            
            // Clean and extract JSON from the response
            const cleanedText = analysisText.replace(/```json|```/g, '').trim();
            const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
            
            if (jsonMatch) {
                const analysis = JSON.parse(jsonMatch[0]);
                return analysis;
            }
            
            throw new Error('Could not parse AI response');
        } catch (error) {
            console.error('Gemini API error:', error);
            return this.getFallbackAnalysis(productData);
        }
    }

    getFallbackAnalysis(productData) {
        const baseScore = productData.rating ? Math.round((productData.rating / 5) * 100) : 50;
        const hasWarranty = productData.warranty && !productData.warranty.includes('not found');
        const hasReturnPolicy = productData.returnPolicy && !productData.returnPolicy.includes('not found');
        
        return {
            overallScore: baseScore,
            valueScore: Math.round(baseScore * 0.85),
            qualityScore: Math.round(baseScore * 0.9),
            warrantyAnalysis: hasWarranty ? `Warranty available: ${productData.warranty}` : "No warranty information found",
            returnPolicyAnalysis: hasReturnPolicy ? `Return policy: ${productData.returnPolicy}` : "No return policy information found",
            sentimentSummary: "Sentiment analysis unavailable - AI service error",
            pros: ["Listed on reputable platform", "Has customer ratings"],
            cons: ["Limited analysis available", "AI service unavailable"],
            recommendation: baseScore > 70 ? "Consider" : "Research more",
            reasoning: "Basic analysis due to AI service unavailability. Consider checking reviews manually.",
            trustScore: hasWarranty && hasReturnPolicy ? 70 : 50,
            riskFactors: ["AI analysis failed", "Manual verification recommended"]
        };
    }
}
