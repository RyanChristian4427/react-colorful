const fs = require("fs");
const path = require("path");
const del = require("del");
const util = require("util");

// Convert NodeJS methods to promises in order to use them with `await` statement
const exec = util.promisify(require("child_process").exec);
const writeFile = util.promisify(fs.writeFile);

// Read available package sources from the dir
const entryDirPath = path.join(__dirname, "src/packages");

fs.readdir(entryDirPath, async (e, files) => {
  console.log(`⚙️ Building ${files.length} packages...`);

  for (let file of files) {
    const { name } = path.parse(file);
    const filePath = path.join(entryDirPath, file);
    const outputDirPath = path.join(__dirname, name);
    const manifestPath = path.join(outputDirPath, `package.json`);
    const bundlerPath = path.join(__dirname, "node_modules/.bin/microbundle");

    // Delete the previous package version if exists
    await del(outputDirPath);

    // Run microbundle
    await exec(
      `${bundlerPath} --entry ${filePath} --output ${outputDirPath}/index.js --name ${name}`
    );
    console.log(`🥁 ${name}: bundle is built`);

    // Create `package.json`
    var manifestCode = JSON.stringify({
      name,
      private: true,
      main: "index.js",
      module: "index.module.js",
      esmodule: "index.esmodule.js",
    });

    await writeFile(manifestPath, manifestCode, "utf8");
    console.log(`🥁 ${name}: package.json was created`);
  }

  console.log(`🎺 All packages are built`);
});