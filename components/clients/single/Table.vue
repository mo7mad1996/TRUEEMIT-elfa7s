<template>
  <div>
    <div class="controllers">
      <div class="controller" v-if="monthes.length">
        <label for="month">شهر:</label>
        <select v-model="month" id="month">
          <option v-for="m in monthes" :key="m" :value="m">
            {{ m }}
          </option>
        </select>
      </div>

      <div class="details">
        <div>
          <span> المطلوب </span>

          <span class="blue">
            {{ total.toFixed(2) }}
          </span>
          ر.س.
        </div>
        <div>
          <span> المدفوع </span>
          <span class="blue">
            {{ payed.toFixed(2) }}
          </span>

          ر.س.
        </div>
        <div>
          <span> باقي </span>
          <span class="blue">
            {{ (total - payed).toFixed(2) }}
          </span>
          ر.س.
        </div>
      </div>
    </div>

    <div class="table-container" v-if="month">
      <table>
        <thead>
          <tr>
            <td>تم الدفع</td>
            <td v-for="(colomn, n) in colomns" :key="n">
              {{ colomn.ar }}
            </td>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in data_to_show"
            :key="item._id"
            :class="item.item_type"
          >
            <td>
              <font-awesome-icon
                v-if="item.is_payed"
                :icon="['fas', 'check']"
              />
            </td>
            <template v-if="item.item_type === 'car'">
              <td
                v-for="colomn in colomns"
                :key="colomn.en"
                :title="colomn.ar"
                @click="$router.push('/manager/cars/' + item._id)"
              >
                {{ view(item, colomn) }}
              </td>
            </template>

            <template v-else>
              <td title="قيمة السداد">{{ item.value.toFixed(2) }}</td>
              <td title="التاريخ">
                {{ $moment(item.createdAt).format("YYYY/MM/DD -  HH:mm a") }}
              </td>
              <td title="ملاحظات" :colspan="colomns.length - 2">
                {{ item.note }}
              </td>
            </template>
          </tr>
          <tr>
            <td title="سابق حساب">{{ start.toFixed(2) }}</td>
            <td title="رصيد البداية" :colspan="colomns.length - 1">
              رصيد بداية
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="nodata">
      <font-awesome-icon :icon="['far', 'folder-open']" class="icon" />
      <h3>ما من بيانات بعد.</h3>
    </div>
  </div>
</template>

<script>
export default {
  name: "Table",
  props: ["data", "start"],
  data: () => ({
    month: "",
    colomns: [
      { ar: "القيمة", en: "cost" },
      { ar: "التاريخ", en: "date" },
      { ar: "اسم المندوب", en: "representative" },
      { ar: "نوع السيارة", en: "type" },
      { ar: "رقم اللوحه", en: "car_id" },
    ],
  }),
  methods: {
    view(item, colomn) {
      switch (colomn.en) {
        case "date":
          return this.$moment(item.date).format("YYYY/MM/DD -  HH:mm a");

        case "cost":
          return item[colomn.en].toFixed(2);

        default:
          return item[colomn.en];
      }
    },
  },
  computed: {
    monthes() {
      return [...new Set(this.cars_data.map((e) => e.month))];
    },
    data_to_show() {
      return this.cars_data.filter((e) => e.month == this.month);
    },

    payed() {
      return this.data_to_show.reduce((a, b) => (a += b.value || 0), 0) * -1;
    },
    total() {
      return this.data_to_show.reduce((a, b) => (a += b.cost || 0), 0);
    },

    cars_data() {
      return this.data.map((o) => ({
        ...o,
        month: this.$moment(o.date || o.createdAt).format("MMMM YYYY"),
      }));
    },
  },
  mounted() {
    this.month = this.monthes[0] || "";
  },
};
</script>

<style lang="scss" scoped>
.controllers {
  display: flex;
  gap: 2em;
  flex-wrap: wrap;

  .controller {
    font-size: 0.9em;
    cursor: pointer;
    user-select: none;
    border: 1px solid #ddd;
    border-inline-end-width: 5px;
    color: #998d8d;
    gap: 0.5em;
    align-items: center;
    display: flex;
    background: white;

    box-shadow: rgba(0, 0, 0, 0.45) 0px 25px 20px -20px;
    padding: 0 1em;

    &:hover {
      border-color: #1f1cb0;
      color: black;
    }

    select {
      border: none;
      background: none;
      font-size: inherit;
      font-family: inherit;
      cursor: pointer;
      padding: 1em 0;

      span {
        padding: 0 0.5em;
      }
    }
  }

  .details {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    flex: 1;

    > div {
      padding: 0.5em;
      color: #555;
    }
  }
}

.blue {
  color: #1f1cb0;
  padding: 0 0.7em;
}

.icon {
  font-size: 100px;
  color: brown;
}

.pay {
  background: #e9b7c166 !important;
}

.nodata {
  min-height: 50vh;
  text-align: center;
  background: #d6e1d770;
  border-radius: 20px;
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2em;

  .icon {
    font-size: 5cm;
    color: #1f1cb0;
  }
  h3 {
    color: #8c8c8c;
  }
}
</style>
