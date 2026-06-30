// Loads the prototype's browser-global data files (seed/source/*.jsx) without
// modifying them. They end with `Object.assign(window, { … })` and have no
// exports, so we execute each file in a vm sandbox with a fake `window` and
// return that object. The files are plain JS despite the .jsx extension.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import vm from "node:vm";

const here = dirname(fileURLToPath(import.meta.url));

/** Execute one source file and return the globals it assigns to `window`. */
export function loadPrototype(fileName) {
  const code = readFileSync(join(here, "source", fileName), "utf8");
  const sandbox = { window: {}, console };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: fileName });
  return sandbox.window;
}
