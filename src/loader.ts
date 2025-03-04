import * as fs from "fs";
import * as path from "path";
import * as parser from "@babel/parser";
import * as t from "@babel/types";

const fileName = "./src/source/components.tsx";

export function load(): t.File {
  console.log("Current working directory: ", process.cwd());
  const code = fs.readFileSync(
    path.resolve(process.cwd(), "src/source/component.tsx"),
    "utf8"
  );

  console.log("import code:", code);

  const ast = parser.parse(code, {
    sourceType: "module",
    plugins: ["typescript", "jsx"],
  });

  console.log("parsed code:", ast);

  return ast;
}
