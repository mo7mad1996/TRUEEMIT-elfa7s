import Vue from "vue";

Vue.directive("click-outside", {
  bind(el, binding) {
    el.__clickOutside__ = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event);
      }
    };
    document.addEventListener("click", el.__clickOutside__);
  },
  unbind(el) {
    document.removeEventListener("click", el.__clickOutside__);
    el.__clickOutside__ = null;
  },
});
