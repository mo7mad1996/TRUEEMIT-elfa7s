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
        @input="onSearch"
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

    <p v-if="!total" class="text-center opacity-60 mt-8">
      لم يقم هذا المستخدم بحفظ اي سياره بعد.
    </p>

    <div class="buttons" v-if="pages > 1">
      <button @click="page--" :disabled="page < 2" class="btn">
        <font-awesome-icon :icon="['fas', 'forward']" />
        السابق
      </button>
      <span title="رقم الصفحه">{{ page }}</span>
      <button @click="page++" :disabled="page >= pages" class="btn">
        التالي
        <font-awesome-icon :icon="['fas', 'backward']" />
      </button>
    </div>

    <div class="per-page" v-if="total" title="عدد السيارات في الصفحة">
      <span>لكل صفحة</span>
      <select v-model.number="limit">
        <option :value="10">10</option>
        <option :value="20">20</option>
        <option :value="50">50</option>
        <option :value="100">100</option>
      </select>
    </div>
  </div>
</template>

<script>
export default {
  async asyncData({ params, $axios, $moment, error }) {
    const owners = await $axios.$get("/cars-exclusive/owners");
    const owner = owners.find((user) => String(user._id) == params.id);

    if (!owner) return error({ statusCode: 404, message: "المستخدم غير موجود" });

    // the server does the filtering + paging; the first page is loaded here
    const res = await $axios.$get("/cars-exclusive", {
      params: { user: params.id, page: 1, limit: 20 },
    });

    const cars = res.data.map((car) => ({
      ...car,
      date: $moment(car.date).format("DD/MM/YYYY"),
    }));

    return { owner, cars, total: res.total, pages: res.pages };
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
      cars: [],
      total: 0,
      pages: 1,
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
    // pull the current page for this owner with the active search terms
    async fetchCars() {
      const res = await this.$axios.$get("/cars-exclusive", {
        params: {
          user: this.$route.params.id,
          page: this.page,
          limit: this.limit,
          search: this.filters.map((f) => f.value).filter((v) => v && v.trim()),
        },
      });

      this.cars = res.data.map((car) => ({
        ...car,
        date: this.$moment(car.date).format("DD/MM/YYYY"),
      }));
      this.total = res.total;
      this.pages = res.pages;
    },
    // debounce typing so we don't query on every keystroke
    onSearch() {
      clearTimeout(this._searchTimer);
      this._searchTimer = setTimeout(() => {
        if (this.page !== 1) this.page = 1; // the watcher refetches
        else this.fetchCars();
      }, 300);
    },
  },
  watch: {
    page() {
      this.fetchCars();
    },
    // a new page size starts from the first page
    limit() {
      if (this.page !== 1) this.page = 1; // the watcher refetches
      else this.fetchCars();
    },
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

.per-page {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 1.5em;
  font-size: 0.9em;
  color: #555;

  select {
    padding: 8px 10px;
    border: 1px solid #e3e3ea;
    border-radius: 8px;
    background: #fff;
    font: inherit;
    cursor: pointer;
  }
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
