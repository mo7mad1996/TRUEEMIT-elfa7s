export default (_, inject) => {
  // uncomment this
  // edit this to <br /> not <hr />
  inject("nltobr", (text, tag = 'hr') =>
    text.trim().replaceAll("\n", `<${tag} />`)
  );
};
