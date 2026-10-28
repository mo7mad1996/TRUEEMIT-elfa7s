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
// same diff/apply rules the socket server uses, so patches never drift
import { clone, diffCars, applyPatches } from "@/server/IO/patch";

// baseline the deep watcher diffs against — what we have already told the
// server about (or received from it). Kept per module, like before.
let lastData = [];

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
        name: "home",
        channel: "/",
        reconnection: true,

        auth: {
          role: this.$auth.user.job,
          // exclusive users get their own room, so the server needs the id
          user: this.$auth.user._id,
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

    // full snapshot (sent once on connect) — rebase the baseline so the
    // watcher below does not diff it straight back to the server
    this.socket.on("cars", (data) => {
      this.cars = data;
      lastData = clone(data);
    });

    // an incoming patch from another client — apply it to the live list and
    // to the baseline, so the watcher sees no local diff and does not echo it
    this.socket.on("patch-cars", (patches) => {
      applyPatches(this.cars, patches, (obj, key, value) =>
        this.$set(obj, key, value)
      );
      applyPatches(lastData, patches);
    });
  },

  beforeDestroy() {
    removeEventListener("keydown", this.handelKey);
    removeEventListener("focus", this.focus);
  },

  watch: {
    cars: {
      handler(data) {
        // only the fields that actually changed go over the wire, as a few
        // small patches — never the whole draft list
        const patches = diffCars(lastData, data);
        if (!patches.length) return;

        lastData = clone(data);
        this.socket.emit("patch-cars", patches);
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
