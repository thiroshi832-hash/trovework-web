/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "src",
  testRegex: ".*\.spec\.ts$",
  transform: { "^.+\.(t|j)s$": "ts-jest" },
  testEnvironment: "node",
  // Single worker on purpose: with parallel workers Jest leaves a handle open
  // and force-exits, which can truncate output on a failing run. This suite
  // gates deploys, so determinism beats the ~2s.
  maxWorkers: 1,
};
