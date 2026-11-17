import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

/**
 * Stage GitHub sources over a fresh clasp pull, preserving the remote manifest,
 * other files and original localized name, e.g. "Código.gs".
 */
async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const result = [];
  for (const item of entries) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) result.push(...await walk(full));
    else if (item.isFile()) result.push(full);
  }
  return result;
}

export async function stageBetterMe(targetDir, sourcesDir) {
  const paths = await walk(targetDir);
  const manifest = path.join(targetDir, "appsscript.json");
  const projectFile = path.join(targetDir, ".clasp.json");
  if (!paths.includes(manifest) || !paths.includes(projectFile)) {
    throw Error("A cópia do Apps Script não contém appsscript.json ou .clasp.json. Publicação interrompida.");
  }
  JSON.parse(await fs.readFile(manifest, "utf8"));
  const config = JSON.parse(await fs.readFile(projectFile, "utf8"));
  if (!config.scriptId) throw Error("Script ID ausente no arquivo .clasp.json");

  const candidates = paths.filter(p => /\.(gs|js)$/i.test(p));
  const matching = [];
  for (const candidate of candidates) {
    const code = await fs.readFile(candidate, "utf8");
    if (code.includes("BETTERME_SHEET_ID") && code.includes("function doGet(")) matching.push(candidate);
  }
  if (matching.length !== 1) {
    throw Error("Esperado exatamente um arquivo BetterMe no Apps Script, encontrados " + matching.length + ". Nenhum arquivo foi alterado.");
  }
  const indexFiles = paths.filter(p => path.basename(p).toLowerCase() === "index.html");
  if (indexFiles.length !== 1) {
    throw Error("Esperado um único Index.html no projeto remoto. Nenhum arquivo foi alterado.");
  }
  const sourceCode = await fs.readFile(path.join(sourcesDir, "Code.gs"), "utf8");
  const sourceHtml = await fs.readFile(path.join(sourcesDir, "Index.html"), "utf8");
  if (!sourceCode.includes("BETTERME_SHEET_ID") || !sourceCode.includes("function doGet(") ||
      !sourceHtml.includes("google.script.run") || !sourceHtml.includes("<html")) {
    throw Error("Os arquivos do GitHub não parecem ser o BetterMe esperado.");
  }
  await fs.writeFile(matching[0], sourceCode, "utf8");
  await fs.writeFile(indexFiles[0], sourceHtml, "utf8");
  return {
    scriptId: config.scriptId,
    backendFile: path.relative(targetDir, matching[0]),
    htmlFile: path.relative(targetDir, indexFiles[0]),
    preservedFiles: paths.length - 2
  };
}

const invoked = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invoked) {
  if (process.argv.length !== 4) {
    throw Error("Uso: node stage-betterme-apps-script.mjs <diretorio-clasp> <diretorio-fonte>");
  }
  const report = await stageBetterMe(process.argv[2], process.argv[3]);
  console.log("Fontes preparadas:", JSON.stringify(report));
}
