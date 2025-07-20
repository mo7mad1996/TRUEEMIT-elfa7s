var JsBarcode = require("jsbarcode");
export default async (_, inject) => {
  inject("barcode", (svg, text) => {
    JsBarcode(svg, text);
  });
};
