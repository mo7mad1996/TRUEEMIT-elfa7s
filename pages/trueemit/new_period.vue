<template>
  <div class="login">
    <canvas ref="canvas"></canvas>
    <Transition name="fade" mode="out-in">
      <Frist @next="next" @password="setPassword" v-if="step == 1">
        <template>
          <h4>نعتذر!!</h4>
          <p>لكن الفتره انتهت ولا يمكن استخدام البرنامج الى بعد علم الشركه</p>
          <p>رجاء التواصل على رقم</p>
          <p class="dir-ltr">(+2) 010 6352 5389</p>
        </template>
      </Frist>
      <Secound @expired="submit" v-else />
    </Transition>
  </div>
</template>

<script>
import Frist from "@/components/trueemit/login/frist.vue";
import Secound from "@/components/trueemit/login/secound.vue";

export default {
  data() {
    return {
      step: 1,
      password: "",
    };
  },
  mounted() {
    this.$partical(this.$refs.canvas);
  },
  methods: {
    next() {
      this.step++;
    },
    setPassword(value) {
      this.password = value;
    },
    submit(expired) {
      this.$axios
        .$post("/trueemit/update_client", {
          expired,
        })
        .then(() => {
          this.$router.push("/login");
        })
        .catch((err) => {
          res.status(403).json({ err });
          console.log(err);
        });
    },
  },
  auth: false,
  layout: "login",
  components: { Frist, Secound },
  head: () => ({
    title: "انتهاء الفترة",
  }),
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
