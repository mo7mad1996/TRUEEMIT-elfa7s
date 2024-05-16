<template>
  <div class="container">
    <h3>صحفة المدير</h3>

    <main>
      <ul>
        <nuxt-link
          v-for="page in pages"
          :to="page.to"
          :key="page.to"
          :title="page.title"
        >
          <li>
            <font-awesome-icon :icon="page.icon" class="icon" />
            <span>{{ page.title }}</span>
          </li>
        </nuxt-link>
      </ul>
    </main>
  </div>
</template>

<script>
export default {
  middleware: "manager",
  head: () => ({
    title: "صفحة المدير",
  }),
  data() {
    return {
      pages: [
        {
          icon: "fa-solid fa-handshake",

          title: "العملاء",
          to: "/manager/clients",
        },
        {
          icon: "fa-solid fa-users",
          title: "المستخدمين",
          to: "/manager/users",
        },
        {
          icon: "fa-solid fa-car",
          title: "السيارات",
          to: "/manager/cars",
        },
        {
          icon: "chart-line",
          title: "الاحصائيات",
          to: "/manager/statistics",
        },
        {
          icon: "fa-solid  fa-gear",
          title: "الإعدادات",
          to: "/manager/settings",
        },
      ],
    };
  },
};
</script>

<style lang="scss" scoped>
main ul {
  list-style: none;
  display: flex;
  justify-content: center;
  gap: 2em;
  flex-wrap: wrap;

  a {
    text-decoration: none;
  }

  li {
    border-radius: 10px;
    flex: 1;
    aspect-ratio: 1 /1;
    padding: 15px;
    width: 160px;
    background: #f4f3f2;
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-direction: column;
    transition: 0.3s;

    &:hover {
      background: white;
      box-shadow: rgba(17, 12, 46, 0.15) 0px 48px 100px 0px;
      box-shadow: rgba(50, 50, 93, 0.25) 0px 6px 12px -2px,
        rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;
    }

    .icon {
      font-size: 50px;
      display: block;
      margin: 0 auto 20px;
      color: gray;
    }
  }
}
</style>
