<template>
  <div class="login">
    <canvas ref="canvas"></canvas>

    <LoginForm />
  </div>
</template>

<script>
import LoginForm from "@/components/login/form";

export default {
  components: { LoginForm },
  mounted() {
    this.$partical(this.$refs.canvas);
  },
  head: () => ({
    title: "تسجيل الدخول",
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
