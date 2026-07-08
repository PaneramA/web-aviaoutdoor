import { spawn } from "node:child_process";

const args = process.argv.slice(2);

const child =
  process.platform === "win32"
    ? spawn("cmd.exe", ["/c", "node_modules\\.bin\\astro.cmd", ...args], {
        stdio: "inherit",
        env: {
          ...process.env,
          ASTRO_TELEMETRY_DISABLED: "1",
        },
      })
    : spawn("./node_modules/.bin/astro", args, {
        stdio: "inherit",
        env: {
          ...process.env,
          ASTRO_TELEMETRY_DISABLED: "1",
        },
      });

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
