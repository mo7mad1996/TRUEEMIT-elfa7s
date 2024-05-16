<template>
  <div class="table-container">
    <table>
      <thead>
        <tr>
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
          <td title="رصيد البداية" :colspan="colomns.length - 1">رصيد بداية</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: "Table",
  props: ["data_to_show", "start"],
  data: () => ({
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
};
</script>

<style lang="scss" scoped>
.icon {
  font-size: 100px;
  color: brown;
}

.pay {
  background: #ffc0cb99 !important;
}
</style>
