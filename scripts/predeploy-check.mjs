import { spawnSync } from "node:child_process";

const commands = [
  ["run", "check"],
  ["run", "build"],
];

for (const args of commands) {
  const result = spawnSync("npm", args, { stdio: "inherit", shell: true });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const checklist = [
  "Verify language toggle (SR/EN) updates static and dynamic labels.",
  "Verify RSD mode shows exchange-rate note and valid table values.",
  "Verify chart column renders 7d trend lines.",
  "Verify rate-limit fallback/error state still displays clearly.",
  "Verify live page renders after push.",
];

console.log("\nPre-deploy manual checklist:");
for (const item of checklist) {
  console.log(`- [ ] ${item}`);
}
