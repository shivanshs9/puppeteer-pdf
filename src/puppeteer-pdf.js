import { each, isNil, startsWith, set, get } from "lodash";
import { program } from "commander";
import utils from "./utils";
import puppeteer from "puppeteer";

const VERSION = process.env.npm_package_version || "1.0.0";

var stdin, urls, rl;

async function parseArgumentsIntoOptions(rawArgs) {
  await program
    .version(VERSION)
    .option("-p, --path <path>", "The file path to save the PDF to.", "-")
    .option(
      "-s, --scale [scale]",
      "Scale of the webpage rendering.",
      parseFloat,
      1
    )
    .option(
      "-dhf, --displayHeaderFooter",
      "Display header and footer.",
      undefined
    )
    .option(
      "-ht, --headerTemplate [template]",
      "HTML template for the print header."
    )
    .option(
      "-ft, --footerTemplate [template]",
      "HTML template for the print footer."
    )
    .option("-pb, --printBackground", "Print background graphics.", false)
    .option("-l, --landscape", "Paper orientation.", false)
    .option(
      "-pr, --pageRanges <range>",
      "Paper ranges to print, e.g., '1-5, 8, 11-13'. Defaults to the empty string, which means print all pages."
    )
    .option(
      "-f, --format [format]",
      "Paper format. If set, takes priority over width or height options.",
      "Letter"
    )
    .option(
      "-wt, --width [width]",
      "Paper width, accepts values labeled with units."
    )
    .option(
      "-ht, --height [height]",
      "Paper height, accepts values labeled with units."
    )
    .option(
      "-mt, --marginTop [margin]",
      "Top margin, accepts values labeled with units."
    )
    .option(
      "-mr, --marginRight [margin]",
      "Right margin, accepts values labeled with units."
    )
    .option(
      "-mb, --marginBottom [margin]",
      "Bottom margin, accepts values labeled with units."
    )
    .option(
      "-ml, --marginLeft [margin]",
      "Left margin, accepts values labeled with units."
    )
    .option("-v, --verbose", "Output Puppeteer PDF options", false)
    .option(
      "-wu, --waitUntil [choice]",
      "waitUntil accepts choices load, domcontentloaded, networkidle0, networkidle2.",
      "networkidle2"
    )
    .arguments("<pages...>")
    .action(async (pages) => {
      urls = pages;
      rl = utils.defineStdioInterface(program.path);
      if (!!urls.find(utils.isStdio)) {
        stdin = await utils.readFromStdin(rl);
      }
      rl.close();
    })
    .parseAsync(rawArgs);

  let options = {};

  // Loop through options
  each(program.options, async (option) => {
    const optionName = option.name();
    if (!isNil(program[optionName]) && !["version"].includes(optionName)) {
      const optionValue = program[optionName];

      if (startsWith(optionName, "margin")) {
        // Margins need to be combined into an object
        set(
          options,
          ["margin", optionName.replace("margin", "").toLowerCase()],
          optionValue
        );
      } else {
        set(options, optionName, optionValue);
      }
    }
  });

  // Check if we need to read header or footer templates from files
  await utils.loadTemplate(options, "headerTemplate");
  await utils.loadTemplate(options, "footerTemplate");

  return options;
}

export async function cli(args) {
  const { path, verbose, ...options } = await parseArgumentsIntoOptions(args);

  const shouldLog = verbose && !utils.isStdio(path);

  const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  const navOption = {
    waitUntil: get(options, "waitUntil", "networkidle2"),
  };

  // Output options if in verbose mode
  if (shouldLog) console.log(options);

  let tempPdfs = [];
  const shouldMerge = urls.length > 1;

  await Promise.all(
    urls.map(async (url, i) => {
      const page = await browser.newPage();
      if (utils.isStdio(url) && stdin) await page.setContent(stdin, navOption);
      else await page.goto(utils.getUrlPath(url), navOption);
      const filePath = shouldMerge
        ? await utils.getTempIndexedFileName(url, i)
        : path;
      if (shouldLog) console.log(`Saving PDF of '${url}' to '${filePath}'`);
      if (!shouldMerge && utils.isStdio(filePath)) {
        if (shouldLog) {
          console.log("Writing to stdout");
        }
        rl.write(await page.pdf(options));
      } else await page.pdf({ path: filePath, ...options });
      tempPdfs.push(filePath);
    })
  );

  await browser.close();

  if (tempPdfs.length > 1) {
    if (shouldLog) console.log(`Merging ${tempPdfs.length} PDFs...`);
    await utils.mergeMultiplePdfs(tempPdfs, path, rl);
    if (shouldLog) console.log("Merge success!");
  }

  if (!utils.isStdio(path)) console.log(`Printed PDF to ${path}`);
}
