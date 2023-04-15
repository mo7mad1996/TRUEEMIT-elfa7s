<template>
  <div>
    <button @click.stop="remove" class="btn d-block container red">
      <Loader v-if="loading" />
      <span v-else>
        حذف <font-awesome-icon :icon="['fas', 'trash-can']" />
      </span>
    </button>

    <div @change="saved = false" @input="saved = false" class="mt-4">
      <EngineerHeader :car="car" />
      <FristPage :car="car" v-if="car?.service != 'محركات'" />
      <SecoundPage :car="car" />

      <div class="container">
        <button
          class="d-block btn"
          @click="print"
          v-if="saved"
          :disabled="loading"
        >
          <Loader v-if="loading" />
          <span v-else>
            طباعه
            <font-awesome-icon :icon="['fas', 'print']" />
          </span>
        </button>
        <button class="d-block mt-4 mb-4 btn" @click="update">
          <span>
            تعديل
            <font-awesome-icon :icon="['fas', 'pen-to-square']" />
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import EngineerHeader from "@/components/engineer/header";
import SecoundPage from "@/components/engineer/secound_page";
import FristPage from "@/components/engineer/frist_page";

import { mapActions } from "vuex";

export default {
  middleware: "manager",

  async asyncData({ $axios, params }) {
    const car = await $axios.$get("/cars/" + params.id),
      saved = true,
      loading = false;

    return { car, saved, loading };
  },
  components: { EngineerHeader, FristPage, SecoundPage },
  methods: {
    ...mapActions({
      setAlert: "alert/add",
    }),
    update() {
      this.saved = false;
      this.loading = true;

      this.$axios.$post("/cars/update", this.car).then(() => {
        this.saved = true;
        this.loading = false;
        this.setAlert({ text: "تم التعديل" });
      });
    },
    print() {
      window.open("/print/" + this.$route.params.id);
    },
    remove() {
      if (confirm("هل انت متأكد من الحذف؟")) {
        this.loading = true;

        this.$axios.$delete("/cars/" + this.$route.params.id).then((_) => {
          this.setAlert({ text: "تم الحذف" });
          this.$router.back();
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.red {
  background: rgb(212, 42, 42);

  &:hover,
  &:focus {
    background: rgb(243, 80, 80);
  }
}
</style>
