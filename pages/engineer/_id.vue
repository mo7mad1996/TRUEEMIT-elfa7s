<template>
  <div v-if="car">
    <EngineerHeader :car="car" />
    <FirstPage :car="car" v-if="car?.service != 'محركات'" />
    <SecondPage :car="car" />

    <div class="container sticky bottom-4">
      <button :disabled="loading" @click="save" class="btn d-block mb-2 mt-4">
        <Loader v-show="loading" />

        <div v-show="!loading">
          <span v-if="!car.updated && car.saved">
            طباعه
            <font-awesome-icon :icon="['fas', 'print']" />
          </span>

          <span v-else>
            حفظ
            <font-awesome-icon :icon="['fas', 'floppy-disk']" />
          </span>
        </div>
      </button>
      <button
        v-if="car.saved || !car.updated"
        @click="$router.push('/engineer')"
        class="btn d-block mt-2 red"
      >
        رجوع
        <font-awesome-icon :icon="['fas', 'arrow-left']" />
      </button>
    </div>
  </div>
  <div v-else class="text-center font-bold pt-12">
    جاري تحميل بيانات السيارة
  </div>
</template>

<script>
import EngineerHeader from "@/components/engineer/header";
import SecondPage from "@/components/engineer/SecondPage";
import FirstPage from "@/components/engineer/First_page";

import { mapActions } from "vuex";
let skipCheck = true;

export default {
  middleware: "engineer",
  props: ["cars", "socket", "updateCars"],
  head: () => ({ title: " فحص السياره" }),
  data: () => ({ car: null, loading: false }),
  methods: {
    ...mapActions({ setAlert: "alert/add" }),

    update() {
      if (!skipCheck) this.car.updated = true;
      skipCheck = false;
    },

    save() {
      if (!this.car.payment || !this.car.cost) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return this.setAlert({ text: "تاكد من بيانات الدفع", error: true });
      }

      // print
      if (!this.car.updated && this.car.saved)
        return open("/print/" + this.$route.params.id);

      // remove client
      if (this.car.payment !== "أجل") delete this.car.client;

      // check about the payment and client
      if (this.car.payment == "أجل" && this.car.client == undefined)
        return this.setAlert({ text: "يجب اضافة عميل", error: true });

      // update the car with cost_disabled => false
      this.car.cost_disabled = true;

      this.loading = true;
      let url = "/cars/update";
      if (!this.car.saved) url = "/cars/save";

      this.$axios
        .$post(url, this.car)
        .then((res) => {
          this.car.saved = true;
          this.car.updated = false;
          skipCheck = true;

          this.setAlert({ text: "تم الحفظ" });

          // socket
          this.socket.emit("save-car");
        })
        .catch((err) => console.error(err))
        .finally(() => (this.loading = false));
    },

    getCar() {
      // wait if no cars
      if (!this.cars) return;
      if (!this.cars.length) return this.$router.push("/");

      this.car = this.cars.filter((car) => car._id == this.$route.params.id)[0];

      // if no car go home
      if (!this.car) this.$router.push("/");
    },
  },
  mounted() {
    this.getCar();

    if (this.car) this.socket.emit("join-room", this.car._id);

    // socket
    this.socket.on("delete-car", () =>
      this.setAlert({ text: "شخص ما حذف السيارة", error: true })
    );
  },
  watch: {
    cars() {
      this.getCar();
    },
    car: {
      handler(c, l) {
        if (l) this.update();
      },
      deep: true,
    },
  },
  components: {
    EngineerHeader,
    SecondPage,
    FirstPage,
  },
};
</script>

<style lang="scss" scoped>
.red {
  background: rgb(186, 38, 38);

  &:hover,
  &:focus {
    background: rgb(227, 48, 48);
  }
}

.fixed {
  position: fixed;
  padding: 2em;
  top: 0;
  backdrop-filter: blur(5px);
}
</style>
