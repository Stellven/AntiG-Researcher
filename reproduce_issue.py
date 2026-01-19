from ddgs import DDGS
import datetime

print(f"Testing DDGS search...")
try:
    with DDGS() as ddgs:
        results = [r for r in ddgs.text("python programming", max_results=5)]
        print(f"Successfully got {len(results)} results")
        for r in results:
            print(f"- {r.get('title')}")
except Exception as e:
    print(f"Caught error: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
