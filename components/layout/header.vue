<template>
  <header>
    <div class="container">
      <div class="logo">
        <img :src="$shop.logo" />

        <div>
          <h3>{{ $shop.name }}</h3>
          <nuxt-link :to="'/' + $auth.user.job">
            صفحة ال{{ $shop.jobs[$auth.user.job] }}.
          </nuxt-link>
        </div>
      </div>

      <div class="left">
        <div class="time">{{ time }}</div>
        <button class="btn" @click="$auth.logout()" title="خروج من النظام">
          <span>خروج</span>
          <font-awesome-icon icon="fa-solid fa-right-from-bracket" />
        </button>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: "LayoutHeader",
  data() {
    return { time: "" };
  },
  mounted() {
    this.update_time();
  },
  methods: {
    update_time() {
      this.time = this.$moment().format("hh:mm");
      if (process.client) requestAnimationFrame(this.update_time);
    },
  },
};
</script>

<style lang="scss" scoped>
header {
  background: white;
  padding: 5px 10px;
  box-shadow: rgba(50, 50, 93, 0.25) 0px 13px 27px -5px,
    rgba(0, 0, 0, 0.3) 0px 8px 16px -8px;

  .container {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .logo {
      display: flex;
      gap: 10px;
      align-items: center;

      * {
        margin: 0;
      }

      img {
        max-height: 70px;
        max-width: 14vw;
      }

      a {
        color: #555;
        text-decoration: none;
        font-size: 0.8em;
      }
    }

    .left {
      display: flex;
      gap: 10px;
      align-items: center;
      .time {
        color: #555;

        @media (max-width: 840px) {
          display: none;
        }
      }
    }
  }
}
</style>
