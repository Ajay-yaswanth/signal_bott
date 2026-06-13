import { describe, expect, it } from "vitest";

import {
  classifyAiConfidence,
  NORMAL_CONFIDENCE_MINIMUM,
  SNIPER_CONFIDENCE_MINIMUM,
} from "@/lib/strategy/ai-scoring";

describe("AI confidence classification", () => {
  it("rejects scores below 75", () => {
    expect(classifyAiConfidence(NORMAL_CONFIDENCE_MINIMUM - 1)).toBe("REJECT");
  });

  it("creates normal signals from 75 through 89", () => {
    expect(classifyAiConfidence(NORMAL_CONFIDENCE_MINIMUM)).toBe("NORMAL");
    expect(classifyAiConfidence(SNIPER_CONFIDENCE_MINIMUM - 1)).toBe("NORMAL");
  });

  it("creates sniper signals at 90 and above", () => {
    expect(classifyAiConfidence(SNIPER_CONFIDENCE_MINIMUM)).toBe("SNIPER");
    expect(classifyAiConfidence(100)).toBe("SNIPER");
  });
});
