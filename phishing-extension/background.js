chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scanUrl") {
        fetch("http://127.0.0.1:5000/scan", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({url: request.url})
        })
        .then(res => res.json())
        .then(data => {
            sendResponse({ result: data.result });
        })
        .catch(err => {
            sendResponse({ error: err.toString() });
        });
        
        return true;
    } else if (request.action === "scanEmail") {
        fetch("http://127.0.0.1:5000/scan_email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text: request.text })
        })
        .then(res => res.json())
        .then(data => {
            sendResponse({ result: data.result });
        })
        .catch(err => {
            sendResponse({ error: err.toString() });
        });
        
        return true;
    }
});
