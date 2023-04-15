export default (_, inject) => {
  inject("nltobr", (text) => text.replaceAll("\n", "<br />"));
};
