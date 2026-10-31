import { getSocials } from "../src/lib/socials.ts";

console.log("=== Testing socials in DEV vs PROD ===");

// 1. DEV environment (default in node if NODE_ENV unset or development)
process.env.NODE_ENV = "development";
const devSocials = getSocials();
console.log("DEV socials:", devSocials);
const devVisible = devSocials.filter((s) => s.visible);
if (devVisible.length !== 2) {
  throw new Error("Expected 2 visible socials in dev mode!");
}
if (!devVisible.every((s) => s.placeholder)) {
  throw new Error("Expected both socials to be marked as placeholder!");
}

// 2. PROD environment
process.env.NODE_ENV = "production";
const prodSocials = getSocials();
console.log("PROD socials:", prodSocials);
const prodVisible = prodSocials.filter((s) => s.visible);
if (prodVisible.length !== 0) {
  throw new Error("Expected 0 visible socials in prod mode when URLs are placeholders!");
}

console.log("Socials DEV vs PROD test passed successfully!");
