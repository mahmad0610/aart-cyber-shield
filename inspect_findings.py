
import sys
import os
from dotenv import load_dotenv

# Add current directory to path
sys.path.insert(0, os.getcwd())

backend_path = os.path.join(os.getcwd(), "AARTv1", "backend")
load_dotenv(os.path.join(backend_path, ".env"))

from AARTv1.backend.pipeline import run_pipeline

if __name__ == "__main__":
    test_app_path = os.path.abspath(os.path.join(backend_path, "test_app"))
    state = run_pipeline(repo_path=test_app_path)
    
    for f in state.sym_findings:
        print(f"\n--- Finding for {f.route.method} {f.route.path} ---")
        print(f"Rule: {f.rule}")
        print(f"Evidence: {f.evidence}")
        print(f"Tainted set: {getattr(f, 'tainted_set', 'N/A')}")
