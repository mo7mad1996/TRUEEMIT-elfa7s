<template>
  <div class="login-form-container">
    <form @submit.prevent="submit">
      <div class="text-center title">
        <h3>تسجيل مدير جديد</h3>
      </div>

      <div class="form-input">
        <input type="text" id="name" required v-model="name" autofocus />
        <label for="name">
          <font-awesome-icon icon="fa-solid fa-user" />
          الاسم</label
        >
      </div>

      <div class="form-input">
        <input type="text" id="id" required v-model="id" />

        <label for="id">
          <font-awesome-icon icon="fa-solid fa-id-card-clip" />
          رقم المستخدم
        </label>
      </div>

      <div class="form-input">
        <input type="password" id="password" required v-model="password" />
        <label for="password">
          <font-awesome-icon icon="fa-solid fa-lock" />
          كلمة المرور
        </label>
      </div>

      <button class="btn d-block" type="submit" :disabled="submited">
        <Loader v-if="submited" />
        <span v-else>دخول</span>
      </button>
    </form>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "Fourth",
  data: () => ({
    submited: false,
    name: "",
    password: "",
    id: "",
  }),
  methods: {
    ...mapActions({
      setAlert: "alert/add",
    }),
    submit() {
      this.$axios
        .$post("/users/add", {
          name: this.name,
          user_id: this.id,
          password: this.password,
          job: "manager",
        })
        .then((_) => {
          this.$router.push("/login");
          this.setAlert({ text: "تم إضافة المدير" });
        });
    },
  },
};
</script>
