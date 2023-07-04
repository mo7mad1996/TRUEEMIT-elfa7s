export default (_, inject) => {
  // uncommint this
  // edit this to <br /> not <hr />
  inject("nltobr", (text) => text.trim().replaceAll("\n", "<hr />"));
};
