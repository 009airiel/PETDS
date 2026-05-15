import requests
import time
from concurrent.futures import ThreadPoolExecutor

# The URL of your Flask backend
URL = "http://127.0.0.1:5000/scan"

# The fake phishing email payload to send repeatedly
payload = {
    "text": "URGENT: Your account has been compromised. Please click here to verify your identity immediately or your account will be locked.",
    "url": "http://fake-login-update.com"
}

def send_request(request_id):
    start_time = time.time()
    try:
        response = requests.post(URL, json=payload, timeout=5)
        latency = time.time() - start_time
        return response.status_code, latency
    except Exception as e:
        return str(e), time.time() - start_time

def run_stress_test(total_requests=500, concurrent_threads=50):
    print(f"Starting Stress Test on PETDS Backend...")
    print(f"Sending {total_requests} spam/phishing emails using {concurrent_threads} concurrent threads...\n")
    
    start_test_time = time.time()
    
    success_count = 0
    fail_count = 0
    total_latency = 0
    
    with ThreadPoolExecutor(max_workers=concurrent_threads) as executor:
        results = list(executor.map(send_request, range(total_requests)))
        
    for status, latency in results:
        if status == 200:
            success_count += 1
        else:
            fail_count += 1
        total_latency += latency
        
    end_test_time = time.time()
    total_time = end_test_time - start_test_time
    avg_latency = total_latency / total_requests if total_requests > 0 else 0
    rps = total_requests / total_time
    
    print("=== Stress Test Results ===")
    print(f"Total Requests Sent: {total_requests}")
    print(f"Successful Scans:    {success_count}")
    print(f"Failed/Dropped:      {fail_count}")
    print(f"Total Time Taken:    {total_time:.2f} seconds")
    print(f"Average Server Delay: {avg_latency*1000:.2f} ms per email")
    print(f"Throughput (RPS):    {rps:.2f} requests per second")
    print("===========================\n")

if __name__ == "__main__":
    # Make sure app.py is running in another terminal before running this!
    run_stress_test(total_requests=500, concurrent_threads=20)
