(function() {
    // Only run on the main frame, not iframes to avoid multiple notifications
    if (window.top !== window.self) return;

    const currentUrl = window.location.href;
    
    // Ignore Gmail so the extension doesn't flag the email client itself
    if (currentUrl.includes("mail.google.com")) return;

    // Trusted domains — well-known sites that don't need ML scanning
    const trustedDomains = [
        "google.com", "google.com.my", "youtube.com", "gmail.com", "goo.gl", "youtu.be",
        "facebook.com", "fb.com", "instagram.com", "twitter.com", "x.com",
        "linkedin.com", "reddit.com", "wikipedia.org", "tiktok.com",
        "whatsapp.com", "telegram.org", "discord.com", "discord.gg", "twitch.tv",
        "pinterest.com", "tumblr.com", "quora.com",
        "shopee.com.my", "shopee.com", "shopee.co.id",
        "lazada.com.my", "lazada.com", "lazada.sg",
        "grab.com", "foodpanda.com.my", "foodpanda.com", "traveloka.com",
        "spx.com.my", "ninjavan.co", "poslaju.com.my", "jnt.com.my",
        "dhl.com", "fedex.com", "ups.com",
        "maybank2u.com.my", "maybank.com.my", "cimbclicks.com.my", "cimb.com",
        "pbebank.com", "publicbank.com.my", "hlb.com.my", "rhbgroup.com",
        "bankislam.com", "bimb.com.my", "bsn.com.my", "bankrakyat.com.my",
        "ambank.com.my", "affinbank.com.my", "hsbc.com.my",
        "ocbc.com.my", "uob.com.my", "sc.com",
        "touchngo.com.my", "boost.com.my", "bigpay.com", "setel.com",
        "netflix.com", "spotify.com", "microsoft.com", "apple.com",
        "amazon.com", "ebay.com", "paypal.com", "stripe.com",
        "github.com", "stackoverflow.com", "medium.com", "substack.com",
        "airasia.com", "malaysiaairlines.com", "booking.com", "agoda.com",
        "kfc.com.my", "mcdonalds.com.my", "dominos.com.my", "pizzahut.com.my",
        "fiuu.com", "ipay88.com",
        "tryhackme.com", "hackthebox.com", "openai.com", "chatgpt.com",
        "coursera.org", "udemy.com", "skillshare.com",
        "cisco.com", "netacad.com",
        "unikl.edu.my", "um.edu.my", "ukm.my", "upm.edu.my",
        "utm.my", "usm.my", "uitm.edu.my", "mmu.edu.my",
        "edu.my", "gov.my"
    ];

    // Check if URL belongs to a trusted domain
    function isTrustedUrl(url) {
        try {
            const hostname = new URL(url).hostname;
            return trustedDomains.some(domain => 
                hostname === domain || hostname.endsWith("." + domain)
            );
        } catch (e) {
            return false;
        }
    }

    // Skip ML scan for trusted domains
    if (isTrustedUrl(currentUrl)) {
        showNotification("Legitimate");
        return;
    }

    chrome.runtime.sendMessage({ action: "scanUrl", url: currentUrl }, (response) => {
        if (response && response.result) {
            showNotification(response.result);
        } else if (response && response.error) {
            console.error("Phishing Detector Error:", response.error);
        }
    });

    function showNotification(result) {
        const isHarmful = result === "Harmful";
        
        const notifyContainer = document.createElement("div");
        notifyContainer.id = "phishing-detector-notification";
        
        // Setup styling for a modern, sleek UI
        const bgColor = isHarmful ? "rgba(255, 77, 79, 0.95)" : "rgba(82, 196, 26, 0.95)";
        const iconSymbol = isHarmful ? "⚠️" : "✅";
        const titleText = isHarmful ? "Warning: Harmful Website" : "Website Safe";
        const messageText = isHarmful ? "This URL has been flagged as a potential phishing site." : "This URL appears to be legitimate.";

        Object.assign(notifyContainer.style, {
            position: "fixed",
            top: "20px",
            right: "-400px", // start offscreen for animation
            width: "350px",
            backgroundColor: bgColor,
            color: "white",
            padding: "16px 24px",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            fontSize: "14px",
            zIndex: "2147483647", // Max z-index to stay on top
            display: "flex",
            alignItems: "center",
            gap: "16px",
            transition: "all 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55)", // Bouncy transition
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.2)",
            boxSizing: "border-box"
        });

        const iconDiv = document.createElement("div");
        Object.assign(iconDiv.style, {
            fontSize: "28px"
        });
        iconDiv.innerText = iconSymbol;

        const textDiv = document.createElement("div");
        Object.assign(textDiv.style, {
            display: "flex",
            flexDirection: "column",
            gap: "4px"
        });

        const title = document.createElement("strong");
        Object.assign(title.style, {
            fontSize: "16px",
            fontWeight: "600",
            margin: "0",
            padding: "0"
        });
        title.innerText = titleText;

        const message = document.createElement("span");
        Object.assign(message.style, {
            fontSize: "13px",
            opacity: "0.95",
            margin: "0",
            padding: "0",
            lineHeight: "1.4"
        });
        message.innerText = messageText;

        textDiv.appendChild(title);
        textDiv.appendChild(message);

        const closeBtn = document.createElement("div");
        Object.assign(closeBtn.style, {
            marginLeft: "auto",
            cursor: "pointer",
            fontSize: "18px",
            opacity: "0.7",
            padding: "4px",
            lineHeight: "1",
            transition: "opacity 0.2s"
        });
        closeBtn.innerHTML = "✕";
        closeBtn.onmouseover = () => closeBtn.style.opacity = "1";
        closeBtn.onmouseout = () => closeBtn.style.opacity = "0.7";
        closeBtn.onclick = () => {
            notifyContainer.style.right = "-400px";
            setTimeout(() => notifyContainer.remove(), 500);
        };

        notifyContainer.appendChild(iconDiv);
        notifyContainer.appendChild(textDiv);
        notifyContainer.appendChild(closeBtn);

        document.body.appendChild(notifyContainer);

        // Trigger animation
        setTimeout(() => {
            notifyContainer.style.right = "20px";
        }, 100);

        // Auto remove after 5 seconds if safe, but keep harmful alerts on screen
        if (!isHarmful) {
            setTimeout(() => {
                if (notifyContainer.parentNode) {
                    notifyContainer.style.right = "-400px";
                    setTimeout(() => {
                        if (notifyContainer.parentNode) {
                            notifyContainer.remove();
                        }
                    }, 500);
                }
            }, 5000);
        }
    }
})();
