<template>
  <div class="container">
    <h2>الشركات الخاصه</h2>

    <section class="filters">
      <input
        v-for="(filter, n) in filters"
        :key="n"
        v-model="filter.value"
        placeholder="بحث..."
        @input="setUsers"
      />

      <button
        class="btn"
        @click="filters.push({ value: '' })"
        title="أضف بحث جديد"
      >
        <font-awesome-icon icon="fa-solid fa-magnifying-glass-plus" />
      </button>
    </section>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th v-for="column in columns" :key="column.en">{{ column.ar }}</th>
          </tr>
        </thead>
        <tbody>
          <client-only>
            <tr
              v-for="user in users"
              :key="user._id"
              @click="$router.push('/manager/exclusive/' + user._id)"
              title="عرض السيارات"
            >
              <td v-for="column in columns" :key="column.en" :class="column.en">
                {{ user[column.en] || (column.en == "cars" ? 0 : "-") }}
              </td>
            </tr>
          </client-only>
        </tbody>
      </table>
    </div>

    <p v-if="!users.length" class="text-center opacity-60 mt-8">
      لا يوجد مستخدمين من نوع شركة خاصه.
    </p>
  </div>
</template>

<script>
export default {
  async asyncData({ $axios, $moment }) {
    const owners = await $axios.$get("/cars-exclusive/owners");

    const DB_users = owners.map((user) => ({
      ...user,
      lastLogin: user.lastLogin && $moment(user.lastLogin).fromNow(),
      last_car: user.last_car && $moment(user.last_car).format("DD/MM/YYYY"),
    }));

    return { DB_users };
  },
  middleware: "manager",
  head: () => ({ title: "الشركات الخاصه" }),
  data() {
    return {
      filters: [{ value: "" }],
      users: [],
      columns: [
        { en: "name", ar: "الاسم" },
        { en: "user_id", ar: "رقم المستخدم" },
        { en: "cars", ar: "عدد السيارات" },
        { en: "last_car", ar: "اخر سياره" },
        { en: "lastLogin", ar: "اخر دخول للنظام" },
      ],
    };
  },
  methods: {
    setUsers() {
      this.users = this.$filter(
        this.DB_users,
        this.filters,
        Object.keys(this.DB_users[0] || {}).filter(
          (el) => !this.columns.map((el) => el.en).includes(el)
        )
      );
    },
  },
  mounted() {
    this.users = this.DB_users;
  },
};
</script>

<style lang="scss" scoped>
.cars {
  color: #3a78d7;
}
</style>
