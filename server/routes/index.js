const fs = require("fs");
const path = require("path");

const pages_dir = path.join(__dirname, "pages");

module.exports = async (app, express) => {
  const pages = fs.readdirSync(pages_dir, "utf-8").sort();

  for (const page of pages) {
    const router = express.Router();
    app.use(
      "/api/" + page.split(".")[0],
      require(path.join(pages_dir, page))(router, app)
    );
  }
};
