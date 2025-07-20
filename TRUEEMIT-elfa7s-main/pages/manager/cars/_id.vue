<template>
  <div>
    <!-- <button @click.stop="remove" class="btn d-block container red">
      <Loader v-if="loading" />
      <span v-else>
        حذف <font-awesome-icon :icon="['fas', 'trash-can']" />
      </span>
    </button> -->

    <div @change="saved = false" @input="saved = false" class="mt-4">
      <EngineerHeader :car="car" />
      <First_page :car="car" v-if="car?.service != 'محركات'" />
      <SecondPage :car="car" />

      <div class="container">
        <button
          class="d-block btn mt-4"
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
        <button class="d-block mt-4 mb-4 btn" @click="update" v-if="!saved">
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
import SecondPage from "@/components/engineer/SecondPage";
import First_page from "@/components/engineer/First_page";

import { mapActions } from "vuex";

export default {
  middleware: "manager",

  async asyncData({ $axios, params }) {
    const car = await $axios.$get("/cars/" + params.id),
      saved = true,
      loading = false;

    if (car.cost) car.cost_disabled = true;

    return { car, saved, loading };
  },
  head: () => ({ title: "تفاصيل السياره" }),
  components: { EngineerHeader, First_page, SecondPage },
  methods: {
    ...mapActions({
      setAlert: "alert/add",
    }),
    update() {
      if (this.car.payment !== "أجل") delete this.car.client;

      this.car = { ...this.car, cost_disabled: true };
      if (this.car.payment !== "أجل") {
        // delete this.car.client;
        this.car.client = null;
      }

      if (!(this.car.payment == "أجل" && !this.car.client)) {
        this.saved = false;
        this.loading = true;

        this.$axios.$post("/cars/update", this.car).then(() => {
          this.saved = true;
          this.loading = false;
          this.setAlert({ text: "تم التعديل" });
        });
      } else {
        this.setAlert({ text: "يجب اضافة عميل", error: true });
      }
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
