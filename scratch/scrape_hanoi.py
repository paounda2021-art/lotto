import urllib.request
import re
import json

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
}

def fetch_url(url):
    print(f"Fetching {url}...")
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            return response.read().decode('utf-8')
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return ""

html_special = fetch_url('https://exphuay.com/backward/xsthm')
html_vip = fetch_url('https://exphuay.com/backward/mlnhngo')

with open('scratch/special.html', 'w', encoding='utf-8') as f:
    f.write(html_special)

with open('scratch/vip.html', 'w', encoding='utf-8') as f:
    f.write(html_vip)

print("Saved special.html and vip.html")
