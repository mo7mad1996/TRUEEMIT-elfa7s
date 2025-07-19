<template>
  <div class="__default_layout">
    <LayoutHeader />

    <main class="__main_layout">
      <NuxtChild
        v-if="socket"
        :cars="cars"
        :socket="socket"
        @add_car="add_car"
        @remove="remove"
        @updateCars="updateCars"
      />
    </main>

    <Alert />
  </div>
</template>

<script>
import Alert from "@/components/layout/alert";
let lastData = [];
let updating = false;

export default {
  components: { Alert },
  name: "Layout",
  data() {
    return {
      normal_cars: [],
      cars: [],
      exclusive_cars: [],
      socket: null,
    };
  },
  methods: {
    handelKey(e) {
      switch (e.target.tagName.toLocaleLowerCase()) {
        case "input":
        case "textarea":
          break;

        default:
          // backspace 🛺
          if (e.keyCode == 8) this.$router.back();
      }
    },

    add_car(car) {
      this.cars = [...this.cars, car];
    },

    update() {},

    updateCars(car) {
      const cars = [
        ...this.cars.map((e) => (e._id == car._id ? { ...car } : e)),
      ];

      this.cars = cars;
      this.update();
    },

    remove(id) {
      this.cars = this.cars.filter((car) => car._id != id);

      this.update();
    },

    connect() {
      this.socket = this.$nuxtSocket({
        name: "main",
        channel: "/",
        url: "/",
        reconnection: true,

        auth: {
          role: this.$auth.user.job,
        },
      });

      this.socket.on("disconnect", () => {
        window.location.reload();
      });
    },

    focus() {
      if (!this.socket?.connected) window.location.reload();
    },
  },

  mounted() {
    addEventListener("keydown", this.handelKey);
    addEventListener("focus", this.focus);

    // socket
    this.connect();

    // get cars
    this.socket.on("cars", (data) => {
      if (updating) return;
      this.cars = data;
    });
  },

  beforeDestroy() {
    removeEventListener("keydown", this.handelKey);
    removeEventListener("focus", this.focus);
  },

  watch: {
    cars: {
      handler(data) {
        const hasDiff = JSON.stringify(data) != JSON.stringify(lastData);

        lastData = JSON.parse(JSON.stringify(data));
        if (hasDiff && !updating) {
          updating = true;
          this.socket.emit("update-cars", data, () => (updating = false));
        }
      },
      deep: true,
    },
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
