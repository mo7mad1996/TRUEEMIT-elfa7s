export default async (_, inject) => {
  function check_max_lines(e) {
    const max = +e.target.getAttribute("data-max");
    const current = e.target.value.split("\n").length;
    console.log(e.key);

    if (current > max + 1 && !(e.key == "Backspace")) {
      e.preventDefault();
      return;
    }
  }
  inject("check_max_lines", check_max_lines);
};
