
import sys
import os

# Add current directory to path
sys.path.insert(0, os.getcwd())

from AARTv1.backend.ingestion.loader import load_js_files
from AARTv1.backend.ingestion.extractor import extract_routes
from AARTv1.backend.symbolic import run_symbolic_engine

if __name__ == "__main__":
    test_path = os.path.join(os.getcwd(), "AARTv1", "backend", "test_app", "nested.js")
    with open(test_path, 'r') as f:
        source = f.read()
    
    routes = extract_routes("nested.js", source)
    print(f"Total routes: {len(routes)}")
    
    files = {"nested.js": source}
    sym_findings = run_symbolic_engine(routes, files)
    print(f"Symbolic findings count: {len(sym_findings)}")
    
    for f in sym_findings:
        print(f"\n--- Finding: {f.rule} ---")
        print(f"Route: {f.route.method} {f.route.path}")
        print(f"Evidence: {f.evidence}")
