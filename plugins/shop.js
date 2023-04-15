export default async ({ $axios, app }, inject) => {
  const shop = await $axios.$get("/trueemit/shop");
  if (shop) {
    shop.jobs = {
      manager: "مدير",
      engineer: "مهندس",
    };

    inject("shop", shop || {});
  }
};
