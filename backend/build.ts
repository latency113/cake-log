import Bun from "bun";

const result = await Bun.build({
  entrypoints: ["src/index.ts"],
  minify: true,
  outdir: "./dist",
  target: "bun",
  packages: "external",
});

if (!result.success) {
  console.error("Build failed:", result.logs);
  process.exit(1);
}

console.log("Backend build succeeded!");