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

async function getActiveTabUrl() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

// Wait for the DOM content to be fully loaded
document.addEventListener("DOMContentLoaded", async function () {
    document.getElementById("productScore").innerText =
        Math.floor(Math.random() * 11) + 90;

    // let url = await getActiveTabUrl();
    // document.getElementById("productScore").innerText = url;
});
