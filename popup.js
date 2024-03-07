import { calculateScore } from "./score.js";
let isDoneExtracting = false;

const productInfo = {
    rating: "4", // Example: 3.5/5 stars
    numberOfRatings: 1000, // Example: number of ratings for the product
    numReviews: 500,
    warranty: 0, // Example: 'more than 1 year', 'between 6 months and 1 year', 'no warranty'

    returnPolicy: 0, // Example: 'yes', 'no'
    deliveryTime: 2, // Example: 'same day', '1-2 days', 'more than 2 days'

    // numSales: 10000,
    reviewArr: ["very good item"],
    deliveryCharges: 0, // Example: 'free', 'less than 200', 'more than 200'
};

function startCounter() {
    let intervalId = setInterval(() => {
        if (isDoneExtracting) {
            let score = calculateScore(productInfo);
            // alert("Product Score: " + isDoneExtracting + Math.round(score));
            let productScoreElement = document.getElementById("productScore");
            productScoreElement.innerHTML = Math.round(score);
            productScoreElement.style.color = score > 80 ? "lightgreen" : "red";

            if (score >= 80) {
                productScoreElement.style.color = "lightgreen";
            } else if (score >= 60 && score < 80) {
                productScoreElement.style.color = "orange";
            } else {
                productScoreElement.style.color = "red";
            }

            const progressRing = document.querySelector(
                ".progress-ring-circle"
            );

            function setProgress(percent) {
                const offset = 314 - (percent / 100) * 314;
                progressRing.style.strokeDashoffset = offset;
            }

            setProgress(score);

            clearInterval(intervalId);
        }
    }, 1000); // Increment every second (1000 milliseconds)
}

async function getHTMLData() {
    // Define XPath expressions for each HTML element you want to extract
    let xpaths = {
        rating: '//*[@id="container"]/div/div[3]/div[1]/div[2]/div[2]/div/div[2]/div/div',
        numberOfRatings:
            '//*[@id="container"]/div/div[3]/div[1]/div[2]/div[2]/div/div[2]/div/div/span[2]/span/span[1]',
        numReviews:
            '//*[@id="container"]/div/div[3]/div[1]/div[2]/div[2]/div/div[2]/div/div/span[2]/span/span[3]',
        reviewArr:
            '//*[@id="container"]/div/div[3]/div[1]/div[2]/div[8]/div[6]/div/div[4]',
        warranty:
            '//*[@id="container"]/div/div[3]/div[1]/div[2]/div[4]/div/div[2]/div',
        returnPolicy:
            '//*[@id="container"]/div/div[3]/div[1]/div[2]/div[8]/div[1]/div/div[2]/div[2]/ul/li[1]/div',
        deliveryTime:
            '//*[@id="container"]/div/div[3]/div[1]/div[2]/div[5]/div/div/div[2]/div[1]/ul/div/div[1]/span[1]',
    };

    // let extractedData = {};

    // Use chrome.tabs.query to get the active tab
    chrome.tabs.query(
        { lastFocusedWindow: true, active: true },
        async function (tabs) {
            // Iterate through each XPath expression and extract HTML data
            for (let key in xpaths) {
                let xpathExpression = xpaths[key];
                // Use chrome.scripting.executeScript to inject a content script and execute code in the active tab
                chrome.scripting.executeScript(
                    {
                        // Specify the target tab where the script will be executed
                        target: { tabId: tabs[0].id },
                        // Function to be executed in the context of the active tab
                        function: function (xpathExpression) {
                            // Use document.evaluate to evaluate the XPath expression
                            let result = document.evaluate(
                                xpathExpression,
                                document,
                                null,
                                XPathResult.ANY_TYPE,
                                null
                            );
                            // Initialize an array to store the extracted HTML data
                            let data = [];
                            // Iterate through the nodes returned by the XPath evaluation
                            let node = result.iterateNext();
                            while (node) {
                                // Extract the HTML content of each node and add it to the data array
                                data.push(node.innerHTML.trim());
                                // Move to the next node
                                node = result.iterateNext();
                            }
                            // Return the extracted HTML data
                            return data;
                        },
                        // Pass the XPath expression as an argument to the function
                        args: [xpathExpression],
                    },
                    function (result) {
                        // Handle the result returned by the content script
                        if (
                            !chrome.runtime.lastError &&
                            result &&
                            result.length > 0 &&
                            result[0] &&
                            result[0].result &&
                            result[0].result.length > 0
                        ) {
                            // Extracted data is available in the result array
                            // console.log(
                            //   "HTML data extracted from XPath:",
                            //   result[0].result[0]
                            // );
                            // Process the HTML data as needed
                            let extractedHTML;

                            if (
                                key == "numberOfRatings" ||
                                key == "numReviews"
                            ) {
                                extractedHTML = extractNumericalValue(
                                    result[0].result[0]
                                );

                                productInfo[key] = extractedHTML;
                            } else if (key == "rating") {
                                extractedHTML = extractRatingFromString(
                                    result[0].result[0]
                                );
                                console.log("extractedHTML: ", extractedHTML);
                                // alert("extractedHTML: " + extractedHTML);
                                productInfo[key] = extractedHTML;
                            } else if (key == "warranty") {
                                extractedHTML = checkWarrantyDuration(
                                    result[0].result[0]
                                );
                                productInfo["warranty"] = extractedHTML;
                            } else if (key == "returnPolicy") {
                                extractedHTML = extractReturnPolicyDays(
                                    result[0].result[0]
                                );
                                productInfo["returnPolicy"] = extractedHTML;
                            } else if (key == "deliveryTime") {
                                extractedHTML = calculateDaysDifference(
                                    result[0].result[0]
                                );
                                productInfo["deliveryTime"] = extractedHTML;
                                isDoneExtracting = true;
                            } else {
                                extractedHTML = result[0].result[0];
                                productInfo[key] = extractedHTML;
                            }

                            // Store the extracted HTML data in the object
                            // extractedData[key] = extractedHTML;

                            if (key != "reviewArr" && extractedHTML) {
                                document.getElementById(key).innerHTML =
                                    extractedHTML;
                            }
                        } else {
                            // Handle errors or no data found
                            console.log(
                                "Error extracting HTML data for XPath:",
                                xpathExpression,
                                chrome.runtime.lastError || "No data found"
                            );
                            isDoneExtracting = true;
                        }
                    }
                );
            }
        }
    );
}

function extractRatingFromString(inputString) {
    // Regular expression to match the rating number
    const ratingRegex = /(\d\.?\d+)/;

    // Extract the rating number from the input string
    const match = inputString.match(ratingRegex);

    if (match) {
        return match[0]; // Return the extracted rating
    } else {
        return null; // Return null if rating is not found
    }
}

function extractRatingFromHtml(htmlString) {
    // Regular expression to match the div with class _3LWZlK and capture the rating number right after
    const regex = /class="_3LWZlK">\s*(\d+)/;
    const match = htmlString.match(regex);

    if (match && match[1]) {
        // console.log("Rating found:", match[1]);
        // alert(match);
        return match[1]; // Returns the rating
    } else {
        console.log("Rating not found.");
        return null; // No rating found
    }
}

function calculateDaysDifference(deliveryTime) {
    // Parse the delivery date string
    const deliveryDateParts = deliveryTime.split(", ");
    const [day, month] = deliveryDateParts[0].split(" ");
    const year = new Date().getFullYear(); // Get the current year
    const deliveryDateObj = new Date(`${month} ${day}, ${year}`);

    // Get today's date
    const today = new Date();

    // Calculate the difference in milliseconds
    const differenceInMilliseconds = deliveryDateObj - today;

    // Convert milliseconds to days
    const differenceInDays = Math.ceil(
        differenceInMilliseconds / (1000 * 60 * 60 * 24)
    );

    return differenceInDays;
}

// Example usage:
const deliveryTime = "10 Mar, Sunday";
const differenceInDays = calculateDaysDifference(deliveryTime);
console.log("Difference in days:", differenceInDays);

function extractNumericalValue(str) {
    return str.match(/\d/g).join("");
}

function checkWarrantyDuration(extractedHtml) {
    if (extractedHtml.includes("1 Year") || extractedHtml.includes("1 year")) {
        return 12; // Return 12 for 1 year
    }
    if (
        extractedHtml.includes("6 Months") ||
        extractedHtml.includes("6 months")
    ) {
        return 6; // Return 6 for 6 months
    }
    return 0; // Return 0 if neither 1 year nor 6 months found
}

function extractReturnPolicyDays(extractedHtml) {
    const regex = /(\d+)\s+Days?/i; // Regular expression to match the number of days
    const match = extractedHtml.match(regex); // Search for the number of days in the string
    if (match && match[1]) {
        return parseInt(match[1]); // Return the extracted number of days as an integer
    }
    return 0; // Return 0 if no matching number of days found
}

// Wait for the DOM content to be fully loaded
document.addEventListener("DOMContentLoaded", async function () {
    // await getHTMLData();
    // console.log("product info before score: ", productInfo);
    // let score = calculateScore(productInfo);
    // alert("Product Score: " + score);
    startCounter();

    getHTMLData();
});
