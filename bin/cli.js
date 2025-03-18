#!/usr/bin/env node

const { program } = require("commander");
const fs = require("fs");
const path = require("path");
const packageJson = require("../package.json");
const { parse } = require("@babel/parser");

const main = require(path.join(__dirname, "../dist/index.js")).main;

const defaultOptions = {
  runOn: "next",
  defaultLocale: "ko-KR",
  locales: ["ja_JP"],
  entry: "src",
  outputDir: "public/locales",
  prettier: true,
  config: "./auto-i18n.config.json",
};

program
  .option("-c, --config <configFile>", "Configuration file (JSON)")
  .action((options) => {
    const configPath = path.resolve(options.config || defaultOptions.config);

    if (!fs.existsSync(configPath)) {
      console.error(`Config file not found: ${configPath}`);
      process.exit(1);
    }

    const configFileOptions = JSON.parse(fs.readFileSync(configPath));

    const runtimeOptions = {
      ...defaultOptions,
      ...configFileOptions,
    };

    console.log("🔧 Final Options:", runtimeOptions);
  });

program.parse(process.argv);
