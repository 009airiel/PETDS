document.getElementById("checkBtn").addEventListener("click", () => {

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    let currentUrl = tabs[0].url;

    fetch("http://127.0.0.1:5000/scan", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({url: currentUrl})
    })
    .then(res => res.json())
    .then(data => {
        alert("Result: " + data.result);
    });
});

});