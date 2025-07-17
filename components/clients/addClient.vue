<template>
  <div class="overlay login" @click="$emit('close')">
    <div class="login-form-container model" @click.stop>
      <form @submit.prevent="submit">
        <div class="text-center title">
          <h3>أضف عميل جديد</h3>
        </div>

        <div class="form-input">
          <input
            type="text"
            id="name"
            required
            v-model="name"
            autofocus
            autocomplete="off"
          />
          <label for="name">
            <font-awesome-icon icon="fa-solid fa-user" />
            اسم العميل
          </label>
        </div>

        <div class="form-input">
          <input
            id="start"
            required
            v-model="start"
            autocomplete="off"
            @input="(e) => validate(e)"
          />
          <label for="start">
            <font-awesome-icon :icon="['fas', 'dollar-sign']" />
            رصيد سابق
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
  name: "Add_client_modle",
  data: () => ({
    name: "",
    start: 0,
    submited: false,
  }),
  methods: {
    ...mapActions({ setAlert: "alert/add" }),

    submit() {
      this.submited = true;
      this.$axios
        .$post("/clients/add", {
          name: this.name,
          start: +this.start,
        })
        .then((data) => {
          if (data.saved) {
            this.$emit("close");
            this.$emit("client", data.client);
            this.setAlert({ text: "تم إضافة العميل" });
          }
        })
        .catch((err) =>
          this.setAlert({ text: "حدث خطأ ما تأكد من البيانات", error: true })
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
