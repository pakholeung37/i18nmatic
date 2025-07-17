#!/usr/bin/env node
const { program } = require("commander")
const fs = require("fs")
const path = require("path")

const main = require(path.join(__dirname, "../dist/index.js")).main

program
  .option("-c, --config <configFile>", "Configuration file (JSON)")
  .action((options) => {
    const configPath = path.resolve(options.config || "./auto-i18n.config.json")

    if (!fs.existsSync(configPath)) {
      console.error(`Config file not found: ${configPath}`)
      process.exit(1)
    }

    const configFileOptions = JSON.parse(fs.readFileSync(configPath))

    const runtimeOptions = {
      ...configFileOptions,
    }

    main(runtimeOptions)
  })

program.parse(process.argv)
