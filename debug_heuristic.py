import sys
import os

# Change to backend directory
os.chdir(r"F:\AART\aart-cyber-shield\AARTv1\backend")
sys.path.insert(0, r"F:\AART\aart-cyber-shield\AARTv1\backend")

# Load .env FIRST
from dotenv import load_dotenv
load_dotenv(".env")

from ingestion.loader import load_js_files
from ingestion.extractor import extract_routes
from scanner import run_heuristic_scanner

# Load files
files = load_js_files('test_app')
print(f"Files loaded: {list(files.keys())}")

# Extract routes
all_routes = []
for filepath, source in files.items():
    routes = extract_routes(filepath, source)
    print(f"Routes from {filepath}: {len(routes)}")
    for r in routes:
        print(f"  {r.method} {r.path} — handler={r.handler}, has_ast={r.handler_ast is not None}")
        if r.handler_ast:
            print(f"    AST body type: {type(r.handler_ast)}, statements: {len(r.handler_ast.body) if hasattr(r.handler_ast, 'body') else 'N/A'}")
    all_routes.extend(routes)

print(f"\nTotal routes: {len(all_routes)}")

# Run heuristic scanner
print("\nRunning heuristic scanner...")
heuristic_findings = run_heuristic_scanner(all_routes)
print(f"Heuristic findings: {len(heuristic_findings)}")

for f in heuristic_findings:
    print(f"  {f.rule}: {f.route.method} {f.route.path} (conf={f.confidence})")
