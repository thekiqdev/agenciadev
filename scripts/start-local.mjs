/**
 * Inicialização local: sobe Postgres (Docker) e inicia Vite (9090) + API (3005).
 * Requer Docker Desktop em execução.
 */
import { execSync, spawn } from "child_process";
import process from "process";

const isWin = process.platform === "win32";
const npm = isWin ? "npm.cmd" : "npm";
const docker = isWin ? "docker.exe" : "docker";

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: "inherit", shell: isWin, ...opts });
    p.on("error", reject);
    p.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exit ${code}`));
    });
  });
}

function freePort(port) {
  try {
    if (isWin) {
      const output = execSync(`netstat -ano | findstr :${port}`, { encoding: "utf8" });
      const pids = Array.from(
        new Set(
          output
            .split(/\r?\n/)
            .filter((line) => line.includes("LISTENING"))
            .map((line) => line.trim().split(/\s+/).at(-1))
            .filter(Boolean)
        )
      );

      for (const pid of pids) {
        if (Number(pid) !== process.pid) {
          try {
            execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
            console.log(`[start-local] Porta ${port}: processo ${pid} finalizado.`);
          } catch {
            console.warn(`[start-local] Porta ${port}: nao foi possivel finalizar PID ${pid}.`);
          }
        }
      }
      return;
    }

    const output = execSync(`lsof -ti tcp:${port}`, { encoding: "utf8" });
    const pids = Array.from(
      new Set(
        output
          .split(/\r?\n/)
          .map((v) => v.trim())
          .filter(Boolean)
      )
    );
    for (const pid of pids) {
      if (Number(pid) !== process.pid) {
        try {
          execSync(`kill -9 ${pid}`, { stdio: "ignore" });
          console.log(`[start-local] Porta ${port}: processo ${pid} finalizado.`);
        } catch {
          console.warn(`[start-local] Porta ${port}: nao foi possivel finalizar PID ${pid}.`);
        }
      }
    }
  } catch {
    // Sem processos na porta (comportamento esperado)
  }
}

console.log("[start-local] Subindo Postgres (porta host 5435)…");
try {
  await run(docker, ["compose", "up", "-d", "postgres"], { cwd: process.cwd() });
} catch {
  console.error(
    "[start-local] Falha ao iniciar Docker Compose. Verifique o Docker Desktop e tente: docker compose up -d postgres"
  );
  process.exit(1);
}

console.log("[start-local] Verificando portas 3005 e 9090…");
freePort(3005);
freePort(9090);

console.log("[start-local] Iniciando Vite :9090 e API :3005…");
const dev = spawn(npm, ["run", "dev:stack"], { stdio: "inherit", shell: isWin, cwd: process.cwd() });
dev.on("close", (code) => process.exit(code ?? 0));
