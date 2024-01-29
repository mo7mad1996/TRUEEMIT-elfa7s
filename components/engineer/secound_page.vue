<template>
  <div class="container simple_form">
    <div class="form-input">
      <label>
        <font-awesome-icon :icon="['fas', 'computer']" />
        فحص الكمبيوتر</label
      >
      <textarea v-model="car.computer" data-max="7"></textarea>
      <!-- @keydown="$check_max_lines" -->
    </div>
    <div class="form-input">
      <label>
        <font-awesome-icon :icon="['fas', 'gears']" />
        فحص الاكسسورات</label
      >
      <textarea v-model="car.accessories" data-max="7"></textarea>
      <!-- @keydown="$check_max_lines" -->
    </div>
    <div class="form-input">
      <label>
        <font-awesome-icon :icon="['fas', 'car']" />
        الفحص الميداني</label
      >
      <textarea v-model="car.ground" data-max="5"></textarea>
      <!-- @keydown="$check_max_lines" -->
    </div>
    <div class="form-input">
      <label>
        <font-awesome-icon :icon="['fas', 'wrench']" />
        {{
          car.service == "صيانة"
            ? "فحص القطع الاستهلاكيه والتهريبات"
            : "فحص ميكانيكا"
        }}</label
      >
      <textarea
        v-model="car.mechanical"
        data-max="30"
        @keydown="$check_max_lines"
      ></textarea>
    </div>
  </div>
</template>

<script>
export default {
  props: ["car"],
  name: "SecoundPage",
};
</script>

<style lang="scss" scoped></style>
