export function safeNext(value: unknown) {
  if (
    typeof value === "string" &&
    (/^\/admin(?:\/(opportunities|sources|audit|access|users|content|site-settings))?(\?|$)/.test(
      value,
    ) ||
      /^\/app\/(opportunities|open-jobs)\/[0-9a-f-]{36}(\?|$)/i.test(value))
  )
    return value;
  return typeof value === "string" &&
    /^\/app\/(dashboard|profile|settings|saved|tracker|alerts|social|web|direct|toolkit|resume-builder|resume-optimizer|resume-tailoring|linkedin-optimizer|cover-letter|admin|onboarding|my-applications|open-jobs|messages|contracts|deliveries|earnings|post-job|jobs|applications|payments)(\?|$)/.test(
      value,
    )
    ? value
    : "/app/dashboard";
}
