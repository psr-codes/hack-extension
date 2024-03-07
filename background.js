// // Listen for messages from popup script
// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//   if (request.action === "getHTMLData") {
//     // Perform HTML data extraction
//     getHTMLData(function (htmlData) {
//       // Send HTML data back to popup script
//       sendResponse(htmlData);
//     });
//     // Return true to indicate that the response will be sent asynchronously
//     return true;
//   }
// });

// // Function to extract HTML data using Selenium
// function getHTMLData(callback) {
//   // Use Selenium to extract HTML data using XPath
//   // Example code to extract HTML data with Selenium goes here
//   // For example:
//   let htmlData = "HTML data extracted using Selenium";
//   // Call the callback function with the extracted HTML data
//   callback(htmlData);
// }
