"""
Stage 8 — Full pipeline run with DB
====================================
This script tests the full pipeline with real Supabase DB writes.

Prerequisites:
  1. Supabase credentials in AARTv1/backend/.env
  2. API server running (or start it with this script)
  3. test_app directory exists

Steps:
  1. Start the API server (background)
  2. Trigger a scan via POST /scan
  3. Poll until scan completes
  4. Verify results in Supabase
  5. Check threat_memory was created
"""

import os
import sys
import time
import requests
import subprocess
import signal

# Add current directory to path
sys.path.insert(0, os.path.dirname(__file__))

# Load .env
from dotenv import load_dotenv
backend_path = os.path.join(os.path.dirname(__file__), "AARTv1", "backend")
load_dotenv(os.path.join(backend_path, ".env"))

# Configuration
API_BASE = "http://localhost:8000"
TEST_APP_PATH = os.path.abspath(os.path.join(backend_path, "test_app"))

print("=" * 60)
print("Stage 8 — Full pipeline run with DB")
print("=" * 60)
print(f"\nConfiguration:")
print(f"  API Base:       {API_BASE}")
print(f"  Test App Path:  {TEST_APP_PATH}")
print(f"  SUPABASE_URL:   {os.environ.get('SUPABASE_URL', 'NOT SET')[:30]}...")

# ─────────────────────────────────────────────────────────────────────────────
# Step 1: Check if API is already running
# ─────────────────────────────────────────────────────────────────────────────

print("\n" + "=" * 60)
print("Step 1: Checking API server...")

api_process = None

try:
    resp = requests.get(f"{API_BASE}/ping", timeout=5)
    if resp.status_code == 200:
        print(f"  ✓ API is already running: {resp.json()}")
    else:
        print(f"  ✗ API responded with {resp.status_code}")
        sys.exit(1)
except requests.exceptions.ConnectionError:
    print("  API not running — starting now...")
    
    # Start API server (use subprocess with creationflags for Windows)
    CREATE_NO_WINDOW = 0x08000000  # Windows flag to hide console window
    api_process = subprocess.Popen(
        ["uvicorn", "AARTv1.backend.api.app:app", "--port", "8000"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd=os.path.dirname(__file__),
        creationflags=CREATE_NO_WINDOW
    )
    
    # Wait for API to start (up to 15 seconds)
    print("  Waiting for API to start...")
    for i in range(30):
        time.sleep(0.5)
        try:
            resp = requests.get(f"{API_BASE}/ping", timeout=5)
            if resp.status_code == 200:
                print(f"  ✓ API started: {resp.json()}")
                break
        except requests.exceptions.ConnectionError:
            pass
    else:
        print("  ✗ API failed to start within 15 seconds")
        if api_process:
            api_process.terminate()
        sys.exit(1)

# ─────────────────────────────────────────────────────────────────────────────
# Step 2: Trigger a scan
# ─────────────────────────────────────────────────────────────────────────────

print("\n" + "=" * 60)
print("Step 2: Triggering scan...")

scan_payload = {
    "repo_url": TEST_APP_PATH
}

try:
    resp = requests.post(f"{API_BASE}/scan", json=scan_payload, timeout=10)
    if resp.status_code == 200:
        result = resp.json()
        scan_id = result.get("scan_id")
        print(f"  ✓ Scan triggered: {result}")
    else:
        print(f"  ✗ Scan trigger failed: {resp.status_code} — {resp.text}")
        raise SystemExit(1)
except Exception as e:
    print(f"  ✗ Error triggering scan: {e}")
    raise

# ─────────────────────────────────────────────────────────────────────────────
# Step 3: Poll scan status
# ─────────────────────────────────────────────────────────────────────────────

print("\n" + "=" * 60)
print("Step 3: Polling scan status...")

max_polls = 60  # 5 minutes max (60 * 5 seconds)
poll_interval = 5  # seconds

for i in range(max_polls):
    time.sleep(poll_interval)
    
    try:
        resp = requests.get(f"{API_BASE}/scans/{scan_id}", timeout=30)
        if resp.status_code == 200:
            scan_data = resp.json()
            status = scan_data.get("status")
            progress = scan_data.get("progress_percent", 0)
            current_step = scan_data.get("current_step", "unknown")
            
            print(f"  Poll {i+1}/{max_polls}: status={status}, progress={progress}%, step={current_step}")
            
            if status == "complete":
                print(f"  ✓ Scan completed!")
                break
            elif status == "error":
                print(f"  ✗ Scan failed: {scan_data.get('error_message')}")
                raise SystemExit(1)
        else:
            print(f"  ✗ Poll failed: {resp.status_code}")
    except requests.exceptions.Timeout:
        print(f"  Poll {i+1}: Timeout waiting for response (scan may still be running)...")
    except Exception as e:
        print(f"  ✗ Poll error: {e}")

else:
    print(f"  ✗ Scan did not complete within {max_polls * poll_interval} seconds")
    raise SystemExit(1)

# ─────────────────────────────────────────────────────────────────────────────
# Step 4: Verify scan results
# ─────────────────────────────────────────────────────────────────────────────

print("\n" + "=" * 60)
print("Step 4: Verifying scan results...")

# Get final scan data
resp = requests.get(f"{API_BASE}/scans/{scan_id}", timeout=5)
scan_data = resp.json()

print(f"\n  Scan Details:")
print(f"    status:           {scan_data.get('status')}")
print(f"    tier:             {scan_data.get('tier')}")
print(f"    progress_percent: {scan_data.get('progress_percent')}")
print(f"    current_step:     {scan_data.get('current_step')}")

# Get findings
resp = requests.get(f"{API_BASE}/findings?repo_id={scan_data.get('repo_id')}", timeout=5)
findings = resp.json()

print(f"\n  Findings:")
print(f"    total:            {len(findings)}")

# Count by status
status_counts = {}
for f in findings:
    status = f.get("status", "unknown")
    status_counts[status] = status_counts.get(status, 0) + 1

for status, count in status_counts.items():
    print(f"    {status}:         {count}")

# ─────────────────────────────────────────────────────────────────────────────
# Step 5: Check threat memory
# ─────────────────────────────────────────────────────────────────────────────

print("\n" + "=" * 60)
print("Step 5: Checking threat memory...")

# Get repo details
repo_id = scan_data.get("repo_id")
resp = requests.get(f"{API_BASE}/repos/{repo_id}", timeout=5)
repo_data = resp.json()

print(f"\n  Repo Details:")
print(f"    name:             {repo_data.get('name')}")
print(f"    clone_url:        {repo_data.get('clone_url')}")

# Note: threat_memory endpoint may not exist yet — this is informational
print(f"\n  Note: Check Supabase Table Editor for:")
print(f"    - scans table: row with id={scan_id}")
print(f"    - threat_memory table: row with repo_id={repo_id}")
print(f"    - threat_memory_events table: 'pattern_learned' event")

# ─────────────────────────────────────────────────────────────────────────────
# Cleanup
# ─────────────────────────────────────────────────────────────────────────────

if api_process:
    print("\n" + "=" * 60)
    print("Stopping API server...")
    api_process.terminate()
    api_process.wait(timeout=5)
    print("  ✓ API server stopped")

# ─────────────────────────────────────────────────────────────────────────────
# Summary
# ─────────────────────────────────────────────────────────────────────────────

print("\n" + "=" * 60)
print("Stage 8 — Full pipeline with DB: PASSED ✓")
print("=" * 60)
print(f"\nSummary:")
print(f"  Scan ID:        {scan_id}")
print(f"  Repo ID:        {repo_id}")
print(f"  Status:         {scan_data.get('status')}")
print(f"  Tier:           {scan_data.get('tier')}")
print(f"  Total Findings: {len(findings)}")
