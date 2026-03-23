
import sys
import os

# Add current directory to path
sys.path.insert(0, os.getcwd())

from AARTv1.backend.ingestion.loader import load_js_files
from AARTv1.backend.ingestion.extractor import extract_routes
from AARTv1.backend.symbolic import run_symbolic_engine

if __name__ == "__main__":
    test_app_path = os.path.join(os.getcwd(), "AARTv1", "backend", "test_app")
    files = load_js_files(test_app_path)
    print(f"Files loaded: {list(files.keys())}")
    
    all_routes = []
    for filepath, source in files.items():
        routes = extract_routes(filepath, source)
        all_routes.extend(routes)
        
    print(f"Total routes: {len(all_routes)}")
    sym_findings = run_symbolic_engine(all_routes, files)
    print(f"Symbolic findings count: {len(sym_findings)}")
    
    for f in sym_findings:
        print(f"\n--- Finding: {f.rule} ---")
        print(f"Route: {f.route.method} {f.route.path}")
        print(f"Confidence: {f.confidence}")
        print(f"Evidence: {f.evidence}")
