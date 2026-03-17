"""
Debug script to see what the symbolic engine is seeing
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
load_dotenv(os.path.join("AARTv1", "backend", ".env"))

from AARTv1.backend.ingestion.loader import load_js_files
from AARTv1.backend.ingestion.extractor import extract_routes
from AARTv1.backend.symbolic import analyze_route, TaintTracker, _find_tainted_db_calls, _has_valid_ownership_check

# Load test app
files = load_js_files('AARTv1/backend/test_app')
print(f"Files loaded: {list(files.keys())}")

# Extract routes
all_routes = []
for filepath, source in files.items():
    routes = extract_routes(filepath, source)
    print(f"\nRoutes from {filepath}: {len(routes)}")
    for r in routes:
        print(f"  {r.method} {r.path} — handler={r.handler}, has_ast={r.handler_ast is not None}")
        if r.handler_ast:
            print(f"    AST type: {type(r.handler_ast).__name__}")
            # Check if it's a BlockStatement (has body array) or an expression
            if hasattr(r.handler_ast, 'type'):
                print(f"    Node type: {r.handler_ast.type}")
            if hasattr(r.handler_ast, 'body'):
                body = r.handler_ast.body
                if isinstance(body, list):
                    print(f"    Statements: {len(body)}")
                    if len(body) > 0:
                        print(f"    First stmt: {body[0].type if hasattr(body[0], 'type') else 'N/A'}")
                else:
                    print(f"    Body is expression: {getattr(body, 'type', 'N/A')}")
            else:
                print(f"    No body attribute")
    all_routes.extend(routes)

# Analyze the invoices route
print("\n" + "=" * 60)
print("DETAILED ANALYSIS: GET /invoices/:id")
print("=" * 60)

invoices_route = None
for r in all_routes:
    if 'invoices' in r.path:
        invoices_route = r
        break

if invoices_route:
    print(f"\nRoute: {invoices_route.method} {invoices_route.path}")
    print(f"Handler AST: {invoices_route.handler_ast}")
    
    if invoices_route.handler_ast:
        # Run taint tracker
        tracker = TaintTracker()
        tracker.run(invoices_route.handler_ast)
        print(f"\nTaint set after run(): {tracker.tainted}")
        
        # Find tainted DB calls
        tainted_calls = _find_tainted_db_calls(invoices_route.handler_ast, tracker)
        print(f"Tainted DB calls: {tainted_calls}")
        
        # Check ownership
        has_ownership = _has_valid_ownership_check(invoices_route.handler_ast, tracker)
        print(f"Has ownership check: {has_ownership}")
        
        # Run full analysis
        findings = analyze_route(invoices_route)
        print(f"\nSymbolic findings: {len(findings)}")
        for f in findings:
            print(f"  Rule: {f.rule}")
            print(f"  Confidence: {f.confidence}")
            print(f"  Evidence: {f.evidence[:100]}...")
            print()
