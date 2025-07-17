export default (_, inject) => {
  // uncomment this
  // edit this to <br /> not <hr />
  inject("nltobr", (text) => text.trim().replaceAll("\n", "<hr />"));
};
