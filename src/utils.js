import { get, startsWith } from "lodash";
import isUrl from "is-url";
import fileUrl from "file-url";
import fs, { promises as fsAsync } from "fs";
import { promisify, isUndefined } from "util";
import readline from "readline";
import filenamifyUrl from "filenamify-url";
import { tmpName, setGracefulCleanup } from "tmp-promise";
import merge from "easy-pdf-merge";

setGracefulCleanup();

const postfix = ".pdf";
const ARG_STDIO = "-";

const mergeAsync = promisify(merge);

export function isStdio(path) {
  return path === ARG_STDIO;
}

export function getUrlPath(path) {
  return isUrl(path) ? path : fileUrl(path);
}

export async function loadTemplate(options, template) {
  let fileUrl = get(options, template, undefined);
  if (!fileUrl) return;
  if (isUrl(fileUrl) && startsWith(fileUrl, "file://"))
    fileUrl = fileUrl.replace("file://", "");
  if (isUndefined(options.displayHeaderFooter))
    options.displayHeaderFooter = true;
  options[template] = await fsAsync.readFile(fileUrl, "utf-8");
}

export function defineStdioInterface(outputPath) {
  if (isUrl(outputPath) && !startsWith(outputPath, "file"))
    throw new TypeError("output path must be local file");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.write = (buffer) => process.stdout.write(buffer, "binary");
  return rl;
}

export async function readFromStdin(rl) {
  let stdin = "";
  for await (const line of rl) {
    stdin += line + "\n";
  }
  return stdin;
}

export async function getTempIndexedFileName(url, index) {
  const prefix = `${filenamifyUrl(url)}-${index}`;
  return await tmpName({ prefix, postfix });
}

export async function mergeMultiplePdfs(pdfs, outputPath, rl) {
  const outBuffer = isStdio(outputPath);
  const destPath = outBuffer ? await tmpName({ postfix }) : outputPath;
  await mergeAsync(pdfs, destPath);
  if (outBuffer) rl.write(await fsAsync.readFile(destPath, "binary"));
}

export default {
  isStdio,
  getUrlPath,
  loadTemplate,
  defineStdioInterface,
  readFromStdin,
  mergeMultiplePdfs,
  getTempIndexedFileName,
};
