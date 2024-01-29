<template>
  <div
    class="page"
    :class="!(car.service == 'محركات' || car.service == 'صيانة') && 'break'"
  >
    <PrintHeader :car="car" />

    <div class="page2">
      <section class="right">
        <ul v-if="car.service == 'صيانة'">
          <li>
            - الفحص عباره عن فحص القطع الاستهلاكيه التي بحاجة غيار + تهريبات
            الزيوت .
          </li>
          <li>
            - لم يتم فحص الاجزاء المفكوكه للمكينه + القير - لم يتم فحص الشواصي .
          </li>
          <li>- لم يتم فحص البدي - لم يتم فحص الكمبيوتر + الارباقات .</li>
        </ul>

        <!-- الكمبيوتر -->
        <div class="service" v-if="car.service != 'صيانة'">
          <h4>
            فحص الكمبيوتر
            <font-awesome-icon :icon="['fas', 'computer']" />
            <span class="squire"></span>
          </h4>
          <p v-html="$nltobr(car.computer)" v-if="car.computer"></p>
        </div>

        <!-- الاكسسورات -->
        <div
          class="service"
          v-if="car.service == 'VIP' || car.service == 'محركات'"
        >
          <h4>
            فحص الاكسسورات
            <font-awesome-icon :icon="['fas', 'gears']" />
            <span class="squire"></span>
          </h4>
          <p v-html="$nltobr(car.accessories)" v-if="car.computer"></p>
        </div>

        <!-- الميداني -->
        <div class="service">
          <h4>
            الفحص الميداني
            <font-awesome-icon :icon="['fas', 'car']" />
            <span class="squire"></span>
          </h4>
          <p v-if="car.ground" v-html="$nltobr(car.ground)"></p>
        </div>
      </section>

      <!-- الميكانيكا -->
      <section class="left">
        <div class="service">
          <h4>
            {{
              car.service == "صيانة"
                ? "فحص القطع الاستهلاكيه والتهريبات"
                : "فحص ميكانيكا"
            }}
            <font-awesome-icon :icon="['fas', 'wrench']" />
            <span class="squire"></span>
          </h4>
          <p v-html="$nltobr(car.mechanical)" v-if="car.mechanical"></p>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import PrintHeader from "@/components/print/header";

export default {
  name: "Page2",
  props: ["car"],
  components: { PrintHeader },
  mounted() {
    // console.log(this.car);
  },
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
  --gap: 10px;
  overflow: hidden;
  display: flex;
  gap: var(--gap);

  > section {
    display: flex;
    gap: var(--gap);
    flex: 1;
    flex-direction: column;
  }

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

  .service {
    h4 {
      color: #000;
      gap: 0.4em;
      display: flex;
      align-items: center;
      margin: 0.3em 0;

      .squire {
        border: 2px solid #000;
        display: inline-block;
        height: 1.5em;
        aspect-ratio: 1 / 1;
        margin-right: auto;
        border-radius: 4px;
      }
    }
  }
  .left {
    position: relative;

    &::after {
      content: "";
      width: 1px;
      background: linear-gradient(to top, transparent, #000, transparent);
      position: absolute;
      height: 70%;
      right: -5px;
      top: 50%;
      transform: translateY(-50%);
    }
  }
}
</style>
