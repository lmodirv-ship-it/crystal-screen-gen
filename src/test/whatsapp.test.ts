import { describe, expect, it } from "vitest";
import { waNumber } from "@/lib/whatsapp";

describe("waNumber", () => {
  it("converts Moroccan local numbers to 212", () => expect(waNumber("0668546358")).toBe("212668546358"));
  it("strips 00 and symbols", () => expect(waNumber("00212 668-546-358")).toBe("212668546358"));
});
