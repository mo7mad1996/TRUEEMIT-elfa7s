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
      <div class="form-input">
        <input id="cr" v-model="cr" />
        <label for="cr">
          <font-awesome-icon :icon="['fas', 'building-shield']" />
          سجل تجاري</label
        >
      </div>
      <div class="form-input">
        <input id="address" v-model="address" />
        <label for="address">
          <font-awesome-icon :icon="['fass', 'map-location-dot']" />
          العنوان</label
        >
      </div>
      <div class="form-input">
        <input id="website_url" v-model="website_url" />
        <label for="website_url">
          <font-awesome-icon :icon="['fas', 'globe']" />
          الموقع الإلكتروني</label
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
      cr: "",
      address: "",
      website_url: "",
    };
  },
  components: {
    Loader,
  },
  methods: {
    async setPreview() {
      const [file] = this.$refs.logo.files;
      if (file) this.preview = await this.toBase64(file);
    },
    // read the file as a base64 data url (preview / offline fallback)
    toBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },
    async submit() {
      this.submited = true;

      const [file] = this.$refs.logo.files;
      this.logo = file ? await this.uploadLogo(file) : "/logo/trueemit.png";
    },
    // upload the logo to {branch}/logos (plugins/upload.js). if the external
    // api can't be reached, keep it inline as a base64 data url instead
    async uploadLogo(file) {
      try {
        const { url } = await this.$upload(file, { logo: true });
        if (url) return url;
      } catch (err) {
        console.error("logo upload failed, keeping it inline:", err);
      }
      return this.toBase64(file);
    },
  },
  watch: {
    logo() {
      this.$emit("submit", this);
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
