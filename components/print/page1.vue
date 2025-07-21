<template>
  <div class="page">
    <PrintHeader :car="car" />
    <div style="display: table-row-group">
      <div class="page1">
        <div class="flex gap-0.5">
          <main class="flex-1">
            <table class="w-full">
              <div class="table-header-group h-fit">
                <td>
                  <h4
                    class="text-center text-zinc-700 text-sm h-full flex flex-col justify-between"
                  >
                    <font-awesome-icon :icon="['fas', 'car-on']" />
                    <div>فحص البودي</div>
                    <div>Body</div>
                  </h4>
                </td>
                <div
                  v-for="(val, n) in values"
                  :key="n"
                  class="text-gray-400 text-[10px] text-bt text-left px-1 pb-1 table-cell justify-center"
                >
                  <div>
                    {{ val.ar }}
                  </div>
                  <div>
                    {{ val.en }}
                  </div>
                </div>
              </div>

              <tbody>
                <tr
                  v-for="(input, v) in $inputs"
                  :key="v"
                  class="text-[10px] text-gray-400 odd:bg-neutral-200 odd:!text-neutral-900"
                >
                  <td class="">
                    {{ input.ar }}
                    <br />
                    {{ input.lang_en }}
                  </td>
                  <td class="text-center" v-for="(_, val) in values" :key="val">
                    <font-awesome-icon
                      :icon="['fas', 'check']"
                      class="!text-sky-700 !rounded !text-md"
                      v-if="car.body[input.en] == val"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <h6 class="text-xs opacity-60 p-1">
              الفايبر + الصدامات خارج الفحص
            </h6>
            <fieldset v-if="car.body.note">
              <legend>
                <font-awesome-icon :icon="['fas', 'clipboard']" />

                ملاحظه
              </legend>

              <p v-html="$nltobr(car.body.note)"></p>
            </fieldset>
          </main>

          <div class="line"></div>

          <aside class="flex-1">
            <h4 class="text-center text-zinc-700 text-sm">
              <font-awesome-icon :icon="['fas', 'compass-drafting']" />
              الرسم التوضيحي
            </h4>
            <Images :car="car" />
          </aside>
        </div>

        <footer>
          <h4>
            فحص الشاصى
            <font-awesome-icon :icon="['fas', 'toolbox']" />
          </h4>

          <p v-html="$nltobr(car.chassis)" v-if="car.chassis"></p>
        </footer>
      </div>
    </div>

    <PrintFooter />
  </div>
</template>

<script>
import Images from "@/components/engineer/images.vue";
import PrintHeader from "@/components/print/header";
import PrintFooter from "@/components/print/footer";

export default {
  name: "Page1",
  props: ["car"],
  data() {
    return {
      values: [
        { ar: "سليم", en: "In Good Condition" },
        { ar: "معدل", en: "Repaired" },
        { ar: "مرشوش", en: "Repainted" },
        { ar: "رش ومعجون", en: "Repainted & Filled" },
        { ar: "مغير ومرشوش", en: "Replaced & Repainted" },
      ],
    };
  },
  components: { PrintHeader, PrintFooter, Images },
};
</script>

<style lang="scss" scoped>
main {
  display: flex;
  flex-direction: column;

  table {
    width: 100%;
    font-size: 16px;

    td {
      position: relative;

      &.blue {
        color: #000;
      }

      &:first-of-type {
        white-space: nowrap;
        font-size: 0.7em;
      }

      &:not(:first-of-type):after {
        content: "";
        position: absolute;
        top: 50%;
        left: 50%;
        height: 1.2em;
        width: 1.2em;
        display: block;
        @apply border rounded border-blue-950;
        transform: translate(-50%, -50%);
      }
    }
  }
  h6 {
    margin: 0;
    text-align: center;
    color: #000;
  }
  fieldset {
    border-radius: 5px;
    font-size: 0.7em;
    margin: 0.6em 0;
    padding: 0 1em;
    flex: 1;

    legend {
      padding: 0 0.5em;
      font-size: 1.3em;
      color: #000;
    }

    p {
      margin: 0;
    }
  }
}

aside {
  position: relative;
  box-sizing: border-box;
}

.line {
  border-left: 1px solid #000;
}

footer {
  grid-row-start: 2;
  grid-row-end: 3;
  grid-column-start: 1;
  grid-column-end: 3;
  border-top: 1px solid #000;
}

.page1 {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 10px;
  margin: -2em 0 0 0;

  .flex {
    display: flex;
  }

  .text-bt {
    writing-mode: sideways-lr;
  }
}
</style>
