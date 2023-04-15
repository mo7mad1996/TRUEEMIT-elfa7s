<template>
  <div class="container simple_form">
    <div class="form-input">
      <label>
        <font-awesome-icon :icon="['fas', 'computer']" />
        فحص الكمبيوتر</label
      >
      <textarea v-model="car.computer"></textarea>
    </div>
    <div class="form-input">
      <label>
        <font-awesome-icon :icon="['fas', 'gears']" />
        الفحص الميداني</label
      >
      <textarea v-model="car.ground"></textarea>
    </div>
    <div class="form-input">
      <label>
        <font-awesome-icon :icon="['fas', 'wrench']" />
        فحص ميكانيكا</label
      >
      <textarea v-model="car.mechanical"></textarea>
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
