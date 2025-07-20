<template>
  <div class="container">
    <h2>
      العملاء:

      <button class="btn" title="إضافة عميل جديد" @click="toggle_model">
        <span>أضف عميل</span>
        <font-awesome-icon :icon="['far', 'handshake']" />
      </button>
    </h2>

    <section class="filters">
      <input
        v-for="(filter, n) in filters"
        :key="n"
        v-model="filter.value"
        placeholder="بحث..."
        @input="setClients"
      />

      <button
        class="btn"
        @click="filters.push({ value: '' })"
        title="أضف بحث جديد"
      >
        <font-awesome-icon icon="fa-solid fa-magnifying-glass-plus" />
        <!-- <font-awesome-icon icon="fa-solid fa-plus" /> -->
      </button>
    </section>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th></th>
            <td v-for="column in columns" :key="column.en">
              {{ column.ar }}
            </td>
          </tr>
        </thead>
        <tbody>
          <tr
            :key="client._id"
            v-for="(client, n) in clients"
            @click="$router.push('/manager/clients/' + client._id)"
          >
            <td>
              {{ n + 1 }}
            </td>
            <td v-for="column in columns" :key="column.en">
              {{ client[column.en] }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Add_client_modle
      v-if="is_model_open"
      @close="toggle_model"
      @client="add_client"
    />
  </div>
</template>

<script>
// components
import Add_client_modle from "@/components/clients/addClient";

export default {
  async asyncData({ $axios }) {
    const DB_clients = await $axios.$get("/clients");

    return { DB_clients };
  },
  middleware: "manager",
  head: () => ({
    title: "العملاء",
  }),
  data: () => {
    return {
      is_model_open: false,
      columns: [{ en: "name", ar: "الاسم" }],
      clients: [],
      filters: [{ value: "" }],
    };
  },
  methods: {
    toggle_model() {
      this.is_model_open = !this.is_model_open;
    },
    add_client(client) {
      this.DB_clients.push(client);
    },

    setClients() {
      this.clients = this.$filter(
        this.DB_clients,
        this.filters,
        Object.keys(this.DB_clients[0] || {}).filter(
          (el) => !this.columns.map((el) => el.en).includes(el)
        )
      );
    },
  },
  mounted() {
    this.clients = this.DB_clients;
  },
  components: { Add_client_modle },
};
</script>

<style lang="scss" scoped>
h2 {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
