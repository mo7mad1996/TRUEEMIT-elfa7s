<template>
  <div class="overlay login" @click="$emit('close')">
    <div class="login-form-container model" @click.stop>
      <form @submit.prevent="submit">
        <div class="text-center title">
          <h3>أضف مستحدم جديد</h3>
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
            اسم المستخدم
          </label>
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

            <span v-if="!valid" class="error">محجوز جرب رقم مستخدم اخر </span>
          </label>
        </div>

        <div class="form-input">
          <input
            type="password"
            id="password"
            required
            v-model="password"
            autofocus
            autocomplete="off"
          />
          <label for="password">
            <font-awesome-icon icon="fa-solid fa-lock" />
            كلمة المرور
          </label>
        </div>

        <div class="form-select">
          <label for="job">
            <font-awesome-icon icon="fa-solid fa-screwdriver-wrench" />
            الوظيفة
          </label>

          <select v-model="job" required>
            <option value="">اختر الوظيفه</option>
            <option
              v-for="job in Object.keys($shop.jobs)"
              :key="job"
              :value="job"
            >
              {{ $shop.jobs[job] }}
            </option>
          </select>
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
  name: "Add_user_modle",
  data: () => ({
    name: "",
    user_id: "",
    password: "",
    submited: false,
    job: "",
    valid: true,
  }),
  methods: {
    ...mapActions({ setAlert: "alert/add" }),

    submit() {
      if (this.valid && this.user_id) {
        this.submited = true;
        this.$axios
          .$post("/users/add", {
            name: this.name,
            user_id: this.user_id,
            password: this.password,
            job: this.job,
            valid: true,
          })
          .then((data) => {
            if (data.saved) {
              this.$emit("close");
              this.$emit("user", data.user);
              this.setAlert({ text: "تم إضافة المستخدم" });
            }
          })
          .catch((err) =>
            this.setAlert({ text: "حدث خطأ ما تأكد من البيانات", error: true })
          );
      } else {
        this.setAlert({ text: "تاكد من رقم المستخدم", error: true });
      }
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
  watch: {
    user_id(newValue) {
      if (newValue)
        this.$axios
          .$post("/users/check_id", { user_id: newValue })
          .then((res) => {
            this.valid = res;
          });
    },
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
