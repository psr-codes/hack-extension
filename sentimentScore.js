const Sentiment = require("sentiment");

const sentiment = new Sentiment();

export function calculateSentimentScore(reviewArr) {
    score = 0;

    reviewArr.forEach((text) => {
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
