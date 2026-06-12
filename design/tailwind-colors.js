// Build a nested Tailwind colors object from design/tokens.json
// Example: "Surfaces/gray-50" -> colors.Surfaces["gray-50"]
const tokens = require("./tokens.json");

function toKebab(s) {
  return String(s)
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-{2,}/g, "-");
}

function setNested(obj, pathArr, value) {
  let curr = obj;
  for (let i = 0; i < pathArr.length - 1; i++) {
    const key = toKebab(pathArr[i]);
    curr[key] = curr[key] || {};
    curr = curr[key];
  }
  curr[toKebab(pathArr[pathArr.length - 1])] = value;
}

const colors = {};
if (tokens && tokens.colors) {
  for (const [name, hex] of Object.entries(tokens.colors)) {
    const parts = name.split("/");
    if (!parts.length) continue;
    setNested(colors, parts, hex);
  }
}

module.exports = colors;

