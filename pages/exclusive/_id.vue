<template>
  <div
    @input="update"
    @change="update"
    @click.stop="update"
    v-if="cars && car && car._id"
  >
    <EngineerHeader :car="car" />
    <FirstPage :car="car" v-if="car?.service != 'محركات'" />
    <secondPage :car="car" />
    <Files :car="car" />
    <Sections :car="car" />

    <div class="container sticky bottom-4">
      <button :disabled="loading" @click="save" class="btn d-block mb-2 mt-4">
        <Loader v-show="loading" />

        <div v-show="!loading">
          <span v-if="car?.saved">
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
        v-if="car?.saved || car?.updated"
        @click="$router.push('/exclusive')"
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
import Files from "@/components/engineer/Files";
import Sections from "@/components/engineer/Sections";

import { mapActions } from "vuex";

export default {
  middleware: "exclusive",
  props: ["cars", "socket", "updateCars"],
  head: () => ({ title: " فحص السياره" }),
  data: () => ({ car: null, loading: false }),
  methods: {
    ...mapActions({ setAlert: "alert/add" }),

    update() {
      if (this.car.saved) {
        this.car = { ...this.car, saved: false, updated: true };
      }

      this.socket.emit("update car", this.car);
      this.$emit("updateCars", this.car);
    },

    save() {
      if (!this.car.payment || !this.car.cost) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return this.setAlert({ text: "تاكد من البيانات", error: true });
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
      this.car = { ...this.car, cost_disabled: true };

      this.loading = true;
      let url = "/cars-exclusive/update";
      if (!this.car.saved && !this.car.updated) {
        url = "/cars-exclusive/save";
      }

      this.$axios
        .$post(url, this.car)
        .then((res) => {
          const newCar = { ...this.car, saved: true, updated: false };
          this.car = newCar;
          this.socket.emit("update car", newCar);
          this.setAlert({ text: "تم الحفظ" });
          this.socket.emit(
            "update cars",
            this.cars.map((car) =>
              this.car._id == car._id ? { ...newCar } : car
            )
          );

          // update manager page
          this.socket.emit("update database");
        })

        .finally(() => (this.loading = false));
    },

    getCar() {
      // wait if no cars
      if (!this.cars) return;
      if (!this.cars.length) return this.$router.push("/exclusive");

      this.car = this.cars.filter((car) => car._id == this.$route.params.id)[0];

      // if no car go home
      if (!this.car) this.$router.push("/exclusive");

      // if no sections
      if (this.car.sections.length == 0)
        this.car.sections = this.$auth.user.sections;

      // socket
      this.socket.emit("join room", this.$route.params.id);
      this.socket.on("leave room", (_) => {
        this.$router.push("/exclusive");
        this.setAlert({ error: true, text: "شخص ما حذف السياره" });
      });
      this.socket.on("update car", (car) => (this.car = { ...car }));
    },
  },
  mounted() {
    this.getCar();
  },
  watch: {
    cars() {
      this.getCar();
    },
  },
  components: {
    EngineerHeader,
    SecondPage,
    FirstPage,
    Files,
    Sections,
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
