<template>
  <div class="container">
    <h2>
      المستخدمين:

      <button class="btn" title="إضافة مستخدم جديد" @click="toggle_model">
        <span>أضف مستخدم</span>
        <font-awesome-icon icon="fa-solid fa-user-plus" />
      </button>
    </h2>

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
        <!-- <font-awesome-icon icon="fa-solid fa-plus" /> -->
      </button>
    </section>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th></th>
            <td v-for="colomn in colomns" :key="colomn.en">
              {{ colomn.ar }}
            </td>
            <th>اخر دخول للنظام</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user._id">
            <td>
              <button
                title="حذف المستخدم"
                @click="remove(user._id)"
                v-if="$auth.user._id != user._id"
              >
                <!-- <font-awesome-icon icon="fa-solid fa-user-slash" /> -->
                <font-awesome-icon icon="fa-solid fa-user-xmark" />
              </button>
            </td>
            <td v-for="colomn in colomns" :key="colomn.en">
              {{ user[colomn.en] }}
            </td>

            <td class="d-8">{{ user.lastLogin }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <Add_user_modle
      v-if="is_model_open"
      @close="toggle_model"
      @user="add_user"
    />
  </div>
</template>

<script>
import LayoutHeader from "@/components/layout/header";
import Add_user_modle from "@/components/users/addUser";

export default {
  async asyncData({ $moment, $axios, $shop }) {
    const users = await $axios.$get("/users");

    const DB_users = users.map((user) => ({
      ...user,
      lastLogin: user.lastLogin && $moment(user.lastLogin).fromNow(),
      job: $shop.jobs[user.job],
    }));
    return { DB_users };
  },
  middleware: "manager",
  data: () => {
    return {
      is_model_open: false,
      filters: [{ value: "" }],
      users: [],
      colomns: [
        { en: "name", ar: "الاسم" },
        { en: "user_id", ar: "رقم المستخدم" },
        { en: "job", ar: "الوظيفة" },
      ],
    };
  },
  components: { LayoutHeader, Add_user_modle },
  methods: {
    toggle_model() {
      this.is_model_open = !this.is_model_open;
    },
    add_user(user) {
      this.DB_users.push({ ...user, job: this.$shop.jobs[user.job] });
    },
    remove(id) {
      if (confirm("هل انت متاكد من حذف المستخدم?"))
        this.$axios.$delete("/users/" + id).then((_) => {
          this.users = this.users.filter((el) => el._id != id);
        });
    },

    setUsers() {
      this.users = this.$filter(
        this.DB_users,
        this.filters,
        Object.keys(this.DB_users[0] || {}).filter(
          (el) => !this.colomns.map((el) => el.en).includes(el)
        )
      );
    },
  },
  mounted() {
    this.users = this.DB_users;
  },
  head: () => ({
    title: "المستخدمين",
  }),
};
</script>

<style lang="scss" scoped>
h2 {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
table button {
  color: red;
  font-size: 16px;
  width: 2em;
  background: none;
  border: none;
  cursor: pointer;
  transition: 0.3s;
  border-radius: 50%;
  aspect-ratio: 1;

  &:hover,
  &:focus {
    border: 1px solid red;
    background: rgba(253, 80, 80, 0.351);
  }
}
</style>
