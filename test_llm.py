import sys
import os
sys.path.insert(0, ".")

# Load API key from environment if available
api_key = os.environ.get("GROQ_API_KEY", "your-key-here")
if api_key != "your-key-here":
    os.environ["GROQ_API_KEY"] = api_key

from AARTv1.backend.llm.reasoner import get_llm_hint, get_llm_assessment, build_code_snippet, _extract_json

# Test 1: bare snippet call
print("--- Test: get_llm_hint (vulnerable code) ---")
vulnerable_snippet = """
app.get('/invoices/:id', authenticate, async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  res.json(invoice);
});
"""
try:
    result = get_llm_hint(vulnerable_snippet)
    print(f"  confidence:            {result['confidence']}")
    print(f"  ownership_check_found: {result['ownership_check_found']}")
    print(f"  hint:                  {result['hint']}")
    assert result['confidence'] > 0.7,           f"Expected high confidence, got {result['confidence']}"
    assert result['ownership_check_found'] == False, "Should NOT find ownership check"
    print("  PASS — vulnerable code correctly scored high")
except RuntimeError as e:
    print(f"  SKIP — {e}")
    print("  (Set GROQ_API_KEY to run LLM tests)")

# Test 2: safe code should be suppressed
print("\n--- Test: get_llm_hint (safe code with ownership check) ---")
safe_snippet = """
app.get('/invoices/:id', authenticate, async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (invoice.userId.toString() !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  res.json(invoice);
});
"""
try:
    result2 = get_llm_hint(safe_snippet)
    print(f"  confidence:            {result2['confidence']}")
    print(f"  ownership_check_found: {result2['ownership_check_found']}")
    assert result2['confidence'] < 0.4,          f"Expected low confidence, got {result2['confidence']}"
    assert result2['ownership_check_found'] == True, "Should find ownership check"
    print("  PASS — safe code correctly scored low")
except RuntimeError as e:
    print(f"  SKIP — {e}")
    print("  (Set GROQ_API_KEY to run LLM tests)")

# Test 3: JSON extraction robustness (model wrapping in backticks)
print("\n--- Test: JSON extraction with markdown fences ---")
raw = '```json\n{"confidence": 0.85, "hint": "test", "ownership_check_found": false, "reasoning": "test"}\n```'
parsed = _extract_json(raw)
assert parsed['confidence'] == 0.85
print("  PASS — markdown fence stripping works")

print("\nAll LLM tests passed")
