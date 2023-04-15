<template>
  <div
    class="alert"
    :class="{ active, error }"
    @mouseenter="can_remove(false)"
    @mouseleave="can_remove(true)"
  >
    <button @click="close" v-if="text">
      <font-awesome-icon icon="fa-solid fa-close" />
    </button>
    <span>{{ text }}</span>
    <div class="info_icon" v-if="text">
      <font-awesome-icon icon="fa-solid fa-warning" v-if="error" />
      <font-awesome-icon icon="fa-solid fa-check-circle" v-else />
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  computed: mapState({
    text: (store) => store.alert.text,
    error: (store) => store.alert.error,
    active: (store) => store.alert.active,
    remove: (store) => store.alert.can_remove,
  }),
  methods: mapActions({
    can_remove: "alert/can_remove",
    close: "alert/close",
  }),
};
</script>

<style lang="scss" scoped>
.alert {
  padding: 5px;
  position: fixed;
  bottom: -10%;
  left: min(10vw, 100px);
  transition: 0.4s;
  border: 2px solid #c7e1cd;
  background: #eaf7ee;
  color: #3d3d43;
  border-radius: 10px;
  z-index: 99999;
  display: flex;
  align-items: center;
  gap: 1em;

  .info_icon {
    background: #38b259;
    aspect-ratio: 1;
    font-size: 1.7em;
    color: white;
    padding: 0.3em;
    border-radius: 0.6em;
    display: grid;
    place-content: center;
    box-shadow: rgba(0, 0, 0, 0.04) 0px 3px 5px;
    box-shadow: rgba(50, 50, 93, 0.25) 0px 6px 12px -2px,
      rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;
  }

  button {
    color: #69717c;
    border-radius: 5px;
    border: none;
    background: none;
    aspect-ratio: 1;
    display: grid;
    font-size: 1em;
    place-content: center;
    padding: 0.6em;
    cursor: pointer;

    &:hover {
      transition: 0.2s;
      background: white;
      color: #333c49;
    }
  }

  &.active {
    bottom: 35px;
  }

  &.error {
    border-color: #f1d5cf;
    background: #fcede9;

    .info_icon {
      background: #e94d2c;
    }
  }
}
</style>
