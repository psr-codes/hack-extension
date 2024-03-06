chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "getURL") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var url = tabs[0].url;
      sendResponse({ url: url });
    });
    return true; // Indicates that sendResponse will be called asynchronously
  }
});
