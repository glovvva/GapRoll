#!/usr/bin/env node
/**
 * Validates dashboard/UI components for GapRoll design system compliance.
 * Checks: Polish PLN formatting, JetBrains Mono usage, design token references.
 *
 * Usage: node validate_dashboard.js [path]
 * Example: node validate_dashboard.js apps/web/app/dashboard/root-cause/page.tsx
 */

const fs = require("fs");
const path = require("path");

const targetPath = process.argv[2] || process.cwd();
const errors = [];
const warnings = [];

function checkFile(filePath) {
  if (!fs.existsSync(filePath)) {
    errors.push("File not found: " + filePath);
    return;
  }
  const content = fs.readFileSync(filePath, "utf8");

  if (content.includes("PLN") && !content.includes("toLocaleString") && /\d{4,}\s*PLN/.test(content)) {
    warnings.push(filePath + ": Consider using toLocaleString('pl-PL') for PLN (thousands separator).");
  }

  const hasNumericDisplay = /\$\{|toFixed|toLocaleString/.test(content);
  const hasFontMono = /font-mono|className=.*font-mono/.test(content);
  if (hasNumericDisplay && !hasFontMono && (content.includes("Card") || content.includes("BarChart"))) {
    warnings.push(filePath + ": Numeric values should use font-mono (JetBrains Mono) per design system.");
  }

  const hardcodedHex = /#[0-9a-fA-F]{6}/g;
  const matches = content.match(hardcodedHex) || [];
  const allowed = ["#14b8a6", "#0f172a", "#1e293b", "#334155", "#f1f5f9", "#cbd5e1", "#94a3b8", "#22c55e", "#ef4444", "#f59e0b", "#3b82f6"];
  matches.forEach(function (hex) {
    if (allowed.indexOf(hex.toLowerCase()) === -1) {
      warnings.push(filePath + ": Hardcoded color " + hex + ". Prefer design-tokens or Tailwind.");
    }
  });

  if (content.indexOf("BarChart") !== -1 && content.indexOf("ResponsiveContainer") === -1) {
    warnings.push(filePath + ": Recharts BarChart should be wrapped in ResponsiveContainer.");
  }
}

if (!fs.existsSync(targetPath)) {
  console.error("Path not found: " + targetPath);
  process.exit(1);
}

const stat = fs.statSync(targetPath);
if (stat.isDirectory()) {
  const files = fs.readdirSync(targetPath, { withFileTypes: true });
  files.forEach(function (f) {
    if (f.isFile() && (f.name.endsWith(".tsx") || f.name.endsWith(".jsx"))) {
      checkFile(path.join(targetPath, f.name));
    }
  });
} else {
  checkFile(targetPath);
}

if (errors.length > 0) {
  console.error("Validation errors:");
  errors.forEach(function (e) { console.error("  " + e); });
  process.exit(1);
}

if (warnings.length > 0) {
  console.warn("Warnings:");
  warnings.forEach(function (w) { console.warn("  " + w); });
}

console.log("Dashboard validation finished. Errors:", errors.length, "Warnings:", warnings.length);
process.exit(0);
