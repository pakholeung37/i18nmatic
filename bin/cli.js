#!/usr/bin/env node

const { program } = require("commander");
const fs = require("fs");
const path = require("path");
const packageJson = require("../package.json");
const { parse } = require("@babel/parser");

const main = require(path.join(__dirname, "../dist/index.js")).main;

main();
