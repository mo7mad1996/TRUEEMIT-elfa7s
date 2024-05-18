<template>
  <div @input="update" @change="update" @click.stop="update">
    <!-- <div class="fixed">
      {{ car.saved ? "" : "not" }} saved <br />
      {{ car.updated ? "" : "not" }} updated <br />
    </div> -->
    <EngineerHeader :car="car" />
    <FristPage :car="car" v-if="car?.service != 'محركات'" />
    <SecoundPage :car="car" />

    <div class="container">
      <button :disabled="loading" @click="save" class="btn d-block mb-2">
        <Loader v-show="loading" />

        <div v-show="!loading">
          <span v-if="car?.saved">
            طباعه
            <font-awesome-icon :icon="['fas', 'print']"
          /></span>
          <span v-else>
            حفظ
            <font-awesome-icon :icon="['fas', 'floppy-disk']" />
          </span>
        </div>
      </button>
      <button
        v-if="car?.saved || car?.updated"
        @click="$router.push('/engineer')"
        class="btn d-block mt-2 red"
      >
        رجوع
        <font-awesome-icon :icon="['fas', 'arrow-left']" />
      </button>
    </div>
  </div>
</template>

<script>
import EngineerHeader from "@/components/engineer/header";
import SecoundPage from "@/components/engineer/secound_page";
import FristPage from "@/components/engineer/frist_page";

import { mapActions } from "vuex";
import _ from "lodash";

export default {
  middleware: "engineer",
  props: ["cars", "socket"],
  head: () => ({ title: " فحص السياره" }),
  data: () => ({ car: {}, loading: false }),
  methods: {
    ...mapActions({ setAlert: "alert/add" }),

    update() {
      if (this.car.saved) {
        this.car = { ...this.car, saved: false, updated: true };
      }

      this.socket.emit("update car", this.car);
    },

    save() {
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
      let url = "/cars/update";
      if (!this.car.saved && !this.car.updated) {
        url = "/cars/save";
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
  },

  mounted() {
    this.car = this.cars.filter((car) => car._id == this.$route.params.id)[0];

    if (!this.car) this.$router.push("/engineer");

    if (this.socket) {
      this.socket.emit("join room", this.$route.params.id);

      this.socket.on("leave room", (_) => {
        this.$router.push("/engineer");

        this.setAlert({ error: true, text: "شخص ما حذف السياره" });
      });

      this.socket.on("update car", (car) => (this.car = { ...car }));
    }
  },
  components: {
    EngineerHeader,
    SecoundPage,
    FristPage,
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
