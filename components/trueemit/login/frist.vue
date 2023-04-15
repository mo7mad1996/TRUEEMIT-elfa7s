<template>
  <div class="login-form-container">
    <form @submit.prevent="submit">
      <div class="text-center title">
        <h3>تسجيل الشركة</h3>
        <slot />
        <p>إن ظهرت هذه الصفحة فرجاء التواصل مع شركة TrueEmit</p>
      </div>

      <div class="form-input">
        <input
          type="password"
          id="password"
          required
          v-model="password"
          ref="input"
        />
        <label for="password"
          ><font-awesome-icon icon="fa-solid fa-lock" />
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
  name: "Frist",

  data() {
    return {
      password: "",
      submited: false,
    };
  },
  methods: {
    ...mapActions({
      setError: "alert/add",
    }),
    submit() {
      this.submited = true;
      this.$axios
        .$post("/trueemit/password", { password: this.password })
        .then(({ ok, text }) => {
          if (ok) {
            this.$emit("next");
            this.$emit("password", this.password);
          } else {
            this.setError({ text, error: true });
            this.submited = false;
            this.password = "";
            this.$refs.input.focus();
          }
        });
    },
  },
  components: {
    Loader,
  },
};
</script>

<style lang="scss" scoped>
.form-input {
  color: white;
}
</style>
