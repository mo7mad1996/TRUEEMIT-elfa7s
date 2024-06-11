<template>
  <div class="container">
    <div>
      <h3>المستخدم</h3>

      <form class="simple_form" @submit.prevent="update_user">
        <div class="form-input">
          <label>
            <font-awesome-icon icon="fa-solid fa-user" />
            الاسم
          </label>
          <input v-model="user.name" />
        </div>
        <div class="form-input">
          <label>
            <font-awesome-icon icon="fa-solid fa-id-card-clip" />
            رقم المستخدم
          </label>
          <input v-model="user.user_id" />
        </div>
        <div class="form-input">
          <label>
            <font-awesome-icon icon="fa-solid fa-lock" />
            كلمة المرور الجديده
          </label>
          <input v-model="user.new_pass" type="password" />
        </div>

        <button type="submit" class="btn" :disabled="user.loading">
          <Loader v-if="user.loading" />
          <span v-else>تعديل</span>
        </button>
      </form>
    </div>
    <hr />
    <div>
      <h3>المؤسسة</h3>

      <form class="simple_form" @submit.prevent="update_shop">
        <div class="form-input">
          <label>
            <font-awesome-icon icon="fa-solid fa-font-awesome" />
            اللوجو والشعار
          </label>
          <div class="d-flex">
            <img :alt="shop.name" :src="new_logo || shop.logo" />
            <button
              class="btn"
              @click.prevent="new_logo = ''"
              v-if="new_logo"
              title="حذف"
            >
              <font-awesome-icon :icon="['fas', 'xmark']" />
            </button>
            <label for="new_logo" class="btn" title="تعديل">تعديل</label>
          </div>
        </div>

        <div class="form-input">
          <label>
            <font-awesome-icon icon="fa-solid fa-store" />
            اسم المؤسسه
          </label>
          <input v-model="shop.name" />
        </div>

        <div class="form-input">
          <label>
            <font-awesome-icon icon="fa-solid fa-phone" />
            أرقام الهواتف
          </label>
          <input v-model="shop.phone" />
        </div>
        <div class="form-input">
          <label>
            <font-awesome-icon :icon="['fas', 'building-shield']" />
            سجل تجاري
          </label>
          <input v-model="shop.cr" />
        </div>
        <div class="form-input">
          <label>
            <font-awesome-icon :icon="['fass', 'map-location-dot']" />
            العنوان
          </label>
          <input v-model="shop.address" />
        </div>
        <div class="form-input">
          <label>
            <font-awesome-icon :icon="['fab', 'twitter']" />
            تويتر | X
          </label>
          <input v-model="shop.twitter" />
        </div>
        <div class="form-input">
          <label>
            <font-awesome-icon :icon="['fab', 'tiktok']" />
            تيك توك
          </label>
          <input v-model="shop.tiktok" />
        </div>
        <button type="submit" class="btn" :disabled="shop.loading">
          <Loader v-if="shop.loading" />
          <span v-else>تعديل</span>
        </button>
      </form>
    </div>

    <input type="file" ref="file" id="new_logo" @change="preview" />
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  middleware: "manager",
  data() {
    return {
      new_logo: "",
      user: { ...this.$auth.user, new_pass: "", loading: false },
      shop: { ...this.$shop, loading: false },
    };
  },
  head: () => ({
    title: "الإعدادات",
  }),
  methods: {
    ...mapActions({
      setAlert: "alert/add",
    }),
    async check_pass() {
      const pass = prompt("كلمة المرور الحاليه");
      if (pass) {
        const ok = await this.$axios.$post("/users/check_pass", {
          password: pass,
          _id: this.user._id,
        });

        if (!ok) this.setAlert({ text: "كلمة المرور خطأ", error: true });
        return ok;
      }
    },
    async update_user() {
      if (await this.check_pass()) {
        this.user.loading = true;
        this.$axios.$post("/users/update", this.user).then(() => {
          this.setAlert({ text: "تم تعديل البيانات" });
          this.user.loading = false;
        });
      }
    },
    async update_shop() {
      if (await this.check_pass()) {
        this.shop.loading = true;

        if (this.new_logo) {
          if (Array.from(this.$refs.file.files).length) {
            let formdata = new FormData();
            formdata.append(
              "file",
              this.$refs.file.files[0],
              this.$refs.file.files[0].filename
            );

            this.$axios
              .$post("/trueemit/save_file/", formdata, {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              })
              .then(({ file }) => {
                this.shop.logo = file;
                this.update__shop();
              });
          }
        } else {
          this.update__shop();
        }
      }
    },
    update__shop() {
      this.$axios.$post("/trueemit/update_client", this.shop).then(() => {
        this.setAlert({ text: "تم تعديل البيانات" });
        this.shop.loading = false;
        this.user.new_pass = "";
      });
    },
    preview() {
      const [file] = this.$refs.file.files;
      if (file) this.new_logo = URL.createObjectURL(file);
    },
  },
};
</script>

<style lang="scss" scoped>
img {
  width: 100px;
}

.form-input > label {
  display: flex;
  gap: 0.5em;
  padding: 0 0.5em;
}
.d-flex {
  display: flex;
  gap: 2em;
  justify-content: center;
  align-items: center;

  > .btn {
    opacity: 0;
    color: white;
    transition: 0.3s;
  }

  &:hover .btn {
    opacity: 1;
  }
}

[type="file"] {
  opacity: 0;
  user-select: none;
  pointer-events: none;
}
</style>
