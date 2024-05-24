<template>
  <div class="container">
    <header>
      <h1>{{ client.name }}</h1>

      <div class="cost">
        <span class="num"> {{ cost }} </span>
        <sub class="distinction"> ر.س </sub>
      </div>

      <button class="btn" title="إضافة مبلغ" @click="toggle_model">
        <span>مبلغ جديد</span>
        <font-awesome-icon :icon="['fas', 'sack-dollar']" />
      </button>
    </header>

    <Table
      :data_to_show="data_to_show.filter((a) => a.is_payed != true)"
      :start="client.start"
    />

    <Add_pay_modle
      v-if="is_model_open"
      @close="toggle_model"
      @client="update_client"
      :id="$route.params.id"
    />
  </div>
</template>

<script>
// components
import Table from "@/components/clients/single/Table";
import Add_pay_modle from "@/components/clients/Add_pay";

export default {
  middleware: "manager",
  async asyncData({ $axios, params }) {
    const cars = await $axios.$get("/clients/" + params.id + "/cars");
    const client = await $axios.$get("/clients/" + params.id);

    return { client, cars };
  },
  data() {
    return {
      is_model_open: false,
    };
  },
  computed: {
    data_to_show() {
      const pay = this.client.pay.map((e) => ({ ...e, item_type: "pay" }));
      const cars = this.cars.map((e) => ({ ...e, item_type: "car" }));
      return [...pay, ...cars].sort((a, b) => {
        const d1 = new Date(a.createdAt);
        const d2 = new Date(b.createdAt);

        return d2 - d1;
      });
    },
    cost() {
      return this.data_to_show
        .reduce(
          (a, b) => a + (+b.cost || +b.value || 0),
          this.client.start || 0
        )
        .toFixed(2);
    },
  },
  mounted() {
    if (this.cost == 0) {
      const carsIds = this.cars.map((e) => e._id);
      const client = this.client;

      this.$axios.$post("/clients/update/", {
        client,
        carsIds,
      });
    }
  },
  methods: {
    toggle_model() {
      this.is_model_open = !this.is_model_open;
    },
    update_client(d) {
      this.client = d;
    },
  },
  components: {
    Add_pay_modle,
    Table,
  },
};
</script>

<style lang="scss" scoped>
header {
  display: flex;
  align-items: center;
  gap: 1em;
  justify-content: space-between;

  .cost {
    margin-inline-end: auto;
    .num {
      font-size: 20px;
      color: red;
    }
    .distinction {
      color: #333;
    }
  }
}

table button {
  color: red;
  font-size: 16px;
  width: 2em;
  background: none;
  border: none;
  cursor: pointer;
  transition: 0.3s;
  border-radius: 50%;
  aspect-ratio: 1;

  &:hover,
  &:focus {
    border: 1px solid red;
    background: rgba(253, 80, 80, 0.351);
  }
}
</style>
