# Stage 7 — Full pipeline run (no DB)
# Run this from the project root: python test_pipeline_no_db.py

import sys
import os

# Add current directory to path so AARTv1.backend works as a package
sys.path.insert(0, os.path.dirname(__file__))

# Load .env
from dotenv import load_dotenv
backend_path = os.path.join(os.path.dirname(__file__), "AARTv1", "backend")
load_dotenv(os.path.join(backend_path, ".env"))

print(f"Loaded .env from {backend_path}")
print(f"  SUPABASE_URL: {os.environ.get('SUPABASE_URL', 'NOT SET')[:20]}...")
print(f"  GROQ_API_KEY: {os.environ.get('GROQ_API_KEY', 'NOT SET')[:10]}...")

from AARTv1.backend.pipeline import run_pipeline

if __name__ == "__main__":
    # Use absolute path to test_app
    test_app_path = os.path.abspath(os.path.join(backend_path, "test_app"))
    
    print(f"\nRunning full pipeline (no DB writes) on {test_app_path}...")
    print("=" * 60)
    
    state = run_pipeline(repo_path=test_app_path)
    
    print("\n" + "=" * 60)
    print("Results:")
    print(f"  tier:           {state.tier}")
    print(f"  routes:         {len(state.all_routes)}")
    print(f"  heuristic:      {len(state.heuristic_findings)}")
    print(f"  sym_findings:   {len(state.sym_findings)}")
    print(f"  confirmed_ids:  {state.confirmed_finding_ids}")  # empty — no DB
    print(f"  advisory:       {len(state.advisory_findings)}")
    print(f"  aborted:        {state.aborted}")
    print(f"  error:          {state.error}")
    
    # Print route details
    if state.all_routes:
        print("\nRoutes extracted:")
        for r in state.all_routes:
            print(f"  {r.method} {r.path} — handler={r.handler}, has_ast={r.handler_ast is not None}")
    
    # Assertions
    assert state.aborted == False, "Pipeline aborted unexpectedly"
    assert state.error is None, f"Pipeline error: {state.error}"
    assert len(state.all_routes) > 0, "No routes extracted"
    
    # Print LLM confidence adjustments
    if state.llm_confidences:
        print("\nLLM confidence adjustments:")
        for route, conf in state.llm_confidences.items():
            print(f"  {route}: llm_conf={conf:.2f}")
    
    # Print sandbox results
    if state.sandbox_results:
        print("\nSandbox results:")
        for route, result in state.sandbox_results.items():
            print(f"  {route}: confirmed={result.confirmed} reason={result.failure_reason}")
    
    # Print findings detail
    if state.sym_findings:
        print("\nSymbolic findings detail:")
        for f in state.sym_findings:
            route_key = f"{f.route.method} {f.route.path}"
            print(f"  {route_key}: rule={f.rule}, confidence={f.confidence:.2f}, status={f.status}")
    
    if state.heuristic_findings:
        print("\nHeuristic findings detail:")
        for f in state.heuristic_findings:
            route_key = f"{f.route.method} {f.route.path}"
            print(f"  {route_key}: rule={f.rule}, confidence={f.confidence:.2f}")
    
    print("\n" + "=" * 60)
    print("Full pipeline (no DB) PASSED ✓")
