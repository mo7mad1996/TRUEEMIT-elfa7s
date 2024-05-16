<template>
  <div @input="update" @change="update" @click.stop="update">
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

export default {
  middleware: "engineer",
  props: ["cars", "socket"],
  head: () => ({ title: " فحص السياره" }),
  data: () => ({ car: {}, loading: false }),
  methods: {
    ...mapActions({ setAlert: "alert/add" }),
    update() {
      if (this.car.saved) {
        this.car.saved = false;
        this.car.updated = true;
      }

      this.socket.emit("update car", this.car);
    },
    save() {
      if (this.car.payment !== "أجل") delete this.car.client;
      console.log("this.car", this.car);

      if (!(this.car.payment == "أجل" && this.car.client == undefined)) {
        if (!this.car.saved && !this.car.updated) {
          this.loading = true;

          this.$axios
            .$post("/cars/save", this.car)
            .then((res) => {
              this.car.saved = res; // res == true
              this.setAlert({ text: "تم الحفظ" });
              this.car.updated = false;

              this.socket.emit("update car", this.car);
              this.socket.emit(
                "update cars",
                this.cars.map((car) =>
                  this.car._id == car._id ? this.car : car
                )
              );
              this.socket.emit("update database");
            })
            .finally(() => (this.loading = false));
        } else {
          if (this.car.updated) {
            this.$axios.$post("/cars/update", this.car).then(() => {
              this.car.saved = true;
              this.car.updated = false;
              this.setAlert({ text: "تم الحفظ" });

              this.car = this.car;

              this.socket.emit("update car", this.car);
              this.cars.map((car) =>
                this.car._id == car._id ? this.car : car
              );
            });
          } else {
            open("/print/" + this.$route.params.id);
          }
        }
      } else {
        this.setAlert({ text: "يجب اضافة عميل", error: true });
      }
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

      this.socket.on("update car", (car) => (this.car = car));
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
</style>
