<template>
  <div class="login-form-container">
    <form @submit.prevent="submit">
      <div class="text-center title">
        <h3>تحديد صلاحيه</h3>
      </div>

      <div class="form-input">
        <input
          type="date"
          id="expired"
          required
          v-model="expired"
          autofocus
          ref="date"
        />
        <label for="expired">صالح حتى</label>
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

export default {
  name: "Secound",
  data() {
    return {
      expired: "",
      submited: false,
    };
  },
  methods: {
    submit() {
      this.submited = true;
      const expired = new Date(this.expired);

      this.$emit("expired", expired.getTime());
      this.$emit("next");
    },
  },
  mounted() {
    this.$refs.date.value = new Date().toISOString().split("T")[0];
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
