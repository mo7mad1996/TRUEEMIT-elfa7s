<template>
  <div class="container">
    <div v-if="$auth.user.job === 'manager'" class="settings-tabs" role="tablist" aria-label="الإعدادات">
      <button
        v-for="tab in settingsTabs"
        :id="`settings-tab-${tab.id}`"
        :key="tab.id"
        ref="settingsTabs"
        type="button"
        role="tab"
        :aria-selected="activeTab === tab.id"
        :aria-controls="`settings-panel-${tab.id}`"
        :tabindex="activeTab === tab.id ? 0 : -1"
        @click="activeTab = tab.id"
        @keydown="onTabKeydown($event, tab.id)"
      >
        <font-awesome-icon :icon="tab.icon" class="settings-tab-icon" aria-hidden="true" />
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <section
      v-if="$auth.user.job === 'manager'"
      v-show="activeTab === 'shop'"
      id="settings-panel-shop"
      role="tabpanel"
      aria-labelledby="settings-tab-shop"
    >
      <h3>المؤسسة</h3>

      <form class="simple_form" @submit.prevent="updateShop">
        <fieldset :disabled="shopEdit.loading">
          <div class="form-input">
            <label>
              <font-awesome-icon icon="fa-solid fa-font-awesome" />
              اللوجو والشعار
            </label>
            <div class="d-flex">
              <div class="relative rounded-lg border border-dashed p-1 shadow">
                <button
                  type="button"
                  class="shop-logo-button group"
                  aria-label="اختيار شعار المركز"
                  @click="$refs.shopLogoInput.click()"
                >
                  <img
                    :src="shopLogoPreview || shopEdit.logo || '/logo/trueemit.png'"
                    alt="شعار المركز"
                    class="h-20 bg-neutral-200 w-auto rounded-lg object-contain"
                  />
                  <span class="shop-logo-edit" aria-hidden="true">
                    <font-awesome-icon :icon="['fas', 'camera']" />
                  </span>
                </button>
                <button
                  v-if="shopLogoFile"
                  type="button"
                  class="absolute top-0 left-0 rounded-full bg-red-50 text-red-700 flex items-center justify-center p-2"
                  title="إلغاء اختيار الشعار"
                  aria-label="إلغاء اختيار الشعار"
                  @click="clearShopLogoFile"
                >
                  <font-awesome-icon :icon="['fas', 'xmark']" />
                </button>
              </div>
            </div>
            <input
              id="shop-logo"
              ref="shopLogoInput"
              type="file"
              accept="image/*"
              hidden
              @change="selectShopLogo"
            />
          </div>
          <div class="form-input">
            <label for="shop-logo-url">
              <font-awesome-icon :icon="['fas', 'link']" />
              رابط اللوجو
            </label>
            <input id="shop-logo-url" v-model="shopEdit.logo" dir="ltr" placeholder="https://example.com/logo.png" />
            <small class="text-xs text-neutral-500 px-2">
              الصق رابط الصورة أو اختر ملفاً من الأعلى (الملف المرفوع يستبدل الرابط)
            </small>
          </div>
          <div class="form-input">
            <label for="shop-name"><font-awesome-icon icon="fa-solid fa-store" /> اسم المؤسسه</label>
            <input id="shop-name" v-model="shopEdit.name" required />
          </div>
          <div class="form-input">
            <label for="shop-phone"><font-awesome-icon icon="fa-solid fa-phone" /> أرقام الهواتف</label>
            <input id="shop-phone" v-model="shopEdit.phone" />
          </div>
          <div class="form-input">
            <label for="shop-cr"><font-awesome-icon :icon="['fas', 'building-shield']" /> سجل تجاري</label>
            <input id="shop-cr" v-model="shopEdit.cr" />
          </div>
          <div class="form-input">
            <label for="shop-address"><font-awesome-icon :icon="['fas', 'map-location-dot']" /> العنوان</label>
            <input id="shop-address" v-model="shopEdit.address" />
          </div>
          <div class="form-input">
            <label for="shop-website"><font-awesome-icon :icon="['fas', 'globe']" /> الموقع الإلكتروني</label>
            <input id="shop-website" v-model="shopEdit.website_url" />
          </div>
          <div class="form-input">
            <label for="shop-twitter"><font-awesome-icon :icon="['fab', 'twitter']" /> تويتر | X</label>
            <input id="shop-twitter" v-model="shopEdit.twitter" />
          </div>
          <div class="form-input">
            <label for="shop-tiktok"><font-awesome-icon :icon="['fab', 'tiktok']" /> تيك توك</label>
            <input id="shop-tiktok" v-model="shopEdit.tiktok" />
          </div>

          <button type="submit" class="btn" :disabled="shopEdit.loading">
            <Loader v-if="shopEdit.loading" />
            <template v-else>
              <font-awesome-icon icon="fa-solid fa-save" />
              <span>حفظ بيانات المؤسسة</span>
            </template>
          </button>
        </fieldset>
      </form>
    </section>

    <section
      v-show="$auth.user.job !== 'manager' || activeTab === 'user'"
      id="settings-panel-user"
      :role="$auth.user.job === 'manager' ? 'tabpanel' : null"
      :aria-labelledby="$auth.user.job === 'manager' ? 'settings-tab-user' : null"
    >
      <h3>المستخدم</h3>

      <form class="simple_form" @submit.prevent="update_user">
        <label
          class="form-input flex flex-col gap-2 group cursor-pointer"
          v-if="['exclusive'].includes($auth.user.job)"
        >
          <h3 class="m-0">
            <font-awesome-icon icon="fa-solid fa-font-awesome" />
            اللوجو والشعار
          </h3>
          <div class="d-flex">
            <div class="relative rounded-lg border border-dashed p-1 shadow">
              <img
                class="h-20 bg-neutral-200 w-auto rounded-lg"
                :src="
                  new_logo || $auth.user.logo || $shop.logo || '~/trueemit.png'
                "
              />

              <button
                class="absolute top-0 left-0 rounded-full bg-red-50 text-red-700 flex items-center justify-center p-2"
                @click.prevent="new_logo = ''"
                v-if="new_logo"
                title="حذف"
              >
                <font-awesome-icon :icon="['fas', 'xmark']" />
              </button>
              <input
                type="file"
                ref="file"
                class="hidden"
                @change="preview"
                accept="image/*"
              />
              <label
                class="w-full bg-neutral-50/80 absolute bottom-0 left-0 hidden group-hover:flex items-center justify-center p-2"
                title="تعديل"
              >
                <font-awesome-icon :icon="['fas', 'camera']" />
              </label>
            </div>
          </div>
        </label>

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

        <div class="form-input" v-if="['exclusive'].includes($auth.user.job)">
          <label>
            <font-awesome-icon icon="fa-solid fa-key" />
            مفتاح الـ API
          </label>
          <input v-model="user.api_key" />
        </div>

        <!-- sections -->
        <section v-if="['exclusive'].includes($auth.user.job)" class="">
          <h3>الاقسام</h3>

          <!-- no data -->
          <div
            v-if="!user.sections.length"
            class="py-12 text-center text-gray-400 flex gap-4 justify-center flex-col"
          >
            <font-awesome-icon
              icon="fa-solid fa-folder-open"
              class="text-3xl"
            />

            <span class="text-xs"> ما من اقسام </span>
          </div>

          <!-- section data -->
          <main class="grid md:grid-cols-3 gap-4">
            <div
              v-for="(section, n) in user.sections"
              :key="n"
              class="shadow p-4 rounded bg-white flex flex-col gap-2 relative group/section"
            >
              <!-- title -->
              <button
                @click="
                  user.sections = user.sections.filter((i, a) => {
                    return n != a;
                  })
                "
                type="button"
                class="absolute left-1 top-1 rounded bg-red-100 p-1 aspect-square group-hover/section:grid place-content-center hidden cursor-pointer"
              >
                <font-awesome-icon
                  icon="fa-solid fa-close"
                  class="text-red-600"
                />
              </button>

              <input
                v-model="section.title"
                class="px-4 py-2 border rounded-md !outline-none block w-full"
                placeholder="اسم القسم."
              />

              <input
                v-model="section.title_en"
                class="px-4 py-2 border rounded-md !outline-none block w-full"
                placeholder="اسم القسم (EN)."
              />

              <!-- list -->
              <div class="flex-1 max-h-96 overflow-auto">
                <ul
                  class="text-slate-400 flex items-center justify-between group hover:bg-neutral-50 p-2"
                  v-for="(item, n) in section.items"
                >
                  <li class="flex flex-col gap-2 border-r pr-4">
                    <div>
                      {{ item.name }}
                    </div>

                    <div>
                      {{ item.name_en }}
                    </div>
                  </li>

                  <button
                    @click="
                      section.items = section.items.filter((i, a) => {
                        return n != a;
                      })
                    "
                    type="button"
                    class="rounded bg-red-100 p-1 aspect-square group-hover:grid place-content-center hidden cursor-pointer"
                  >
                    <font-awesome-icon
                      icon="fa-solid fa-close"
                      class="text-red-600"
                    />
                  </button>
                </ul>
              </div>

              <!-- add list item -->
              <form
                class="flex gap-2 border-t pt-2"
                @submit.prevent.stop="
                  section.items = [
                    ...section.items,
                    { name: section.append, name_en: section.append_en },
                  ];
                  section.append = '';
                  section.append_en = '';
                "
              >
                <div class="flex-1">
                  <input
                    placeholder="اسم العنصر..."
                    v-model="section.append"
                    class="px-4 py-2 border rounded-md !outline-none block w-full"
                  />
                  <input
                    placeholder="اسم العنصر... (EN)"
                    v-model="section.append_en"
                    class="px-4 py-2 border rounded-md !outline-none block w-full mt-2"
                  />
                </div>
                <button class="btn !bg-transparent !text-blue-700">
                  <font-awesome-icon icon="fa-solid fa-plus" />
                </button>
              </form>
            </div>
          </main>

          <!-- add a new section -->
          <button
            class="w-full border border-blue-600 rounded py-3 mt-6 text-blue-600 hover:bg-blue-600 hover:text-white"
            type="button"
            @click="
              user.sections = [
                ...user.sections,
                { title: '', items: [], append: '' },
              ]
            "
          >
            <font-awesome-icon
              icon="fa-solid fa-file-circle-plus"
              class="mx-2"
            />

            أضف قسم
          </button>
        </section>

        <button type="submit" class="btn" :disabled="user.loading">
          <Loader v-if="user.loading" />
          <template v-else>
            <font-awesome-icon icon="fa-solid fa-save" />
            <span>حفظ</span>
          </template>
        </button>
      </form>
    </section>

    <section
      v-if="$auth.user.job === 'manager'"
      v-show="activeTab === 'cars'"
      id="settings-panel-cars"
      role="tabpanel"
      aria-labelledby="settings-tab-cars"
    >
      <h3>حذف السيارات القديمه</h3>

      <form class="simple_form" @submit.prevent="deleteCars">
        <div class="form-input">
          <label>
            <font-awesome-icon icon="fa-solid fa-lock" />
            حذف ما قبل
          </label>
          <DatePicker v-model="cars.date" />
        </div>

        <button type="submit" class="btn red" :disabled="cars.loading">
          <Loader v-if="cars.loading" />
          <span v-else>خذف</span>
        </button>
      </form>
    </section>

    <!-- confirm password modal -->
    <div
      v-if="pwd.show"
      class="overlay grid place-items-center"
      style="z-index: 60"
      @click="cancelPassword"
    >
      <form
        class="bg-white rounded-xl p-6 w-[90%] max-w-sm shadow-lg flex flex-col gap-4"
        @click.stop
        @submit.prevent="confirmPassword"
      >
        <h3 class="text-center m-0">
          <font-awesome-icon icon="fa-solid fa-lock" />
          تأكيد كلمة المرور
        </h3>

        <div class="flex flex-col gap-2">
          <label class="flex items-center gap-2 text-sm text-neutral-500">
            <font-awesome-icon icon="fa-solid fa-lock" />
            كلمة المرور الحاليه
          </label>
          <input
            ref="pwdInput"
            v-model="pwd.value"
            type="password"
            autocomplete="current-password"
            placeholder="••••••••"
            @keyup.esc="cancelPassword"
            class="w-full border border-neutral-300 rounded-lg px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div class="flex gap-2">
          <button type="submit" class="btn flex-1">تأكيد</button>
          <button
            type="button"
            class="btn flex-1 !bg-neutral-200 !text-neutral-700 !border-neutral-200"
            @click="cancelPassword"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  data() {
    return {
      activeTab: "shop",
      settingsTabs: [
        { id: "shop", label: "المؤسسة", icon: "fa-solid fa-store" },
        { id: "user", label: "المستخدم", icon: "fa-solid fa-user" },
        { id: "cars", label: "حذف السيارات القديمة", icon: "fa-solid fa-car" },
      ],
      new_logo: "",
      user: { ...this.$auth.user, new_pass: "", loading: false },
      shopEdit: { ...this.$shop, loading: false },
      shopLogoFile: null,
      shopLogoPreview: "",
      uploadedShopLogo: "",
      unusedShopLogos: [],
      cars: { date: "", loading: false },
      pwd: { show: false, value: "", resolve: null },
    };
  },
  head: () => ({
    title: "الإعدادات",
  }),
  beforeDestroy() {
    if (this.shopLogoPreview) URL.revokeObjectURL(this.shopLogoPreview);
  },
  methods: {
    ...mapActions({
      setAlert: "alert/add",
    }),
    onTabKeydown(event, tabId) {
      const current = this.settingsTabs.findIndex((tab) => tab.id === tabId);
      let next;
      if (event.key === "ArrowLeft") next = (current + 1) % this.settingsTabs.length;
      else if (event.key === "ArrowRight") next = (current - 1 + this.settingsTabs.length) % this.settingsTabs.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = this.settingsTabs.length - 1;
      else return;
      event.preventDefault();
      this.activeTab = this.settingsTabs[next].id;
      this.$nextTick(() => this.$refs.settingsTabs[next].focus());
    },
    askPassword() {
      return new Promise((resolve) => {
        this.pwd.value = "";
        this.pwd.resolve = resolve;
        this.pwd.show = true;
        this.$nextTick(() => this.$refs.pwdInput && this.$refs.pwdInput.focus());
      });
    },
    confirmPassword() {
      const resolve = this.pwd.resolve;
      this.pwd.show = false;
      this.pwd.resolve = null;
      if (resolve) resolve(this.pwd.value);
    },
    cancelPassword() {
      const resolve = this.pwd.resolve;
      this.pwd.show = false;
      this.pwd.resolve = null;
      if (resolve) resolve(null);
    },
    async check_pass() {
      const pass = await this.askPassword();
      if (pass === null) return null;
      return this.$axios.$post("/users/check_pass", {
        password: pass || "",
        _id: this.user._id,
      });
    },
    async update_user() {
      try {
        const ok = await this.check_pass();
        if (!ok) return this.setAlert({ text: "كلمة المرور خطأ", error: true });

        // if user has logo — new_logo is already a base64 data url (see
        // preview), stored inline on the user document, no upload needed
        if (["exclusive"].includes(this.$auth.user.job))
          if (this.new_logo) {
            this.user.logo = this.new_logo;
            this.$auth.user.logo = this.new_logo;
          }

        // update user
        this.user.loading = true;
        await this.$axios.$post("/users/update", this.user);
        this.user.new_pass = "";

        this.setAlert({ text: "تم تعديل البيانات" });
      } catch (err) {
        this.setAlert({
          error: true,
          text: (err.response?.data?.codeName || err.message) + " خطأ ",
        });
        console.error(err.message);
      } finally {
        this.user.loading = false;
      }
    },
    selectShopLogo(event) {
      const file = event.target.files[0];
      if (!file) return;
      if (this.shopLogoPreview) URL.revokeObjectURL(this.shopLogoPreview);
      if (this.uploadedShopLogo) this.unusedShopLogos.push(this.uploadedShopLogo);
      this.uploadedShopLogo = "";
      this.shopLogoFile = file;
      this.shopLogoPreview = URL.createObjectURL(file);
    },
    clearShopLogoFile() {
      if (this.shopLogoPreview) URL.revokeObjectURL(this.shopLogoPreview);
      if (this.uploadedShopLogo) this.unusedShopLogos.push(this.uploadedShopLogo);
      this.shopLogoFile = null;
      this.shopLogoPreview = "";
      this.uploadedShopLogo = "";
      this.$refs.shopLogoInput.value = "";
    },
    async updateShop() {
      this.shopEdit.loading = true;
      try {
        const ok = await this.check_pass();
        if (ok === null) return;
        if (!ok) {
          this.setAlert({ text: "كلمة المرور خطأ", error: true });
          return;
        }
        const previousLogo = this.$shop.logo;
        if (this.shopLogoFile && !this.uploadedShopLogo) {
          const formData = new FormData();
          formData.append("file", this.shopLogoFile, this.shopLogoFile.name);
          const uploaded = await this.$axios.$post(
            "https://api.trueemit.dev/cars/images",
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );
          if (!uploaded || typeof uploaded.url !== "string" || !uploaded.url) {
            throw new Error("لم يُرجع الخادم رابط الشعار، حاول مرة أخرى");
          }
          this.uploadedShopLogo = uploaded.url;
        }
        const fields = {
          name: this.shopEdit.name,
          logo: this.uploadedShopLogo || this.shopEdit.logo,
          phone: this.shopEdit.phone,
          cr: this.shopEdit.cr,
          address: this.shopEdit.address,
          website_url: this.shopEdit.website_url,
          tiktok: this.shopEdit.tiktok,
          twitter: this.shopEdit.twitter,
        };
        const response = await this.$axios.$patch("/trueemit/shop", fields);
        Object.assign(this.$shop, response.shop);
        Object.assign(this.shopEdit, response.shop);
        if (this.shopLogoPreview) URL.revokeObjectURL(this.shopLogoPreview);
        this.shopLogoPreview = "";
        this.shopLogoFile = null;
        this.uploadedShopLogo = "";
        this.$refs.shopLogoInput.value = "";

        const oldLogos = [...new Set([
          ...this.unusedShopLogos,
          previousLogo !== fields.logo ? previousLogo : "",
        ])].filter((url) => url && url !== fields.logo);
        this.unusedShopLogos = [];
        const failedDeletes = [];
        for (const url of oldLogos) {
          try {
            await this.$axios.$delete("https://api.trueemit.dev/cars/images", {
              data: { url },
              headers: { "Content-Type": "application/json" },
            });
          } catch (err) {
            console.error(err);
            failedDeletes.push(url);
          }
        }
        this.unusedShopLogos = failedDeletes;
        this.setAlert(failedDeletes.length
          ? { text: "تم حفظ بيانات المؤسسة، لكن تعذر حذف الشعار السابق. حاول الحفظ مرة أخرى", error: true }
          : { text: "تم تعديل بيانات المؤسسة" });
      } catch (err) {
        this.setAlert({
          error: true,
          text: err.response?.data?.error || err.message,
        });
        console.error(err);
      } finally {
        this.shopEdit.loading = false;
      }
    },
    // Keep the user's small logo inline as a base64 data URL.
    preview() {
      const [file] = this.$refs.file.files;
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        this.new_logo = reader.result;
      };
      reader.readAsDataURL(file);
    },
    async deleteCars() {
      try {
        const ok = await this.check_pass();
        if (!ok) return this.setAlert({ text: "كلمة المرور خطأ", error: true });

        await this.$axios.$delete("/cars/delete", { params: this.cars });
        this.setAlert({ text: "تم حذف السيارات" });
      } catch (err) {
        console.error(err);
      } finally {
        this.cars.loading = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.settings-tabs {
  display: flex;
  gap: 0.25em;
  overflow-x: auto;
  border-bottom: 1px solid #cbd5e1;

  button {
    display: flex;
    align-items: center;
    gap: 0.75em;
    flex: none;
    min-height: 44px;
    padding: 0.7em 1em;
    color: #475569;
    border-bottom: 2px solid transparent;
    text-align: start;

    &:hover {
      background: #f1f5f9;
    }

    &[aria-selected="true"] {
      color: #1d4ed8;
      border-bottom-color: #1d4ed8;
      font-weight: 700;
    }

    &:focus-visible {
      outline: 2px solid #1d4ed8;
      outline-offset: -2px;
    }
  }
}

.settings-tab-icon {
  width: 1em;
  flex: none;
}

.shop-logo-button {
  display: block;
  position: relative;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid #1d4ed8;
    outline-offset: 2px;
  }

  &:hover .shop-logo-edit,
  &:focus-visible .shop-logo-edit {
    display: flex;
  }
}

.shop-logo-edit {
  display: none;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  justify-content: center;
  padding: 0.5em;
  background: rgba(250, 250, 250, 0.9);
}

@media (hover: none) {
  .shop-logo-edit {
    display: flex;
  }
}

section {
  margin: 1em 0;
  padding: 1em;
  border-radius: 0.4em;
  @apply bg-neutral-50 shadow;

  h3 {
    @apply mb-8 ps-1 opacity-60 border-s font-bold;
  }

  img {
    width: 100px;
  }

  .form-input {
    margin-bottom: 1.2em;

    > label {
      margin-bottom: 0.8em;
      display: flex;
      gap: 0.5em;
      padding: 0 0.5em;

      @apply items-center;
    }
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

  [type="submit"] {
    width: 100%;
  }

  [type="file"] {
    opacity: 0;
    user-select: none;
    width: 0;
    height: 0;
    position: absolute;
    pointer-events: none;
  }
}
</style>
