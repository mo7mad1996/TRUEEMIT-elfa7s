<template>
  <div class="__default_layout" @input="update" @change="update">
    <LayoutHeader />
    <main class="__main_layout">
      <NuxtChild
        :cars="cars"
        :socket="socket"
        @add_car="add_car"
        @remove="remove"
      />
    </main>

    <Alert />
  </div>
</template>

<script>
import Alert from "@/components/layout/alert";

export default {
  components: { Alert },
  name: "Layout",
  data: () => ({ cars: [], socket: false }),
  methods: {
    handelKey(e) {
      switch (e.target.tagName.toLocaleLowerCase()) {
        case "input":
        case "textarea":
          break;

        default:
          if (e.keyCode == 8) this.$router.back();
      }
    },

    add_car(car) {
      this.cars = [...this.cars, car];
      this.update();
    },

    update() {
      this.socket.emit("update cars", this.cars);
    },

    remove(id) {
      this.cars = this.cars.filter((car) => car._id != id);
      this.socket.emit("leave room", id);
      this.update();
    },

    connect() {
      this.socket = this.$nuxtSocket({
        name: "home",
        channel: "/",
        reconnection: true,
      });

      if (this.socket) {
        this.socket.on("update cars", (cars) => {
          this.cars = [...cars];
        });
        this.socket.on("disconnect", () => {
          window.location.reload();
        });
      }
    },

    focus() {
      if (!this.socket?.connected) window.location.reload();
    },
  },

  mounted() {
    addEventListener("keydown", this.handelKey);
    addEventListener("focus", this.focus);

    this.connect();
  },
  beforeDestroy() {
    removeEventListener("keydown", this.handelKey);
    removeEventListener("focus", this.focus);
  },
};
</script>

<style lang="scss" scoped>
.__default_layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  .__main_layout {
    flex: 1;
    padding: 1em 0;
  }
}
</style>
