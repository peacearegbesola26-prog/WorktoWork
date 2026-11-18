import { imageSize } from "image-size";
import { imageFormat } from "./schema";
export function validateBrandImage(bytes: Uint8Array, purpose: "logo" | "favicon") {
  const format = imageFormat(bytes);
  if (!format) throw new Error("Use PNG, JPEG or WebP up to 2 MB. SVG is not accepted.");
  const size = imageSize(bytes);
  if (size.width < 16 || size.height < 16 || size.width > 4096 || size.height > 4096)
    throw new Error("Use an image between 16 and 4096 pixels on each side.");
  if (purpose === "favicon" && size.width !== size.height)
    throw new Error("Use a square favicon image.");
  return format;
}
