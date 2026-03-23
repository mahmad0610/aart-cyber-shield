
import sys
import os

# Add current directory to path
sys.path.insert(0, os.getcwd())

from AARTv1.backend.ingestion.loader import load_js_files
from AARTv1.backend.ingestion.extractor import extract_routes

if __name__ == "__main__":
    test_path = os.path.join(os.getcwd(), "AARTv1", "backend", "test_app", "same_file_router.js")
    with open(test_path, 'r') as f:
        source = f.read()
    
    routes = extract_routes("same_file_router.js", source)
    print(f"Total routes: {len(routes)}")
    
    for r in routes:
        print(f"  {r.method} {r.path}")
