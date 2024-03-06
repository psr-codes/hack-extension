async function fetchData() {
  try {
    const response = await fetch("https://icanhazdadjoke.com/slack");
    const data = await response.json();
    const joke = data?.attachments?.[0]?.text;
    console.log(joke); // Make sure joke is not undefined
    return joke;
  } catch (error) {
    console.error("Error fetching joke:", error);
    return null;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Function to update the popup UI with the URL
  function updatePopupWithUrl(url) {
    var urlElement = document.getElementById("url");
    urlElement.textContent = url;
  }

  // Request the URL from background script when the popup is loaded
  chrome.runtime.sendMessage({ action: "getURL" }, function (response) {
    if (response && response.url) {
      updatePopupWithUrl(response.url);
    } else {
      updatePopupWithUrl("Unable to retrieve the URL.");
    }
  });
});

// Wait for the DOM content to be fully loaded
document.addEventListener("DOMContentLoaded", async function () {
  document.getElementById("productScore").innerText =
    Math.floor(Math.random() * 11) + 90;

  // let url = await getActiveTabUrl();
  // document.getElementById("productScore").innerText = url;
});
