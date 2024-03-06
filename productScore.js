// const Sentiment = require("./node_modules/sentiment/lib/index.js");

import Sentiment from "sentiment";
const sentiment = new Sentiment();

function calculateSentimentScore(arr) {
    score = 0;

    arr.forEach((text) => {
        score += sentiment.analyze(text).score;
    });
    if (score > 0) {
        return 1;
    } else if (score < 0) {
        return -1;
    } else {
        return 0;
    }
}

export function calculateScore(productInfo) {
    let totalWeight = 0; // Track total weight for scaling
    let score = 0;

    // Rating (weight = 40)
    const rating = parseFloat(productInfo.rating);
    if (!isNaN(rating)) {
        // Check if rating is available and valid
        const numberOfRatings = productInfo.hasOwnProperty("numberOfRatings")
            ? productInfo.numberOfRatings
            : 1; // Handle potential missing data
        const normalizedRating = Math.min(rating / 5, 1); // Normalize rating to 0-1

        // Adjust weight based on number of ratings (higher weight for more ratings)
        const ratingWeight =
            40 * (Math.log10(numberOfRatings + 1) / Math.log10(1001)); // Logarithmic weighting for balance

        score += normalizedRating * ratingWeight;
        totalWeight += ratingWeight;
    }

    // Number of sales (weight = 20)
    if (productInfo.numSales) {
        score += Math.min(productInfo.numSales / 100, 1) * 20;
        totalWeight += 20;
    }

    // Number of reviews (weight = 10)
    if (productInfo.numReviews) {
        score += Math.min(productInfo.numReviews / 100, 1) * 10;
        totalWeight += 10;
    }

    // Sentiment of reviews (weight = 20)
    if (productInfo.reviewArr) {
        const sentimentScore = calculateSentimentScore(productInfo.reviewArr);
        score += 10 * sentimentScore;
        totalWeight += 10;
    }

    // Warranty (weight = 10)
    if (productInfo.warranty) {
        if (productInfo.warranty === "more than 1 year") {
            score += 10;
        } else if (productInfo.warranty === "between 6 months and 1 year") {
            score += 5;
        }
        totalWeight += 10;
    }

    // Return policy (weight = 5)
    if (productInfo.returnPolicy === "yes") {
        score += 5;
        totalWeight += 5;
    }

    // Delivery charges (weight = 5)
    if (productInfo.deliveryCharges) {
        if (productInfo.deliveryCharges === "free") {
            score += 5;
        } else if (productInfo.deliveryCharges < 200) {
            score += 2;
        }
        totalWeight += 5;
    }

    // Delivery time (weight = 5)
    if (productInfo.deliveryTime) {
        if (productInfo.deliveryTime === "same day") {
            score += 5;
        } else if (productInfo.deliveryTime === "1-2 days") {
            score += 3;
        }
        totalWeight += 5;
    }

    // Scale score to 100 based on total weight (avoid division by zero)
    const scaledScore = totalWeight === 0 ? 0 : (score / totalWeight) * 100;

    return scaledScore;
}
