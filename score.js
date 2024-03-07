// import { calculateSentimentScore } from "./sentimentScore.js";

export function calculateScore(productInfo) {
    console.log("inside calculateScore function: ", productInfo);
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

    console.log(
        "score after rating: ",
        score,
        "totalWeight after rating: ",
        totalWeight
    );
    // Number of sales (weight = 20)
    if (productInfo.numSales) {
        score += Math.min(productInfo.numSales / 100, 1) * 20;
        totalWeight += 20;
    }

    console.log(
        "score after numSales: ",
        score,
        "totalWeight after numSales: ",
        totalWeight
    );

    // Number of reviews (weight = 10)
    if (productInfo.numReviews) {
        score += Math.min(productInfo.numReviews / 100, 1) * 10;
        totalWeight += 10;
    }

    console.log(
        "score after numReviews: ",
        score,
        "totalWeight after numReviews: ",
        totalWeight
    );

    // Sentiment of reviews (weight = 20)
    // if (productInfo.reviewArr) {
    //     let sentimentScore = 0;
    //     try {
    //         sentimentScore = calculateSentimentScore(productInfo.reviewArr);
    //     } catch (e) {
    //         console.log(e);
    //         sentimentScore = 0;
    //     }
    //     score += 10 * sentimentScore;
    //     totalWeight += 10;
    // }

    // Warranty (weight = 10)
    if (productInfo.warranty) {
        score += productInfo.warranty;
        totalWeight += 10;
    }

    console.log(
        "score after warranty: ",
        score,
        "totalWeight after warranty: ",
        totalWeight
    );
    // Return policy (weight = 5)
    if (productInfo.returnPolicy > 0) {
        score += 5;
    }
    totalWeight += 5;

    console.log(
        "score after returnPolicy: ",
        score,
        "totalWeight after returnPolicy: ",
        totalWeight
    );
    // Delivery charges (weight = 5)
    if (productInfo.deliveryCharges) {
        if (productInfo.deliveryCharges === 0) {
            score += 5;
        } else if (productInfo.deliveryCharges < 200) {
            score += 2;
        }
        totalWeight += 5;
    }

    console.log(
        "score after deliveryCharges: ",
        score,
        "totalWeight after deliveryCharges: ",
        totalWeight
    );

    // Delivery time (weight = 5)
    if (productInfo.deliveryTime) {
        if (productInfo.deliveryTime === 1) {
            score += 5;
        } else if (productInfo.deliveryTime === 2) {
            score += 3;
        }
        totalWeight += 5;
    }

    console.log(
        "score after deliveryTime: ",
        score,
        "totalWeight after deliveryTime: ",
        totalWeight
    );

    // Scale score to 100 based on total weight (avoid division by zero)
    const scaledScore = totalWeight === 0 ? 0 : (score / totalWeight) * 100;

    return scaledScore + Math.floor(Math.random() * 11) - 5;
}

// Sample product information (replace with actual scraped data)
const productInfo = {
    rating: "4", // Example: 3.5/5 stars
    numberOfRatings: 1000, // Example: number of ratings for the product

    numSales: 10000,
    numReviews: 500,
    reviewArr: ["very good item"],
    warranty: "between 6 months and 1 year", // Example: 'more than 1 year', 'between 6 months and 1 year', 'no warranty'
    returnPolicy: "yes", // Example: 'yes', 'no'
    deliveryCharges: "free", // Example: 'free', 'less than 200', 'more than 200'
    deliveryTime: "same day", // Example: 'same day', '1-2 days', 'more than 2 days'
};

// // Calculate score based on product information
// const productScore = calculateScore(productInfo);
// console.log("Product Score:", productScore);
