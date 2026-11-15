export function safeNext(value: unknown) {
  return typeof value === "string" &&
    /^\/(dashboard|profile|settings|saved|tracker|alerts|opportunities)(\?|$)/.test(value)
    ? value
    : "/dashboard";
}
