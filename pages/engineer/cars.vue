<template>
  <div class="container">
    <section class="filters">
      <input
        v-for="(filter, n) in filters"
        :key="n"
        v-model="filter.value"
        placeholder="بحث..."
        @input="setCars"
      />

      <button
        class="btn"
        @click="filters.push({ value: '' })"
        title="أضف بحث جديد"
      >
        <font-awesome-icon icon="fa-solid fa-magnifying-glass-plus" />
      </button>
    </section>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th v-for="colomn in colomns" :key="colomn.en">{{ colomn.ar }}</th>
          </tr>
        </thead>
        <tbody>
          <client-only>
            <tr
              v-for="car in cars"
              :key="car._id"
              @click="$router.push(`/print/${car._id}?no_print`)"
            >
              <td v-for="colomn in colomns" :key="colomn.en" :class="colomn.en">
                {{ car[colomn.en] }}
              </td>
            </tr>
          </client-only>
        </tbody>
      </table>
    </div>

    <div class="buttons" v-if="middleware_cars.length >= limit">
      <button @click="page--" :disabled="page < 2" class="btn">
        <font-awesome-icon :icon="['fas', 'forward']" />
        السابق
      </button>
      <span title="رقم الصفحه">{{ page }}</span>
      <button @click="page++" :disabled="cars.length < limit" class="btn">
        التالي
        <font-awesome-icon :icon="['fas', 'backward']" />
      </button>
    </div>
  </div>
</template>

<script>
export default {
  async asyncData({ $axios }) {
    const DB_cars = await $axios.$get(`/cars`);

    return { DB_cars };
  },
  props: ["socket"],
  middleware: "engineer",
  head: () => ({ title: "السيارات" }),
  data() {
    return {
      limit: 20,
      page: 1,
      filters: [{ value: "" }],
      middleware_cars: [],
      colomns: [
        { en: "vin_no", ar: "رقم الشاصى" },
        { en: "car_id", ar: "رقم اللوحه" },
        { en: "type", ar: "نوع السياره" },
      ],
    };
  },

  methods: {
    setCars() {
      this.middleware_cars = this.$filter(
        this.DB_cars,
        this.filters,
        // blocked
        Object.keys(this.DB_cars[0] || {}).filter(
          (el) => !this.colomns.map((el) => el.en).includes(el)
        )
      );
    },
  },
  computed: {
    cars() {
      const cars = [...this.middleware_cars].splice(
        this.limit * (this.page - 1),
        this.limit
      );

      return cars;
    },
  },
  mounted() {
    this.middleware_cars = Array.from(this.DB_cars);
  },
};
</script>

<style lang="scss" scoped>
thead tr th {
  width: calc(100% / 3);
}

.cost {
  color: #3a78d7;
}

.buttons {
  display: flex;
  gap: 2em;
  justify-content: center;
  align-items: center;

  span {
    border-radius: 5px;
    padding: 5px 1em;
    border: 1px solid rgb(128, 221, 51);
    background: #23cb313e;
  }
}
</style>
