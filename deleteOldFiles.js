const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const bucket = "business-web-bucket";
const distPath = path.join(__dirname, "out"); // your built site folder

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach((f) => {
        const dirPath = path.join(dir, f);
        const isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir(distPath, (filePath) => {
    const relativeKey = path.relative(distPath, filePath).replace(/\\/g, "/");
    console.log(`Deleting: ${relativeKey}`);
    try {
        execSync(`wrangler r2 object delete ${bucket}/${relativeKey} --remote`, { stdio: "inherit" });
    } catch (err) {
        console.error(`Failed to delete: ${relativeKey}`);
    }
});
