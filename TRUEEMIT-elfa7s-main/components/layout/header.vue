a
<template>
  <header
    class="pt-1 sticky top-0 left-0 z-50 backdrop-blur-sm mx-auto container"
  >
    <div
      class="backdrop-blur-sm bg-white/30 flex items-center justify-between border shadow rounded-lg px-2 py-2"
    >
      <div class="flex items-end gap-2 flex-1">
        <nuxt-link to="/">
          <img :src="$auth.user?.logo || $shop.logo" class="h-16" />
        </nuxt-link>
        <div class="clock">
          <div>
            <span class="text-2xl">{{ time.full }}</span>
            <span class="text-xs opacity-60">{{ time.am_pm }}</span>
          </div>
          <div class="text-sm opacity-60">{{ time.date }}</div>
        </div>
      </div>

      <div class="text-center flex-1 text-lg">
        <h3 class="">{{ $shop.name }}</h3>
        <p class="opacity-60 text-sm">{{ $auth.user.name }}</p>
      </div>

      <div
        class="flex flex-1 justify-end relative"
        v-click-outside="() => (menu = false)"
      >
        <button
          class="p-2 flex bg-slate-100 hover:bg-slate-200 aspect-square rounded"
          @click.prevent.stop="menu = !menu"
        >
          <font-awesome-icon
            icon="fa-solid fa-bars"
            class="pointer-events-none"
          />
        </button>

        <Transition>
          <ul
            v-if="menu"
            class="absolute top-full py-0.5 min-w-36 z-50 mt-2 shadow rounded origin-top overflow-hidden flex flex-col gap-0"
          >
            <li
              class="group flex gap-px flex-col backdrop-blur-sm px-1 py-0.5 bg-white/50"
              v-for="(link, n) in links.filter((l) => l.show)"
              :key="n"
              @click="() => handleClick(link)"
            >
              <nuxt-link
                class="flex gap-3 items-center group-hover:bg-slate-200/80 text-gray-700 py-1 px-2 rounded"
                :class="link.customClass"
                :to="link.to"
              >
                <font-awesome-icon
                  v-if="link.icon"
                  :icon="link.icon"
                  class="text-sm opacity-75"
                />
                <span>{{ link.title }}</span>
              </nuxt-link>
            </li>
          </ul>
        </Transition>
      </div>
    </div>
  </header>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "LayoutHeader",

  data() {
    const job = this.$auth?.user?.job;

    return {
      menu: false,
      links: [
        { to: "/", title: "الرئيسية", icon: "fa-solid fa-home", show: true },
        {
          to: `/${job}/cars`,
          title: "السيارات",
          icon: "fa-car-rear",
          show: ["engineer", "exclusive"].includes(job),
        },
        {
          to: `/${job}/settings`,
          title: "الإعدادات",
          icon: "fa-cog",
          show: ["engineer", "exclusive"].includes(job),
        },
        {
          to: ``,
          title: "تحديث البرنامج",
          icon: "cloud-arrow-down",
          show: ["manager"].includes(job),
          action() {
            this.$axios.$get("/trueemit/update");
          },
        },
        {
          to: "",
          title: "خروج من النظام",
          // icon: "fa-solid fa-right-from-bracket",
          show: true,
          customClass:
            "!bg-red-500 px-6  group-hover:!bg-red-600 justify-center text-white shadow",
          action() {
            this.$auth.logout();
          },
        },
      ],
      time: {
        full: "",
        am_pm: "",
        date: "",
      },
    };
  },

  methods: {
    ...mapActions({
      setAlert: "alert/add",
    }),

    handleClick(link) {
      if (typeof link.action === "function") {
        link.action.bind(this).call(this);
      }

      this.closeMenu();
    },

    updateTime() {
      const now = this.$moment();

      this.time.full = now.locale("en").format("hh:mm");
      this.time.am_pm = now.locale("en").format("A");
      this.time.date = now.locale("ar").format("dddd: DD MMM Y");

      requestAnimationFrame(this.updateTime);
    },

    closeMenu() {
      this.menu = false;
    },
  },

  mounted() {
    this.updateTime();
  },
};
</script>

<style scoped lang="scss">
.v-enter-active {
  animation: menu 0.2s ease;
}

.v-leave-active {
  animation: menu 0.2s ease reverse;
}

@keyframes menu {
  from {
    transform: perspective(100px) rotateX(-90deg) scale(0.7);
  }
}
</style>
