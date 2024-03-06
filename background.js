chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "get_tab_msg") {
        // The content script has asked for the tab.
        sendResponse({ tab: sender.tab });
        console.log(sender.tab);
        alert(sender.tab);
    }
});
