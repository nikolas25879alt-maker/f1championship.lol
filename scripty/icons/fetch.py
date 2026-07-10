import os
import requests
from urllib.parse import quote

BASE_URL = "https://silentnet.st/static/icons/small"

# All names in LOWERCASE – these will be used directly in the URL
BROWSERS = [
    "chrome", "edge", "firefox", "opera", "brave", "vivaldi", "yandex",
    "comet", "zen", "arc", "safari", "chromium", "tor", "iridium", "falkon"
]

WALLETS = [
    "exodus", "metamask", "phantom", "solflare", "trustwallet", "coinbase",
    "bitcoincore", "electrum", "atomic", "guarda", "ledger", "trezor",
    "keplr", "cosmostation", "xdefi", "rainbow", "argent", "zerion",
    "rabby", "bitkeep", "tokenpocket", "mathwallet", "safepal"
]

APPLICATIONS = [
    "discord", "telegram", "steam", "roblox", "spotify", "slack",
    "zoom", "teams", "outlook", "thunderbird", "notepad++", "vscode",
    "filezilla", "winscp", "putty", "mobaxterm", "anydesk", "teamviewer",
    "nordvpn", "protonvpn", "windscribe", "surfshark"
]

def download_icon(category, name):
    folder = os.path.join("small", category)
    os.makedirs(folder, exist_ok=True)

    local_filename = f"{name}.png"
    filepath = os.path.join(folder, local_filename)

    if os.path.exists(filepath):
        print(f"✅ Already exists: {filepath}")
        return True

    # URL uses the lowercase name directly
    url = f"{BASE_URL}/{category}/{quote(name)}.png"
    print(f"Fetching: {url}")

    try:
        resp = requests.get(url, timeout=10)
        if resp.status_code == 200:
            with open(filepath, 'wb') as f:
                f.write(resp.content)
            print(f"✅ Saved as: {filepath}")
            return True
        else:
            print(f"❌ Not found (HTTP {resp.status_code}): {url}")
            return False
    except Exception as e:
        print(f"⚠️ Error: {e}")
        return False

def main():
    total = success = 0
    for category, names in [("browsers", BROWSERS), ("wallets", WALLETS), ("applications", APPLICATIONS)]:
        for name in names:
            if download_icon(category, name):
                success += 1
            total += 1
    print(f"\nDone: {success}/{total} icons downloaded.")

if __name__ == "__main__":
    main()