import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import { stageBetterMe } from "./stage-betterme-apps-script.mjs";

const tmp = await mkdtemp(path.join(os.tmpdir(), "betterme-stage-test-"));
const remote = path.join(tmp, "remote");
const sources = path.join(tmp, "sources");
await mkdir(remote);
await mkdir(sources);
try {
  const remoteCode = 'const BETTERME_SHEET_ID = "old"; function doGet() { return "old"; }';
  const remoteHtml = "<html><body>older version</body></html>";
  await writeFile(path.join(remote, ".clasp.json"), JSON.stringify({scriptId:"private-script-id"}));
  await writeFile(path.join(remote, "appsscript.json"), JSON.stringify({timeZone:"America/Sao_Paulo",runtimeVersion:"V8"}));
  await writeFile(path.join(remote, "Código.gs"), remoteCode);
  await writeFile(path.join(remote, "Index.html"), remoteHtml);
  await writeFile(path.join(remote, "OtherUtility.gs"), "function keepMe() { return 42; }");
  await writeFile(path.join(sources, "Code.gs"), 'const BETTERME_SHEET_ID = "updated"; function doGet() { return "updated"; }');
  await writeFile(path.join(sources, "Index.html"), '<html><script>google.script.run.getSnapshot()</script></html>');
  const result = await stageBetterMe(remote, sources);
  assert.equal(result.backendFile, "Código.gs");
  assert.equal(result.htmlFile, "Index.html");
  assert.match(await readFile(path.join(remote, "Código.gs"), "utf8"), /updated/);
  assert.match(await readFile(path.join(remote, "Index.html"), "utf8"), /getSnapshot/);
  assert.equal(await readFile(path.join(remote, "OtherUtility.gs"), "utf8"), "function keepMe() { return 42; }");
  assert.deepEqual(JSON.parse(await readFile(path.join(remote, "appsscript.json"), "utf8")), {
    timeZone:"America/Sao_Paulo",runtimeVersion:"V8"
  });
  await writeFile(path.join(remote, "Second.gs"), remoteCode);
  await assert.rejects(stageBetterMe(remote, sources), /exatamente um arquivo/);
  console.log("OK: preserva manifesto e arquivos extras, mantém nomes reais e bloqueia código ambíguo.");
} finally {
  await rm(tmp, {recursive:true,force:true});
}
