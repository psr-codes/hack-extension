import { calculateScore } from "./score.js";
let isDoneExtracting = false;

const productInfo = {
  rating: "4",
  numberOfRatings: 1000, // Example: number of ratings for the product
  numReviews: 500,
  warranty: 0, // Example: 'more than 1 year', 'between 6 months and 1 year', 'no warranty'
  returnPolicy: 0, // Example: 'yes', 'no'
  price: 99,
  reviewArr: 9,
};

function startCounter() {
  let intervalId = setInterval(() => {
    if (isDoneExtracting) {
      console.log(productInfo);
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

      const progressRing = document.querySelector(".progress-ring-circle");

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
  let classNames = {
    rating: "_3_L3jD",
    numberOfRatings: "_2_R_DZ",
    numReviews: "_2_R_DZ",
    price: "_30jeq3 _16Jk6d",
    reviewArr: "_1AtVbE col-12-12",
    warranty: "_352bdz",
    returnPolicy: "_2MJMLX",
  };

  // let extractedData = {};

  // Use chrome.tabs.query to get the active tab
  chrome.tabs.query(
    { lastFocusedWindow: true, active: true },
    async function (tabs) {
      // Iterate through each XPath expression and extract HTML data
      for (let key in classNames) {
        let className = classNames[key];
        // Use chrome.scripting.executeScript to inject a content script and execute code in the active tab
        let classes = className
          .split(" ")
          .map((cls) => `.${cls}`)
          .join("");

        chrome.scripting.executeScript(
          {
            // Specify the target tab where the script will be executed
            target: { tabId: tabs[0].id },
            // Function to be executed in the context of the active tab
            function: function (classes) {
              // Use document.evaluate to evaluate the XPath expression
              let elements = document.querySelectorAll(classes);
              let data = [];
              elements.forEach((element) => {
                data.push(element.innerText.trim());
              });
              return data;
            },
            // Pass the XPath expression as an argument to the function
            args: [classes],
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
              // Process the HTML data as needed
              let extractedHTML;

              if (key == "numberOfRatings") {
                extractedHTML = extractNumericalNumberOfRatings(
                  result[0].result[0]
                );

                productInfo[key] = extractedHTML;
              } else if (key == "price") {
                extractedHTML = result[0].result[0];

                productInfo[key] = extractedHTML;
              } else if (key == "numReviews") {
                extractedHTML = extractNumericalNumOfReviews(
                  result[0].result[0]
                );

                productInfo[key] = extractedHTML;
              } else if (key == "rating") {
                extractedHTML = extractRatingFromHtml(result[0].result[0]);
                productInfo[key] = extractedHTML;
              } else if (key == "warranty") {
                extractedHTML = checkWarrantyDuration(result[0].result[0]);
                productInfo[key] = extractedHTML;
              } else if (key == "returnPolicy") {
                extractedHTML = extractReturnPolicyDays(
                  result[0]?.result[2] || 0
                );

                productInfo[key] = extractedHTML;
              } else if (key == "reviewArr") {
                extractedHTML = result[0]?.result.length;
                console.log(extractedHTML);
                productInfo[key] = extractedHTML;
                isDoneExtracting = true;
              } else {
                console.log(result);
                extractedHTML = result[0].result[0];
                productInfo[key] = extractedHTML;
              }

              // Store the extracted HTML data in the object
              // extractedData[key] = extractedHTML;
              // console.log(key, " : ", extractedHTML);
              // Update the popup UI with the extracted HTML data
              if (
                key !== "reviewArr" &&
                key !== "numberOfRatings" &&
                key != "numReviews" &&
                key != "warranty" &&
                key != "returnPolicy"
              ) {
                document.getElementById(key).innerHTML = extractedHTML;
              } else if (key == "numberOfRatings" || key == "numReviews") {
                document.getElementById(key).innerHTML = parseInt(
                  extractedHTML,
                  10
                ).toLocaleString("en-IN");
              } else if (key == "warranty") {
                document.getElementById(key).innerHTML = `${extractedHTML} M`;
              } else if (key == "warranty") {
                document.getElementById(key).innerHTML = `${extractedHTML} M`;
              } else if (key == "returnPolicy") {
                document.getElementById(key).innerHTML = `${extractedHTML} D`;
              } else if (key == "reviewArr") {
                document.getElementById(key).innerHTML = extractedHTML;
              }
            } else {
              // Handle errors or no data found
              console.error(
                "Error extracting HTML data for XPath:",
                className,
                chrome.runtime.lastError || "No data found"
              );
            }
          }
        );
      }
    }
  );
}

function extractRatingFromHtml(htmlString) {
  if (htmlString[1] === ".") {
    let res = `${htmlString[0]}${htmlString[1]}${htmlString[2]}`;
    return res;
  } else {
    return htmlString[0];
  }
}

function extractNumericalNumberOfRatings(str) {
  const beforeRatings = str.split(" Ratings")[0];

  return beforeRatings.replace(/\D/g, "");
}
function extractNumericalNumOfReviews(str) {
  const beforeRatings = str.split(" Ratings")[1];

  return beforeRatings.replace(/\D/g, "");
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
// console.log("Difference in days:", differenceInDays);

function extractNumericalValue(str) {
  // console.log(str.match(/\d/g).join(""));
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
  if (extractedHtml == 0) {
    return 0;
  }
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
