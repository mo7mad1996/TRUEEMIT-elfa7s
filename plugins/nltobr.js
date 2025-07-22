export default (_, inject) => {
  inject("nltobr", (text, tag = "hr") =>
    text.trim().replaceAll("\n", `<${tag} />`)
  );
};
