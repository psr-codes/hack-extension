// Define extractedData globally to make it accessible within the function and other parts of the code
let extractedData = {};

async function getHTMLData() {
  // Define XPath expressions for each HTML element you want to extract
  let xpaths = {
    rating:
      '//*[@id="container"]/div/div[3]/div[1]/div[2]/div[2]/div/div[2]/div/div',
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
    deliveryCharge:
      '//*[@id="container"]/div/div[3]/div[1]/div[2]/div[5]/div/div/div[2]/div[1]/ul/div/div[1]/span[1]',
  };

  // Use chrome.tabs.query to get the active tab
  chrome.tabs.query(
    { lastFocusedWindow: true, active: true },
    async function (tabs) {
      // Iterate through each XPath expression and extract HTML data
      for (let key in xpaths) {
        let xpathExpression = xpaths[key];
        // Use chrome.scripting.executeScript to inject a content script and execute code in the active tab
        await chrome.scripting.executeScript(
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
              let extractedHTML = result[0].result[0];
              // Store the extracted HTML data in the global object
              extractedData[key] = extractedHTML;

              // Update the popup UI with the extracted HTML data
              document.getElementById(key).innerHTML = extractedHTML;

              // Store extractedData in local storage
              chrome.storage.local.set(
                { extractedData: extractedData },
                function () {
                  if (chrome.runtime.lastError) {
                    console.error(
                      "Error storing extractedData in local storage:",
                      chrome.runtime.lastError
                    );
                  }
                }
              );
            } else {
              // Handle errors or no data found
              console.error(
                "Error extracting HTML data for XPath:",
                xpathExpression,
                chrome.runtime.lastError || "No data found"
              );
            }
          }
        );
      }
    }
  );
}

function calculateScore(productInfo) {
  let totalWeight = 0;
  let score = 0;

  // Rating (weight = 40)
  let rating = parseFloat(productInfo["rating"]);

  if (!isNaN(rating)) {
    let numberOfRatings = parseFloat(productInfo["rating"]);
    let normalizedRating = Math.min(rating / 5, 1);
    let ratingWeight =
      40 * (Math.log10(numberOfRatings + 1) / Math.log10(1001));
    score += normalizedRating * ratingWeight;
    totalWeight += ratingWeight;
  }

  console.log("rating", rating);

  // Number of reviews (weight = 10)
  let numReviews = parseFloat(productInfo["numReviews"].replace(/[^0-9]/g, ""));
  score += Math.min(numReviews / 100, 1) * 10;
  totalWeight += 10;

  console.log("numReviews", numReviews);

  // Sentiment of reviews (weight = 20)
  let reviewArr = productInfo["reviewArr"].length;
  if (reviewArr > 45000) {
    score += 50;
    totalWeight += 50;
  } else {
    score += 10;
    totalWeight += 10;
  }

  // alert(reviewArr);

  // Warranty (weight = 10)
  let warranty = checkWarrantyDuration(productInfo["warranty"]);
  if (warranty && warranty !== 0) {
    if (warranty === 12) {
      score += 10;
    } else if (warranty === 6) {
      score += 5;
    }
    totalWeight += 10;
  }

  console.log("warranty", warranty);

  // Return policy (weight = 5)
  let returnPolicy = extractReturnPolicyDays(productInfo["returnPolicy"]);
  score += returnPolicy;
  totalWeight += returnPolicy;

  console.log("returnPolicy", returnPolicy);

  // Delivery charges (weight = 5)
  // let deliveryCharges = parseFloat(productInfo["deliveryCharge"]);
  // if (!isNaN(deliveryCharges)) {
  //   score += deliveryCharges;
  //   totalWeight += 5;
  // }

  let scaledScore = totalWeight === 0 ? 0 : (score / totalWeight) * 100;

  console.log(scaledScore);
  return Math.floor(scaledScore);
}

function extractRatingFromHtml(htmlString) {
  // Regular expression to match the div with class _3LWZlK and capture the rating number right after
  const regex = /class="_3LWZlK">\s*(\d+)/;
  const match = htmlString.match(regex);

  if (match && match[1]) {
    // console.log("Rating found:", match[1]);
    return match[1]; // Returns the rating
  } else {
    console.log("Rating not found.");
    return null; // No rating found
  }
}

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
  await getHTMLData();

  // Retrieve extractedData from local storage
  chrome.storage.local.get("extractedData", function (result) {
    if (chrome.runtime.lastError) {
      console.error(
        "Error retrieving extractedData from local storage:",
        chrome.runtime.lastError
      );
    } else {
      let extractedDataFromStorage = result["extractedData"];
      // console.log("rating", extractedDataFromStorage["rating"]);

      extractedDataFromStorage["rating"] = extractRatingFromHtml(
        extractedDataFromStorage["rating"]
      );
      document.getElementById("productScore").innerHTML = calculateScore(
        extractedDataFromStorage
      );
    }
  });
});
