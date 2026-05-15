function scanInbox() {
    let emails = document.querySelectorAll("tr.zA");

    emails.forEach(email => {
        let text = email.innerText || "";
        if (text.trim().length < 10) return; // Wait for Gmail to load text

        // Prevent infinite re-scanning
        if (email.dataset.scanned) return;
        email.dataset.scanned = "true";

        chrome.runtime.sendMessage({ action: "scanEmail", text: text }, (response) => {
            if (response && response.result) {
                if (response.result === "Suspicious Email") {
                    email.style.borderLeft = "5px solid red";
                } else {
                     email.style.borderLeft = "5px solid rgba(82, 196, 26, 0.5)"; // Green for safe
                }
            }
        });
    });
}

function scanOpenedEmail() {
    let body = document.querySelector("div.a3s"); // Gmail email content

    if (body) {
        let text = body.innerText || "";
        if (text.trim().length < 10) return; // Wait for Gmail to load text

        if (body.dataset.scanned) return;
        body.dataset.scanned = "true";

        // Create a note container
        let noteDiv = document.createElement("div");
        Object.assign(noteDiv.style, {
            padding: "12px",
            marginBottom: "15px",
            fontWeight: "600",
            borderRadius: "8px",
            display: "none", // Hidden until results come back
            fontFamily: "Arial, sans-serif",
            fontSize: "14px"
        });
        body.insertBefore(noteDiv, body.firstChild);

        // Scan email text using ML model
        chrome.runtime.sendMessage({ action: "scanEmail", text: text }, (response) => {
            if (response && response.result === "Suspicious Email") {
                body.style.border = "5px solid red";
                body.style.padding = "10px";
                noteDiv.style.display = "block";
                noteDiv.style.backgroundColor = "#ffe6e6";
                noteDiv.style.color = "#d93025";
                noteDiv.style.borderLeft = "4px solid #d93025";
                noteDiv.innerText = "⚠️ WARNING: Suspicious email content detected.";
            } else {
                body.style.border = "5px solid rgba(82, 196, 26, 0.5)";
                body.style.padding = "10px";
                noteDiv.style.display = "block";
                noteDiv.style.backgroundColor = "#e6f4ea";
                noteDiv.style.color = "#137333";
                noteDiv.style.borderLeft = "4px solid #137333";
                noteDiv.innerText = "✅ This email appears to be safe.";
            }
        });
    }
}

// Run both
setInterval(() => {
    scanInbox();
    scanOpenedEmail();
}, 3000);