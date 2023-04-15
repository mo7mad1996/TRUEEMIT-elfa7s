<template>
  <div class="login-form-container">
    <form @submit.prevent="submit">
      <div class="text-center title">
        <h3>تسجيل الدخول</h3>
        <p>مرحبا بعودتك</p>
      </div>

      <div class="form-input">
        <input
          type="text"
          id="user_id"
          required
          v-model="user_id"
          autofocus
          autocomplete="off"
        />
        <label for="user_id">
          <font-awesome-icon icon="fa-solid fa-id-card-clip" />
          رقم المستخدم
        </label>
      </div>

      <div class="form-input">
        <input
          type="password"
          id="password"
          required
          v-model="password"
          autocomplete="off"
        />
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
import Loader from "@/components/loader";
import { mapActions } from "vuex";

export default {
  data: () => ({ submited: false, user_id: "", password: "" }),
  name: "LoginForm",
  methods: {
    ...mapActions({
      setAlert: "alert/add",
    }),
    async submit() {
      // this.submited = true

      try {
        const { data } = await this.$auth.loginWith("local", {
          data: {
            user_id: this.user_id,
            password: this.password,
          },
        });

        const last_login = data.user.lastLogin;
        if (last_login)
          this.setAlert({
            text: `مرحباً ${this.$auth.user.name}
            اخر دخول كان ${this.$moment(last_login).calendar()}
            `,
          });
      } catch (err) {
        console.log(err);
        this.setAlert({
          error: true,
          text: "تأكد من رقم المستخدم او كلمة المرور",
        });
      }
    },
  },
  components: { Loader },
};
</script>

<style lang="scss" scoped></style>
