import json
import os
import sys
from pathlib import Path
from tempfile import NamedTemporaryFile

from google_auth_oauthlib.flow import InstalledAppFlow


if len(sys.argv) != 2:
    raise SystemExit("Usage: python scripts/gtm-login.py /path/to/client_secret.json")

flow = InstalledAppFlow.from_client_secrets_file(
    sys.argv[1],
    scopes=[
        "https://www.googleapis.com/auth/tagmanager.edit.containers",
        "https://www.googleapis.com/auth/tagmanager.edit.containerversions",
    ],
    autogenerate_code_verifier=True,
)
credentials = flow.run_local_server(port=0, prompt="consent select_account", timeout_seconds=300)
if not credentials.refresh_token:
    raise SystemExit("Google did not return a refresh token. Run this command again and grant access.")

directory = Path.home() / ".config" / "googlegtm-ai-ops"
directory.mkdir(mode=0o700, parents=True, exist_ok=True)
with NamedTemporaryFile(mode="w", dir=directory, encoding="utf-8", delete=False) as output:
    temporary = Path(output.name)
    try:
        json.dump(
            {
                "client_id": credentials.client_id,
                "client_secret": credentials.client_secret,
                "refresh_token": credentials.refresh_token,
            },
            output,
        )
        output.close()
        os.replace(temporary, directory / "application_default_credentials.json")
    finally:
        temporary.unlink(missing_ok=True)

print("Saved the Google Tag Manager login for both terminal clients.")
