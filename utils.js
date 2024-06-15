// let btn = document.getElementById("subscribeBtn")

// btn.onclick = async function (){
//     window.location.href = "https://shopsmart-auth.vercel.app"
//     window.location.href = "https://www.google.com/"
// }

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("subscribeLink").addEventListener("click", function() {
        chrome.tabs.create({ url: "https://www.google.com/" });
    });
});