<template>
  <div class="login-form-container">
    <form @submit.prevent="submit">
      <div class="text-center title">
        <h3>بيانات المحل</h3>
      </div>

      <div class="form-input">
        <input id="name" required v-model="name" />
        <label for="name">
          <font-awesome-icon icon="fa-solid fa-store" />
          اسم المحل</label
        >
      </div>
      <div class="form-input">
        <input id="phone" required v-model="phone" />
        <label for="phone">
          <font-awesome-icon icon="fa-solid fa-phone" />
          ارقام المحل</label
        >
      </div>
      <div class="form-input" for="logo">
        <input id="logo" type="file" @change="setPreview" ref="logo" />
        <img :src="preview" class="preview" v-if="preview" />
        <img src="/placeholder-image.png" class="placeholder" v-else />
        <label for="logo">
          <font-awesome-icon icon="fa-solid fa-font-awesome" />
          اللوجو</label
        >
      </div>
      <button class="btn d-block" type="submit" :disabled="submited">
        <Loader v-if="submited" />
        <span v-else>تسجيل</span>
      </button>
    </form>
  </div>
</template>

<script>
import Loader from "@/components/loader";

export default {
  name: "Third",
  data() {
    return {
      preview: "",
      submited: false,
      logo: "",
      name: "",
      phone: "",
    };
  },
  components: {
    Loader,
  },
  methods: {
    setPreview() {
      const [file] = this.$refs.logo.files;
      if (file) {
        this.preview = URL.createObjectURL(file);
      }
    },
    submit() {
      this.submited = true;

      if (Array.from(this.$refs.logo.files).length) {
        let formdata = new FormData();
        formdata.append(
          "file",
          this.$refs.logo.files[0],
          this.$refs.logo.files[0].filename
        );

        this.$axios
          .$post("/trueemit/save_file/", formdata, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then(({ file }) => {
            this.logo = file;
          });
      } else {
        this.logo = "/logo/trueemit.png";
      }
    },
  },
  watch: {
    logo() {
      const { name, phone, logo } = this;
      this.$emit("submit", { name, phone, logo });
    },
  },
};
</script>

<style lang="scss" scoped>
.placeholder {
  display: block;
  margin: auto;
  height: 30px;
  filter: contrast(0) brightness(200%);
  pointer-events: none;
}

.preview {
  height: 100px;
  margin: auto;
  display: block;
}
</style>
