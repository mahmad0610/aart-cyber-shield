
import sys
import os

# Add current directory to path
sys.path.insert(0, os.getcwd())

from AARTv1.backend.ingestion.extractor import extract_routes
from AARTv1.backend.graph import build_graph

if __name__ == "__main__":
    test_path = os.path.join(os.getcwd(), "AARTv1", "backend", "test_app", "mongo_test.js")
    with open(test_path, 'r') as f:
        source = f.read()
    
    routes = extract_routes("mongo_test.js", source)
    graph = build_graph(routes)
    
    print(f"Graph Summary:")
    print(f"  Nodes: {len(graph.nodes)}")
    print(f"  Edges: {len(graph.edges)}")
    
    for nid, node in graph.nodes.items():
        if node.node_type == 'model':
            print(f"\n  MODEL NODE: {node.label}")
            print(f"    Methods: {node.metadata.get('methods')}")
            
    for edge in graph.edges:
        if edge.edge_type == 'accesses':
            print(f"  EDGE: {edge.from_id} ---ACCESSES---> {edge.to_id}")
