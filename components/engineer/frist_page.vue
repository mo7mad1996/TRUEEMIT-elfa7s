<template>
  <div class="container simple_form">
    <div class="d-flex flex-controller">
      <fieldset v-if="car.body">
        <legend>فحص البودي</legend>

        <div class="check-input" v-for="input in $inputs" :key="input.en">
          <span>{{ input.ar }}</span>
          <div class="inputs">
            <div class="input" v-for="(text, v) in values" :key="v">
              <input
                type="radio"
                :value="v"
                :name="input.en"
                v-model="car.body[input.en]"
                :id="v + input.en"
              />
              <label :for="v + input.en">{{ text }}</label>
            </div>
          </div>
        </div>

        <div class="form-input">
          <label>
            <font-awesome-icon :icon="['fas', 'clipboard']" />
            ملاحظات
          </label>
          <textarea
            v-model="car.body.note"
            data-max="3"
            @keydown="$check_max_lines"
          ></textarea>
        </div>
      </fieldset>
      <div class="images">
        <Images :car="car" v-if="car.body" />
      </div>
    </div>
    <div class="form-input">
      <label>
        <font-awesome-icon :icon="['fas', 'toolbox']" />
        فحص الشاصى
      </label>
      <textarea
        v-model="car.chassis"
        data-max="5"
        @keydown="$check_max_lines"
      ></textarea>
    </div>
  </div>
</template>

<script>
import Images from "@/components/engineer/images.vue";

export default {
  name: "FristPage",
  props: ["car"],
  data() {
    return {
      values: ["سليم", "معدل", "مرشوش", "رش ومعجون", "مغير ومرشوش"],
    };
  },
  components: {
    Images,
  },
};
</script>

<style lang="scss" scoped>
fieldset {
  margin: 1em 0;
  border-radius: 5px;

  legend {
    padding: 0 1em;
    border-left: 1px solid #c3c3c3;
    border-right: 1px solid #c3c3c3;
  }
}

.flex-controller {
  fieldset {
    flex: 1;
  }

  .images {
    max-width: 50%;

    @media (max-width: 840px) {
      display: none !important;
    }
  }
}
</style>
