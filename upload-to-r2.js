const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const BUCKET_NAME = "business-web-bucket";
const PREFIX = "zohaattire_ecommerce_website_id28"; // 👈 your client folder prefix
const ROOT_DIR = "./out";

function walk(dir = "") {
    const results = [];
    const list = fs.readdirSync(path.join(ROOT_DIR, dir));
    list.forEach((file) => {
        const relPath = path.join(dir, file);
        const fullPath = path.join(ROOT_DIR, relPath);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results.push(...walk(relPath));
        } else {
            results.push(relPath.replace(/\\/g, "/"));
        }
    });
    return results;
}

const files = walk();

files.forEach((file) => {
    const localFilePath = path.join(ROOT_DIR, file);
    const prefixedKey = `${PREFIX}/${file}`;
    // 👇 Add --remote here
    const cmd = `wrangler r2 object put ${BUCKET_NAME}/${prefixedKey} --file "${localFilePath}" --remote`;
    console.log(`📤 Uploading: ${prefixedKey}`);
    try {
        execSync(cmd, { stdio: "inherit" });
    } catch (err) {
        console.error(`❌ Failed to upload ${file}: ${err.message}`);
    }
});
