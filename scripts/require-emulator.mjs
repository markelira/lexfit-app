// Hard stop for mock/preview seed scripts: they must never touch production
// Firestore. Import this FIRST in any script that writes throwaway content —
// it exits unless the process is pointed at the Local Emulator.
// Escape hatch (should never be needed — prod content is authored via /admin):
// pass --i-really-mean-prod explicitly.
if (!process.env.FIRESTORE_EMULATOR_HOST && !process.argv.includes("--i-really-mean-prod")) {
  console.error(
    [
      "✋ Refusing to run: FIRESTORE_EMULATOR_HOST is not set, so this script",
      "   would write MOCK/preview data into PRODUCTION Firestore.",
      "   Use the matching :local npm script (which sets FIRESTORE_EMULATOR_HOST=127.0.0.1:8080),",
      "   or pass --i-really-mean-prod if you truly intend to write to production.",
    ].join("\n"),
  );
  process.exit(1);
}
