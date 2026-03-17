import sys
sys.path.insert(0, ".")

from AARTv1.backend.pipeline import build_pipeline, get_pipeline

print("Building pipeline graph...")
graph = build_pipeline()
print("Graph compiled OK")

# Print the node/edge topology so you can verify it matches the design
print("\nNodes:")
for node in graph.nodes:
    print(f"  {node}")

print("\nVerifying singleton...")
g1 = get_pipeline()
g2 = get_pipeline()
assert g1 is g2, "Singleton broken — two different graph instances"
print("Singleton OK")
