import Vue from "vue";

export default async ({ $axios, app }, inject) => {
  function init() {
    return $axios.$get("/trueemit/shop");
  }

  const shop = await init();

  const obj = Vue.observable({
    ...shop,
    jobs: {
      manager: "مدير",
      engineer: "مهندس",
      exclusive: "شركة خاصه",
    },
    refresh() {
      return init().then((newObj) => Object.assign(obj, newObj));
    },
  });

  inject("shop", obj);
};
