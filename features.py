import re

def extract_features(url):
    return [
        len(url),
        url.count('.'),
        url.count('-'),
        int(url.startswith("https")),
        int("@" in url),
        int("//" in url[7:]),
        int(bool(re.search(r"\d", url))),
        int("login" in url.lower()),   # 🔥 ADD THIS
        int("secure" in url.lower()),  # 🔥 ADD THIS
        int("account" in url.lower())  # 🔥 ADD THIS
    ]