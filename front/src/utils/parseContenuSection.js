export function parseContenuSection(content) {
  try {
    return JSON.parse(content || "{}");
  } catch {
    return {};
  }
}
