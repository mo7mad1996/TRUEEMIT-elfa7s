export default async function ({ $axios, redirect }) {
  const data = await $axios.$get("/trueemit/isvalid");
  return redirect(data.redirect);
}
