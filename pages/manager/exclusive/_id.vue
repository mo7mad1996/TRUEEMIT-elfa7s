<template>
  <div class="container">
    <h2>
      سيارات: {{ owner.name }}
      <nuxt-link to="/manager/exclusive" class="btn">
        رجوع
        <font-awesome-icon :icon="['fas', 'arrow-left']" />
      </nuxt-link>
    </h2>

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
            <th v-for="column in columns" :key="column.en">{{ column.ar }}</th>
          </tr>
        </thead>
        <tbody>
          <client-only>
            <tr
              v-for="car in cars"
              :key="car._id"
              @click="$router.push('/manager/exclusive/car/' + car._id)"
              title="فتح السياره للتعديل"
            >
              <td v-for="column in columns" :key="column.en" :class="column.en">
                {{ car[column.en] || "-" }}
              </td>
            </tr>
          </client-only>
        </tbody>
      </table>
    </div>

    <p v-if="!middleware_cars.length" class="text-center opacity-60 mt-8">
      لم يقم هذا المستخدم بحفظ اي سياره بعد.
    </p>

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
  async asyncData({ params, $axios, $moment, error }) {
    const owners = await $axios.$get("/cars-exclusive/owners");
    const owner = owners.find((user) => String(user._id) == params.id);

    if (!owner) return error({ statusCode: 404, message: "المستخدم غير موجود" });

    const cars = await $axios.$get("/cars-exclusive", {
      params: { user: params.id },
    });

    const DB_cars = cars.map((car) => ({
      ...car,
      date: $moment(car.date).format("DD/MM/YYYY"),
    }));

    return { owner, DB_cars };
  },
  middleware: "manager",
  head() {
    return { title: "سيارات " + this.owner.name };
  },
  data() {
    return {
      limit: 20,
      page: 1,
      filters: [{ value: "" }],
      middleware_cars: [],
      columns: [
        { en: "vin_no", ar: "رقم الشاصى" },
        { en: "car_id", ar: "رقم اللوحه" },
        { en: "type", ar: "نوع السياره" },
        { en: "payment", ar: "حالة السداد" },
        { en: "cost", ar: "سعر التقرير" },
        { en: "date", ar: "التاريخ" },
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
          (el) => !this.columns.map((el) => el.en).includes(el)
        )
      );
    },
  },
  computed: {
    cars() {
      return [...this.middleware_cars].splice(
        this.limit * (this.page - 1),
        this.limit
      );
    },
  },
  mounted() {
    this.middleware_cars = Array.from(this.DB_cars);
  },
};
</script>

<style lang="scss" scoped>
h2 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1em;
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
