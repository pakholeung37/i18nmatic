import * as fs from "fs/promises";
import * as parser from "@babel/parser";
import * as t from "@babel/types";
import { globSync } from "fs";

// ##

// 1. 사용자는 자신의 코드를 진입점을 설정하여 코드를 넣을 수 있다.
// 2. 사용자는 yml된 설정 파일을 작성하여 값을 전달할 수 있다.
// 3. 설치 후 CLI를 사용하여 해당 라이브러리를 동작시킬 수 있다
// 4. ignore-path로 무시할 부분을 선택할 수 있다.
// 5. 래핑할 언어를 선택할 수 있다
//     1. 추후 코어에 주입한다(반환값으로 주고 index에서 주입)

interface File {
  ast: t.File;
  filepath: string;
}

export class Loader {
  private entry: string;
  private locales: string[];
  private outputDir: string;

  constructor() {
    this.entry = "./src/source";
    this.locales = ["JP"];
    this.outputDir = "./src/source";
  }

  load(
    callback: (file: File) => void,
    { onLoaded }: { onLoaded?: () => void }
  ) {
    const filePaths = this.getTargetFilePaths();

    const promises: Promise<void>[] = [];
    filePaths.forEach((filePath) => {
      promises.push(
        this.loadSourceFile(filePath).then((file) => {
          // 파일에 전달받은 콜백 수행
          callback({ ast: file, filepath: filePath });
        })
      );
    });

    Promise.all(promises).then(() => {
      onLoaded?.();
    });
  }

  private getTargetFilePaths(): string[] {
    return globSync(`${this.entry}/**/*.{js,jsx,ts,tsx}`);
  }

  private async loadSourceFile(filePath: string): Promise<t.File> {
    const code = await fs.readFile(filePath, "utf8");

    return parser.parse(code, {
      sourceType: "module",
      plugins: ["typescript", "jsx"],
    });
  }

  get options() {
    return {
      entry: this.entry,
      locales: this.locales,
      outputDir: this.outputDir,
    };
  }
}
