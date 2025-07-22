<template>
  <div
    class="page"
    :class="!(car.service == 'محركات' || car.service == 'صيانة') && 'break'"
  >
    <PrintHeader :car="car" :lang="lang" />

    <div class="page2">
      <ul v-if="car.service == 'صيانة'">
        <li v-if="lang === 'ar'">
          - الفحص عباره عن فحص القطع الاستهلاكيه التي بحاجة غيار + تهريبات
          الزيوت .
        </li>
        <li v-else>
          - Inspection covers consumable parts that need replacement + oil
          leaks.
        </li>

        <li v-if="lang === 'ar'">
          - لم يتم فحص الاجزاء المفكوكه للمكينه + القير - لم يتم فحص الشواصي .
        </li>
        <li v-else>
          - Engine and transmission disassembled parts were not inspected +
          chassis not inspected.
        </li>

        <li v-if="lang === 'ar'">
          - لم يتم فحص البدي - لم يتم فحص الكمبيوتر + الارباقات .
        </li>
        <li v-else>
          - Body not inspected + computer and airbags not inspected.
        </li>
      </ul>

      <!-- الكمبيوتر -->
      <div
        class="section"
        v-if="car.service != 'صيانة'"
        :class="{
          one: this.$auth.user.job != 'exclusive',
        }"
      >
        <h4>
          <span v-if="lang == 'ar'"> فحص الكمبيوتر </span>
          <span v-else> Computer scan </span>
          <font-awesome-icon :icon="['fas', 'computer']" />
          <span class="squire"></span>
        </h4>
        <p v-html="$nltobr(car.computer)" v-if="car.computer"></p>
      </div>

      <!-- الاكسسورات -->
      <div
        class="section"
        :class="{
          five: this.$auth.user.job != 'exclusive',
        }"
        v-if="
          car.service == 'VIP' || car.service == 'محركات'
          // || car.service == 'شامل'
        "
      >
        <h4>
          <span v-if="lang == 'ar'"> فحص الاكسسورات </span>
          <span v-else> Check accessories</span>
          <font-awesome-icon :icon="['fas', 'gears']" />
          <span class="squire"></span>
        </h4>
        <p v-if="car.accessories" v-html="$nltobr(car.accessories)"></p>
      </div>

      <!-- الميداني -->
      <div class="section three" v-if="this.$auth.user.job != 'exclusive'">
        <h4>
          <span v-if="lang == 'ar'"> الفحص الميداني </span>
          <span v-else> Field examination</span>
          <font-awesome-icon :icon="['fas', 'car']" />
          <span class="squire"></span>
        </h4>
        <p v-if="car.ground" v-html="$nltobr(car.ground)"></p>
      </div>

      <!-- الميكانيكا -->
      <section class="section two" v-if="this.$auth.user.job != 'exclusive'">
        <div class="service">
          <h4>
            <span v-if="lang == 'ar'">
              {{
                car.service == "صيانة"
                  ? "فحص القطع الاستهلاكيه والتهريبات"
                  : "فحص ميكانيكا"
              }}
            </span>
            <span v-else>
              {{
                car.service === "صيانة"
                  ? "Consumables and leak inspection"
                  : "Mechanical inspection"
              }}
            </span>
            <font-awesome-icon :icon="['fas', 'wrench']" />
            <span class="squire"></span>
          </h4>
          <p v-html="$nltobr(car.mechanical)" v-if="car.mechanical"></p>
        </div>
      </section>
    </div>

    <PrintFooter />
  </div>
</template>

<script>
import PrintHeader from "@/components/print/header";
import PrintFooter from "@/components/print/footer";

export default {
  name: "Page2",
  props: ["car", "lang"],
  components: { PrintHeader, PrintFooter },
};
</script>

<style lang="scss" scoped>
.page {
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &.break {
    page-break-before: always;
  }
}

.page2 {
  display: grid;
  grid-template-rows: 1fr 1fr 1fr;
  grid-template-columns: repeat(2, 1fr);
  flex: 1;
  overflow: hidden;
  gap: 10px;

  // صيانه
  ul {
    padding: 0;

    li {
      border-right: 7px solid #2c2c2c;
      background: #ddd;
      padding: 0.5em;
      font-size: 0.8em;
      margin-top: 10px;
      list-style: none;
    }
  }

  h4 {
    color: rgb(0, 0, 0);
    gap: 0.4em;
    display: flex;
    align-items: center;
    margin: 0.3em 0 0;

    .squire {
      border: 2px solid rgb(0, 0, 0);
      display: inline-block;
      height: 1.5em;
      aspect-ratio: 1 / 1;
      margin-right: auto;
      border-radius: 4px;
    }
  }
  .one {
    grid-column-start: 1;
    grid-column-end: 2;
    grid-row-start: 1;
    grid-row-end: 2;
  }
  .two {
    grid-column-start: 2;
    grid-column-end: 3;
    grid-row-start: 1;
    grid-row-end: 4;
    position: relative;
    &::after {
      transform: translateY(-50%);
    }
  }
  .three {
    grid-column-start: 1;
    grid-column-end: 2;
    grid-row-start: 3;
    grid-row-end: 4;
    position: relative;
    &::after {
      // content: "";
      border-top: 1px solid #000;
      position: absolute;
      width: 100%;
      top: -5px;
      left: 0;
    }
  }
  .five {
    grid-column-start: 1;
    grid-column-end: 2;
    grid-row-start: 2;
    grid-row-end: 3;
  }
}
</style>
