<template>
  <div class="login">
    <canvas ref="canvas"></canvas>
    <Transition name="fade" mode="out-in">
      <Frist @next="next" @password="setPassword" v-if="step == 1" />
      <Secound @next="next" @expired="setExpired" v-else-if="step == 2" />
      <Third @submit="submit" v-else-if="step == 3" />
      <Fourth v-else />
    </Transition>
  </div>
</template>

<script>
import Frist from "@/components/trueemit/login/frist.vue";
import Secound from "@/components/trueemit/login/secound.vue";
import Third from "@/components/trueemit/login/third.vue";
import Fourth from "@/components/trueemit/login/fourth.vue";

export default {
  data() {
    return {
      step: 1,
      password: "",
      expired: "",
      name: "",
      logo: "",
      phone: "",
      cr: "",
      address: "",
    };
  },
  mounted() {
    this.$partical(this.$refs.canvas);
  },
  components: { Frist, Secound, Third, Fourth },
  methods: {
    next() {
      this.step++;
    },
    setPassword(value) {
      this.password = value;
    },
    setExpired(value) {
      this.expired = value;
    },
    submit({ name, logo, phone, cr, address }) {
      this.$axios
        .$post("/trueemit/save_client", {
          name,
          logo,
          phone,
          cr,
          address,
          password: this.password,
          expired: this.expired,
        })
        .then((_) => {
          this.next();
        })
        .catch((err) => console.error(err));
    },
  },
  head: () => ({
    title: "عميل جديد",
  }),
  layout: "login",
};
</script>

<style lang="scss" scoped>
.login {
  min-height: 100vh;
  display: grid;
  place-items: center;
  position: relative;
  overflow: hidden;

  perspective: 100px;

  canvas {
    position: absolute;
    top: 0;
    z-index: 1;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.7s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-leave-to {
  transform: translateY(-100px);
}
.fade-enter-from {
  transform: translateY(100px);
}
</style>
