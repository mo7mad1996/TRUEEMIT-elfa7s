<template>
  <div class="overlay login" @click="$emit('close')">
    <div class="login-form-container model" @click.stop>
      <form @submit.prevent="submit">
        <div class="text-center title">
          <h3>إستلام مبلغ</h3>
        </div>

        <div class="form-input">
          <input id="createdAt" v-model="createdAt" type="date" />
          <label for="createdAt">
            <font-awesome-icon :icon="['far', 'calendar-check']" />
            بتاريخ
          </label>
        </div>

        <div class="form-input">
          <input
            id="value"
            required
            v-model="value"
            autofocus
            autocomplete="off"
            @input="(e) => validate(e)"
          />
          <label for="value">
            <font-awesome-icon :icon="['fas', 'dollar-sign']" />

            المبلغ
          </label>
        </div>

        <div class="form-input">
          <input type="text" id="note" v-model="note" autocomplete="off" />
          <label for="note">
            <font-awesome-icon :icon="['fas', 'comments-dollar']" />
            ملاحظات
          </label>
        </div>
        <button class="btn d-block mt-4" type="submit" :disabled="submited">
          <Loader v-if="submited" />
          <span v-else>أضف</span>
        </button>
      </form>
    </div>

    <p class="simple_text text-left mt-4">
      إضغط <span class="key">esc</span> للإلغاء.
    </p>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "Add_Pay_modle",
  props: ["id"],
  data: () => ({
    submited: false,
    value: 0,
    note: "",
    createdAt: "",
  }),
  methods: {
    ...mapActions({ setAlert: "alert/add" }),

    submit() {
      this.submited = true;
      this.$axios
        .$post(`/clients/${this.id}/addpay`, {
          value: +this.value * -1,
          note: this.note,
          createdAt: this.createdAt
            ? new Date(this.createdAt).getTime()
            : undefined,
        })
        .then((data) => {
          this.$emit("close");
          this.$emit("client", data);
        })
        .catch((err) =>
          this.setAlert({ text: "حدث خطأ ما أثناء إضافة المبلغ", error: true })
        );
    },
    validate(e) {
      this.value = e.target.value
        .replace(/[^0-9.]/g, "")
        .replace(/(\..*?)\..*/g, "$1");
    },
    keyDown(e) {
      if (e.key == "Escape") this.$emit("close");
    },
  },
  mounted() {
    addEventListener("keydown", this.keyDown);
    this.createdAt = this.$moment().lang("en").format("YYYY-MM-DD");
  },
  beforeDestroy() {
    removeEventListener("keydown", this.keyDown);
  },
};
</script>

<style lang="scss" scoped>
.error {
  color: red;
  font-weight: bold;
}

.overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  background: rgba(241, 241, 241, 0.467);
  display: grid;
  place-items: center;
  min-height: 100vh;
  backdrop-filter: blur(5px);

  .model {
    background: white;
    border-radius: 10px;
    color: #333;

    input {
      border-color: #333;
    }
  }

  .simple_text {
    position: absolute;
    bottom: 1em;
    left: 1em;
  }
}
</style>
