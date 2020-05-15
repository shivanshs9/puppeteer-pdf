# Puppeteer PDF CLI

HTML to PDF from the command line with Puppeteer.

[![npm downloads](https://img.shields.io/npm/dt/@shivanshs9/puppeteer-pdf.svg)](https://npmjs.org/package/@shivanshs9/puppeteer-pdf)
[![npm license](https://img.shields.io/npm/l/@shivanshs9/puppeteer-pdf.svg)](https://npmjs.org/package/@shivanshs9/puppeteer-pdf)
[![npm version](https://img.shields.io/npm/v/@shivanshs9/puppeteer-pdf.svg)](https://npmjs.org/package/@shivanshs9/puppeteer-pdf)

## Help

```
puppeteer-pdf --help
Usage: puppeteer-pdf [options] <pages...>

Options:
  -V, --version                     output the version number
  -p, --path <path>                 The file path to save the PDF to. (default: "-")
  -s, --scale [scale]               Scale of the webpage rendering. (default: 1)
  -dhf, --displayHeaderFooter       Display header and footer.
  -ht, --headerTemplate [template]  HTML template for the print header.
  -ft, --footerTemplate [template]  HTML template for the print footer.
  -pb, --printBackground            Print background graphics. (default: false)
  -l, --landscape                   Paper orientation. (default: false)
  -pr, --pageRanges <range>         Paper ranges to print, e.g., '1-5, 8, 11-13'. Defaults to the empty string, which means print all pages.
  -f, --format [format]             Paper format. If set, takes priority over width or height options. (default: "Letter")
  -wt, --width [width]              Paper width, accepts values labeled with units.
  -ht, --height [height]            Paper height, accepts values labeled with units.
  -mt, --marginTop [margin]         Top margin, accepts values labeled with units.
  -mr, --marginRight [margin]       Right margin, accepts values labeled with units.
  -mb, --marginBottom [margin]      Bottom margin, accepts values labeled with units.
  -ml, --marginLeft [margin]        Left margin, accepts values labeled with units.
  -v, --verbose                     Output Puppeteer PDF options (default: false)
  -wu, --waitUntil [choice]         waitUntil accepts choices load, domcontentloaded, networkidle0, networkidle2. (default: "networkidle2")
  -h, --help                        display help for command
```

## Examples

```shell
puppeteer-pdf tests/test.html \
  --path demo.pdf \
  --landscape \
  --verbose \
  --waitUntil networkidle0
```

```shell
puppeteer-pdf tests/test.html \
  --path demo-file-header.pdf \
  --landscape \
  --headerTemplate=./tests/header.html \
  --verbose \
  --marginTop 200px \
  --scale 2
```

```shell
puppeteer-pdf tests/test.html \
  --path demo-inline-header.pdf \
  --landscape \
  --headerTemplate='<table style="width: 100%; margin-left: 5px; margin-right: 5px; margin-bottom: 0px;"> <tr> <td class="section" style="text-align:left"> <div style="font-size: 10px;"> <p>Report Name</p> <p>Some Text</p></div> </td> <td style="text-align:right"> <div style="font-size: 10px;"> <p>Start - End</p> </div> </td> </tr> </table>' \
  --verbose \
  --marginTop 200px
```

## License

MIT
