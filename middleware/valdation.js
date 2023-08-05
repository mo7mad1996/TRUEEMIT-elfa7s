export default async function ({ $axios, redirect }) {
  const { fileExists, shop } = await $axios.$get("/trueemit/isvalid");
  let go_to = "";

  if (fileExists) {
    if (shop) {
      await $axios.$get("/trueemit/remove_file");
      if (shop.expired < Date.now()) go_to = "/trueemit/new_period";
      else go_to = null;
    } else go_to = "/trueemit/new_client";
  } else {
    if (shop) {
      if (shop.expired < Date.now()) go_to = "/trueemit/new_period";
      else go_to = null;
    } else await $axios.$get("/trueemit/remove_all");
  }
  return redirect(go_to);
}
