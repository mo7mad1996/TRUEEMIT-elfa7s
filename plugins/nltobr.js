export default (_, inject) => {
  // uncommint this
  // edit this to <br /> not <hr />
  inject("nltobr", (text) => text.replaceAll("\n", "<hr />"));
};
