import sys
sys.path.insert(0, ".")

from AARTv1.backend.pipeline.state import PipelineState

s = PipelineState(repo_path="/tmp/test", scan_id="abc")

assert s.repo_path == "/tmp/test"
assert s.confidence_t1 == 0.50
assert s.confidence_t2 == 0.75
assert s.sym_findings == []
assert s.aborted == False

# Verify mutable defaults don't share state between instances
s1 = PipelineState(repo_path="a")
s2 = PipelineState(repo_path="b")
s1.sym_findings.append("x")
assert s2.sym_findings == [], "Mutable default shared between instances — broken"

print("PipelineState OK")
