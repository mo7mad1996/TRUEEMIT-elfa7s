<template>
  <div class="page">
    <PrintHeader :car="car" />
    <div style="display: table-row-group">
      <div class="page1">
        <div class="flex gap-0.5">
          <main>
            <h4 class="text-center text-zinc-700 text-sm">
              <font-awesome-icon :icon="['fas', 'car-on']" />
              فحص البودي
            </h4>
            <table>
              <thead>
                <th></th>
                <th v-for="val in values" :key="val">{{ val }}</th>
              </thead>
              <tbody>
                <tr v-for="input in $inputs" :key="input.en">
                  <td class="blue">{{ input.ar }}</td>
                  <td class="text-center" v-for="(_, val) in values" :key="val">
                    <font-awesome-icon
                      :icon="['fas', 'check']"
                      class="!text-sky-700 !rounded"
                      v-if="car.body[input.en] == val"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <h6 class="text-xs opacity-60 p-2">
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
          <aside>
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
      values: ["سليم", "معدل", "مرشوش", "رش ومعجون", "مغير ومرشوش"],
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

    thead {
      border-bottom: 1px solid #333;
    }
    th {
      padding: 0.2em 0.5em;
      font-size: 0.8em;
      color: #000;
    }

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
}
</style>
