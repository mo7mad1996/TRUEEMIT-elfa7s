<template>
  <div class="container simple_form">
    <div class="form-input" v-if="car.service != 'فحص أساسي'">
      <label>
        <font-awesome-icon :icon="['fas', 'computer']" />
        فحص الكمبيوتر</label
      >
      <textarea v-model="car.computer" data-max="7"></textarea>
      <!-- @keydown="$check_max_lines" -->
    </div>

    <!-- ملف فحص الكمبيوتر — يُرفع على الـ api ويظهر كزر في التقرير -->
    <div class="form-input" v-if="car.service != 'فحص أساسي'">
      <label>
        <font-awesome-icon :icon="['fas', 'file-pdf']" />
        فحص الكمبيوتر PDF</label
      >

      <FileDropAble
        :id="car._id"
        accept="application/pdf,.pdf"
        loading-text="جاري رفع الملف..."
        @input="setComputerPdf"
        @delete="clearComputerPdf"
      >
        <template v-slot="{ removeFile, deleting }">
          <ul v-if="car.computer_pdf" class="file-list">
            <li class="file-item">
              <a
                :href="car.computer_pdf"
                target="_blank"
                rel="noopener"
                class="file-name pdf-link"
                @click.stop
              >
                <font-awesome-icon :icon="['fas', 'file-pdf']" />
                عرض فحص الكمبيوتر
              </a>

              <button
                @click.prevent="removeFile(car.computer_pdf)"
                class="remove-btn aspect-square"
                :disabled="deleting.includes(car.computer_pdf)"
              >
                <font-awesome-icon
                  :icon="
                    deleting.includes(car.computer_pdf)
                      ? ['fas', 'spinner']
                      : ['fas', 'close']
                  "
                  :spin="deleting.includes(car.computer_pdf)"
                  class="text-red-400"
                />
              </button>
            </li>
          </ul>
        </template>
      </FileDropAble>
    </div>

    <div class="form-input" v-if="car.service != 'فحص أساسي'">
      <label>
        <font-awesome-icon :icon="['fas', 'gears']" />
        فحص الاكسسورات</label
      >
      <textarea v-model="car.accessories" data-max="7"></textarea>
      <!-- @keydown="$check_max_lines" -->
    </div>
    <div class="form-input" v-if="viewJob != 'exclusive'">
      <label>
        <font-awesome-icon :icon="['fas', 'car']" />
        الفحص الميداني</label
      >
      <textarea v-model="car.ground" data-max="5"></textarea>
      <!-- @keydown="$check_max_lines" -->
    </div>
    <div class="form-input" v-if="viewJob != 'exclusive'">
      <label>
        <font-awesome-icon :icon="['fas', 'wrench']" />
        {{
          car.service == "صيانة"
            ? "فحص القطع الاستهلاكيه والتهريبات"
            : "فحص ميكانيكا"
        }}</label
      >
      <textarea v-model="car.mechanical" data-max="30"></textarea>
      <!-- @keydown="$check_max_lines" -->
    </div>
  </div>
</template>

<script>
export default {
  props: ["car"],
  name: "SecoundPage",
  methods: {
    // only one file is kept — a new upload replaces the previous url
    setComputerPdf(url) {
      this.$set(this.car, "computer_pdf", url);
    },

    clearComputerPdf() {
      this.$set(this.car, "computer_pdf", "");
    },
  },
};
</script>

<style lang="scss" scoped>
.pdf-link {
  display: flex;
  align-items: center;
  gap: 0.5em;
  text-decoration: underline;
  color: #3c5ab4;

  svg {
    width: 1em;
  }
}
</style>
