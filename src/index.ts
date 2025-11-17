#!/usr/bin/env node

import { runCli } from "./cli/index.js";
import { handleCliError } from "./core/utils/error.js";

(async () => {
  try {
    await runCli(process.argv);
  } catch (error) {
    handleCliError(error);
    process.exit(1);
  }
})();
