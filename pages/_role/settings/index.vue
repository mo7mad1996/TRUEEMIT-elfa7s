<template>
  <div class="container">
    <section v-if="['manager'].includes($auth.user.job)">
      <h3>المؤسسة</h3>

      <form class="simple_form" @submit.prevent="update__shop">
        <label
          class="form-input flex flex-col gap-2 group cursor-pointer"
          v-if="['manager'].includes($auth.user.job)"
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
                  new_logo ||
                  $auth.user.logo ||
                  $shop.logo ||
                  '/logo/trueemit.png'
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
            <font-awesome-icon :icon="['fas', 'map-location-dot']" />
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
    </section>

    <hr v-if="['manager'].includes($auth.user.job)" />

    <section>
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
              class="shadow p-4 rounded bg-white flex flex-col gap-2 h-fit relative group/section"
            >
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

              <div class="flex-1">
                <ul
                  class="text-slate-400 flex items-center justify-between group hover:bg-neutral-50 p-2"
                  v-for="(item, n) in section.items"
                >
                  <li class="flex flex-col gap-2">
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

              <form
                class="flex gap-2 border-t pt-2"
                @submit.prevent.stop="
                  section.items = [
                    ...section.items,
                    { name: section.append, name_en: section.append_en },
                  ];
                  section.append = '';
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

    <hr v-if="['manager'].includes($auth.user.job)" />

    <section v-if="['manager'].includes($auth.user.job)">
      <h3>حذف السيارات القديمه</h3>

      <form class="simple_form" @submit.prevent="deleteCars">
        <div class="form-input">
          <label>
            <font-awesome-icon icon="fa-solid fa-lock" />
            حذف ما قبل
          </label>
          <input v-model="cars.date" type="date" />
        </div>

        <button type="submit" class="btn red" :disabled="cars.loading">
          <Loader v-if="cars.loading" />
          <span v-else>خذف</span>
        </button>
      </form>
    </section>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  data() {
    return {
      new_logo: "",
      user: { ...this.$auth.user, new_pass: "", loading: false },
      shop: { ...this.$shop, loading: false },
      cars: { date: "", loading: false },
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
      return this.$axios.$post("/users/check_pass", {
        password: pass || "",
        _id: this.user._id,
      });
    },
    async update_user() {
      try {
        const ok = await this.check_pass();
        if (!ok) return this.setAlert({ text: "كلمة المرور خطأ", error: true });

        // if user has logo
        if (["exclusive"].includes(this.$auth.user.job))
          if (this.new_logo) {
            const { file } = await this.saveFile(`users/${this.user._id}`);

            this.user.logo = file;
            this.$auth.user.logo = file;
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
    async saveFile(path = null) {
      try {
        if (Array.from(this.$refs.file.files).length) {
          let formData = new FormData();
          formData.append(
            "file",
            this.$refs.file.files[0],
            this.$refs.file.files[0].filename
          );

          if (path) formData.append("path", path);

          return this.$axios.$post("/cars-exclusive/append_image", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
        }
      } catch (err) {
        console.error(err);
      }
    },
    async update__shop() {
      try {
        this.shop.loading = true;
        const ok = await this.check_pass();
        if (!ok) return this.setAlert({ text: "كلمة المرور خطأ", error: true });

        if (this.new_logo) {
          const { file } = await this.saveFile();
          this.shop.logo = file;
        }

        await this.$axios.$post("/trueemit/update_client", this.shop);
        await this.$shop.refresh();

        this.setAlert({ text: "تم تعديل البيانات" });
      } catch (err) {
        console.log(err);
      } finally {
        this.shop.loading = false;
      }
    },
    preview() {
      const [file] = this.$refs.file.files;
      if (file) this.new_logo = URL.createObjectURL(file);
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

hr {
  margin: 1em;
  border-radius: 4px;
  border: 1px solid #738fa6;
}
</style>
