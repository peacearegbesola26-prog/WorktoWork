export function safeNext(value: unknown) {
  return typeof value === "string" &&
    /^\/app\/(dashboard|profile|settings|saved|tracker|alerts|social|web|toolkit|resume-builder|resume-optimizer|resume-tailoring|linkedin-optimizer|cover-letter|admin)(\?|$)/.test(
      value,
    )
    ? value
    : "/app/dashboard";
}
