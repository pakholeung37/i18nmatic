#!/usr/bin/env node
const { program } = require("commander")
const fs = require("fs")
const path = require("path")

const { main, defaultOptions } = require(
  path.join(__dirname, "../dist/index.js"),
)

function addCommonOptions(command) {
  return command
    .option("-c, --config <configFile>", "Configuration file (JSON)")
    .option("--use-hook", "Use React Hook (useTranslation)")
    .option(
      "--key-language <lang>",
      "The language for generating keys (e.g., zh, en)",
    )
    .option("--output-dir <path>", "Directory for language files")
    .option(
      "--exclude <patterns...>",
      "Patterns to exclude files or directories",
    )
    .option(
      "--ext <extensions...>",
      "File extensions to process (e.g., ts tsx js)",
    )
    .option("--no-prettier", "Disable Prettier formatting")
    .option("--output-file-name <name>", "Output language file name")
    .option("--dry-run", "Run without writing any files")
    .option("--output-json-mode <mode>", "JSON output mode (create or merge)")
    .option("--comment", "Add comments to extracted text in JSON")
    .option("--default-translation <text>", "Default translation for new keys")
    .option("--aggressive", "Transform all strings, not just React components and hooks")
}

program
  .command("init")
  .description("Create a default auto-i18n.config.json file")
  .action(() => {
    const configPath = path.resolve("./auto-i18n.config.json")
    if (fs.existsSync(configPath)) {
      console.error(`Config file already exists: ${configPath}`)
      process.exit(1)
    }
    fs.writeFileSync(configPath, JSON.stringify(defaultOptions, null, 2))
    console.log(`Config file created: ${configPath}`)
  })

const transformCommand = program
  .command("transform [files...]")
  .description("Transform source code and extract text for i18n")

addCommonOptions(transformCommand).action((files, options) => {
  const configPath = path.resolve(options.config || "./auto-i18n.config.json")
  let configFileOptions = {}

  if (fs.existsSync(configPath)) {
    configFileOptions = JSON.parse(fs.readFileSync(configPath))
  }

  const runtimeOptions = {
    ...defaultOptions,
    ...configFileOptions,
    ...options,
  }

  if (files && files.length > 0) {
    runtimeOptions.include = files
  }

  main(runtimeOptions)
})

const extractCommand = program
  .command("extract [files...]")
  .description("Extract text to language files without modifying source code")

addCommonOptions(extractCommand).action((files, options) => {
  const configPath = path.resolve(options.config || "./auto-i18n.config.json")
  let configFileOptions = {}

  if (fs.existsSync(configPath)) {
    configFileOptions = JSON.parse(fs.readFileSync(configPath))
  }

  const runtimeOptions = {
    ...configFileOptions,
    ...options,
    extractOnly: true,
  }

  if (files && files.length > 0) {
    runtimeOptions.include = files
  }

  main(runtimeOptions)
})

program.parse(process.argv)
