
import sys
import os

# Add current directory to path
sys.path.insert(0, os.getcwd())

from AARTv1.backend.ingestion.loader import load_js_files
from AARTv1.backend.ingestion.extractor import extract_routes

if __name__ == "__main__":
    test_path = os.path.join(os.getcwd(), "AARTv1", "backend", "test_app", "router_app")
    files = load_js_files(test_path)
    
    all_routes = []
    for filepath, source in files.items():
        print(f"\nProcessing {os.path.basename(filepath)}...")
        routes = extract_routes(filepath, source)
        for r in routes:
            print(f"  {r.method} {r.path} in {os.path.basename(r.source_file)}")
        all_routes.extend(routes)
        
    print(f"\nTotal routes: {len(all_routes)}")
