async function fetchData(url) {
    // url = "https://icanhazdadjoke.com/slack";
    if (!url) {
        console.error("No url provided");
        return NAN;
    }

    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json", // Adjust content type if sending different data format
        },
        body: JSON.stringify(url), // Convert data object to JSON string
    };
    try {
        // const response = await fetch(url);
        const response = await fetch(url, requestOptions);
        const data = await response.json(url);
        const joke = data?.attachments?.[0]?.text;
        console.log(joke); // Make sure joke is not undefined
        return joke;
    } catch (error) {
        console.error("Error calculating score:", error);
        return NAN;
    }
}

async function getActiveTabUrl() {
    chrome.tabs.query(
        {
            lastFocusedWindow: true,
            active: true,
        },
        async function (tabs) {
            console.log("tabs: ", tabs);
            alert(tabs[0].url);
            console.log(tabs[0].url);

            let res = await fetchData(tabs[0].url);
            document.getElementById("productScore").innerText = res;
        }
    );
}

// Wait for the DOM content to be fully loaded
document.addEventListener("DOMContentLoaded", async function () {
    // document.getElementById("productScore").innerText =
    //     Math.floor(Math.random() * 11) + 90;

    await getActiveTabUrl();
});
