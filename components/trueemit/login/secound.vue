<template>
  <div class="login-form-container">
    <form @submit.prevent="submit">
      <div class="text-center title">
        <h3>تحديد صلاحيه</h3>
      </div>

      <div class="dp-field">
        <label for="expired">صالح حتى</label>
        <DatePicker id="expired" v-model="expired" />
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
    // default to today (local), kept in sync through v-model
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    this.expired = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  },
  components: {
    Loader,
  },
};
</script>

<style lang="scss" scoped>
.dp-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 1em;
  color: white;

  label {
    display: flex;
    align-items: center;
    gap: 0.5em;
  }
}
</style>
