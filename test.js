async function getHTMLData() {
  let rating =
    '//*[@id="productRating_LSTACCG48F2YZNGZ8D2LDR2OK_ACCG48F2YZNGZ8D2_"]/div';

  let numberOfRatings =
    '//*[@id="container"]/div/div[3]/div[1]/div[2]/div[2]/div/div[2]/div/div/span[2]/span/span[1]';
  let numReviews =
    '//*[@id="container"]/div/div[3]/div[1]/div[2]/div[2]/div/div[2]/div/div/span[2]/span/span[3]';
  let reviewArr =
    '//*[@id="container"]/div/div[3]/div[1]/div[2]/div[8]/div[6]/div/div[4]';
  let warranty =
    '//*[@id="container"]/div/div[3]/div[1]/div[2]/div[4]/div/div[2]/div';
  let returnPolicy =
    '//*[@id="container"]/div/div[3]/div[1]/div[2]/div[8]/div[1]/div/div[2]/div[2]/ul/li[1]/div';
  let deliveryCharge =
    '//*[@id="container"]/div/div[3]/div[1]/div[2]/div[5]/div/div/div[2]/div[1]/ul/div/div[1]/span[1]';

  // Use chrome.tabs.query to get the active tab
  chrome.tabs.query(
    { lastFocusedWindow: true, active: true },
    async function (tabs) {
      // console.log("tabs: ", tabs, tabs[0].url);
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
            // console.log(node);
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
          args: [rating],
        },
        function (result) {
          // Handle the result returned by the content script
          if (!chrome.runtime.lastError && result && result.length > 0) {
            // Extracted data is available in the result array
            console.log("HTML data extracted from XPath:", result[0].result[0]);
            // Process the HTML data as needed
            let extractedHTML = result[0].result[0];
            // Update the popup UI with the extracted HTML data
            document.getElementById("rating").innerHTML = extractedHTML;
          } else {
            // Handle errors or no data found
            console.error(
              "Error extracting HTML data:",
              chrome.runtime.lastError || "No data found"
            );
          }
        }
      );
    }
  );
}

// Wait for the DOM content to be fully loaded
document.addEventListener("DOMContentLoaded", async function () {
  await getHTMLData();
});
