import { describe, it, expect } from "vitest";
import { validateBrandImage } from "./images.server";
function png(w: number, h: number) {
  const a = new Uint8Array(32);
  a.set([137, 80, 78, 71, 13, 10, 26, 10]);
  a.set([73, 72, 68, 82], 12);
  const d = new DataView(a.buffer);
  d.setUint32(16, w);
  d.setUint32(20, h);
  return a;
}
describe("server brand image validation", () => {
  it("limits dimensions and requires square favicons", () => {
    expect(validateBrandImage(png(64, 64), "favicon")).toBe("png");
    expect(() => validateBrandImage(png(4097, 64), "logo")).toThrow("4096");
    expect(() => validateBrandImage(png(64, 32), "favicon")).toThrow("square");
    expect(() => validateBrandImage(png(8, 8), "logo")).toThrow("16");
  });
});
