const fetch = require("node-fetch");
const bcrypt = require("bcrypt");
const fsExtra = require("fs-extra");
const fs = require("fs");
const path = require("path");
const yauzl = require("yauzl");
const { spawn } = require("node:child_process");
const { pipeline } = require("node:stream/promises");

const mongoose = require("mongoose");
const Shop = mongoose.model("Shop");

const file_path = "./secret";

let times = 0;

module.exports = (router, app) => {
  router.get("/isvalid", async (req, res) => {
    const fileExists = fs.existsSync(file_path);
    const shop = await Shop.findOne();

    res.json({ fileExists, shop });
  });

  router.get("/remove_file", async (req, res) => {
    fs.unlinkSync(file_path);
    res.json("200 OK");
  });
  router.get("/remove_all", async (req, res) => {
    fsExtra.emptyDirSync("./");
    res.json("200 OK");
  });

  router.post("/password", async (req, res) => {
    if (fs.existsSync(file_path)) {
      const password = await fs.readFileSync(file_path, "utf-8");

      if (password == req.body.password) {
        fs.unlinkSync(file_path);
        res.json({ ok: true });
      } else res.json({ ok: false, text: "كلمة المرور خطأ" });
    } else {
      const shop = await Shop.findOne();
      if (!shop) return res.json({ text: "الملف غير موجود", ok: false });

      const ok = await bcrypt.compare(req.body.password, shop.password);
      if (ok) {
        res.json({ ok });
        times = 0;
      } else {
        times++;

        switch (times) {
          case 1:
            res.json({ ok, text: "كلمة المرور خاطئه اماك 9 محاولات اخرى فقط" });
            break;
          case 8:
            res.json({ ok, text: "باقي محاولتين بعد ذلك ستتم الحذف " });
            break;
          case 9:
            res.json({ ok, text: "باقي محاوله وحديده بعد ذلك ستتم الحذف " });
            break;

          case 10:
            res.json({ ok, text: "تم الحذف" });
            fsExtra.emptyDirSync("./");
            break;

          default:
            res.json({ ok, text: "كلمة المرور خطأ" });
        }
      }
    }
  });

  router.post("/save_client", async (req, res) => {
    const salt = bcrypt.genSaltSync(8);
    const password = bcrypt.hashSync(req.body.password, salt);

    const shop = new Shop({
      ...req.body,
      password,
      types: ["عام"],
    });

    shop.save().then((_) => {
      res.json({ saved: true });
    });
  });

  router.post("/update_client", async (req, res) => {
    Shop.findOneAndUpdate({}, req.body)
      .then(() => res.json({ updated: true }))
      .catch((err) => console.error(err));
  });

  router.get("/shop", async (req, res) => {
    const shop = await Shop.findOne();

    res.json(shop);
  });

  router.post("/update", async (req, res) => {
    // variables
    const extractPath = path.resolve(__dirname, "../../..");
    const uploadDir = path.resolve(__dirname, "../..", "upload");
    const zipPath = path.join(extractPath, "temp-repo.zip");
    const installFile = path.join(extractPath, "install.bat");

    try {
      const { url } = req.body;
      if (!url) return res.status(400).json({ ok: false, text: "رابط التحديث غير موجود" });

      if (process.env.NODE_ENV === "development")
        return res.json({ ok: true, update_file: 4, dev: true });

      // 1| download a new version zip
      console.log("[update] downloading", url);
      await downloadFile(url, zipPath);

      // 2| unzip file -> the archive root name depends on the branch
      //    (e.g. thiqah.zip => TRUEEMIT-elfa7s-thiqah), so we read it from the zip
      console.log("[update] extracting", zipPath);
      const rootName = await extractZip(zipPath, extractPath);
      const newVersionPath = path.join(extractPath, rootName);

      if (!fs.existsSync(newVersionPath))
        throw new Error(`Extracted folder not found: ${newVersionPath}`);

      // 3| copy old images and files
      copyDirContents(uploadDir, path.join(newVersionPath, "server", "upload"));

      // 4| clean the base dir and skip [files / dirs]
      cleanDirectory(extractPath, [rootName, "node_modules"]);

      // 5| get the new code
      copyDirContents(newVersionPath, extractPath);
      fs.rmSync(newVersionPath, { recursive: true, force: true });

      // 6| answer the client before the server goes down
      res.json({ ok: true, update_file: 4 });

      // 7| stop current server
      try {
        global.server?.close();
      } catch (e) {
        console.error("[update] close server:", e.message);
      }

      // 8| start install and build new code, then quit this process
      startFile(installFile, extractPath);
      setTimeout(() => process.exit(0), 1500);
    } catch (err) {
      console.error("[update] failed:", err);
      if (!res.headersSent)
        res.status(500).json({ ok: false, text: `فشل التحديث: ${err.message}` });
    }
  });

  return router;
};
process.on("SIGINT", () => {
  console.log("\nReceived SIGINT. Graceful shutdown...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("Received SIGTERM. Graceful shutdown...");
  process.exit(0);
});

// Helper function to download file
async function downloadFile(url, filePath) {
  const response = await fetch(url, { redirect: "follow" });

  if (!response.ok) {
    throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  // pipeline waits for the file to be fully flushed AND rejects on any
  // error of either side (the old code only listened to the write stream)
  await pipeline(response.body, fs.createWriteStream(filePath));

  const { size } = fs.statSync(filePath);
  if (!size) throw new Error("Downloaded file is empty");

  return filePath;
}

// Helper function to extract ZIP file
// resolves with the name of the archive root folder (TRUEEMIT-elfa7s-<branch>)
function extractZip(zipPath, extractPath) {
  return new Promise((resolve, reject) => {
    yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
      if (err) return reject(err);

      const base = path.resolve(extractPath);
      let rootName = null;
      let settled = false;

      const fail = (e) => {
        if (settled) return;
        settled = true;
        try {
          zipfile.close();
        } catch (_) {}
        reject(e);
      };

      zipfile.on("error", fail);

      zipfile.on("entry", (entry) => {
        const entryPath = path.resolve(base, entry.fileName);

        // zip-slip guard
        if (entryPath !== base && !entryPath.startsWith(base + path.sep))
          return fail(new Error(`Unsafe zip entry: ${entry.fileName}`));

        if (!rootName) rootName = entry.fileName.split("/")[0];

        if (/\/$/.test(entry.fileName)) {
          // Directory entry
          try {
            fs.mkdirSync(entryPath, { recursive: true });
          } catch (e) {
            return fail(e);
          }
          zipfile.readEntry();
        } else {
          // File entry
          try {
            fs.mkdirSync(path.dirname(entryPath), { recursive: true });
          } catch (e) {
            return fail(e);
          }

          zipfile.openReadStream(entry, (err, readStream) => {
            if (err) return fail(err);

            readStream.on("error", fail);

            const writeStream = fs.createWriteStream(entryPath);
            writeStream.on("error", fail);
            writeStream.on("close", () => {
              if (!settled) zipfile.readEntry();
            });

            readStream.pipe(writeStream);
          });
        }
      });

      zipfile.on("end", () => {
        if (settled) return;
        settled = true;
        if (!rootName) return reject(new Error("Zip file is empty"));
        resolve(rootName);
      });

      zipfile.readEntry();
    });
  });
}

// Helper function to copy directory contents
function copyDirContents(src, dest) {
  if (!fs.existsSync(src)) return;

  fs.mkdirSync(dest, { recursive: true });

  const items = fs.readdirSync(src);

  items.forEach((item) => {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);

    if (fs.statSync(srcPath).isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDirContents(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

// Helper function to clean directory (except node_modules and .bolt)
function cleanDirectory(dir, skip = []) {
  const items = fs.readdirSync(dir);

  items.forEach((item) => {
    if (skip.includes(item)) {
      return; // Skip these directories
    }

    const itemPath = path.join(dir, item);
    if (fs.statSync(itemPath).isDirectory()) {
      fs.rmSync(itemPath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(itemPath);
    }
  });
}

// Helper function to launch install.bat in its own detached console.
// It must be detached: install.bat ends with start.bat (the new server), so it
// never returns — waiting for it would keep the old process alive forever.
// Node >= 18.20 also refuses to spawn .bat/.cmd without a shell.
function startFile(file, cwd) {
  if (!fs.existsSync(file)) throw new Error(`Install file not found: ${file}`);

  const command =
    process.platform === "win32"
      ? `start "TRUEEMIT Update" /D "${cwd}" "${file}"`
      : `"${file}"`;

  const child = spawn(command, {
    cwd,
    shell: true,
    detached: true,
    stdio: "ignore",
  });

  child.on("error", (err) => console.error("[update] startFile:", err));
  child.unref();

  return true;
}
