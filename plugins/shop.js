import Vue from "vue";

export default async ({ $axios, app }, inject) => {
  const init = () => $axios.$get("/trueemit/shop");
  const response = await init();
  const shop = response.shop;

  const obj = Vue.observable({
    ...(shop || {}),
    ready: Boolean(shop) && response.status === "ready",
    status: response.status,
    // SHOP_BRANCH — root folder for uploads (plugins/upload.js)
    branch: response.branch || "",
    jobs: {
      manager: "مدير",
      engineer: "مهندس",
      exclusive: "شركة خاصه",
    },
  });

  inject("shop", obj);
};
