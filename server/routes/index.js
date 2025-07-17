const fs = require("fs");
const path = require("path");

const pages_dir = path.join(__dirname, "pages");

module.exports = async (app, express) => {
  const pages = await fs.readdirSync(pages_dir);

  pages.forEach((page) => {
    const router = express.Router();
    app.use(
      "/api/" + page.split(".")[0],
      require(path.join(pages_dir, page))(router)
    );
  });
};
