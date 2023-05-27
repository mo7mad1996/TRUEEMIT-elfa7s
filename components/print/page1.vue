<template>
  <div class="page">
    <PrintHeader :car="car" />
    <div class="page1">
      <main>
        <h4>
          فحص البودي

          <font-awesome-icon :icon="['fas', 'car-on']" />
        </h4>
        <table>
          <thead>
            <th></th>
            <th>سليم</th>
            <th>معدل</th>
            <th>مرشوش</th>
          </thead>
          <tbody>
            <tr v-for="input in $inputs" :key="input.en">
              <td>{{ input.ar }}</td>
              <td class="text-center">
                <font-awesome-icon
                  :icon="['fas', 'check']"
                  v-if="car.body[input.en] == 0"
                />
              </td>
              <td class="text-center">
                <font-awesome-icon
                  :icon="['fas', 'check']"
                  v-if="car.body[input.en] == 1"
                />
              </td>
              <td class="text-center">
                <font-awesome-icon
                  :icon="['fas', 'check']"
                  v-if="car.body[input.en] == 2"
                />
              </td>
            </tr>
          </tbody>
        </table>
        <h6>الفايبر + الصدمات خارج الفحص</h6>
        <fieldset v-if="car.body.note">
          <legend>
            <font-awesome-icon :icon="['fas', 'clipboard']" />

            ملاحظه
          </legend>

          <p v-html="$nltobr(car.body.note)"></p>
        </fieldset>
      </main>
      <aside>
        <h4>
          الرسم التوضيحي
          <font-awesome-icon :icon="['fas', 'compass-drafting']" />
        </h4>
        <Images :car="car" />
      </aside>
      <footer>
        <h4>
          فحص الشاصى
          <font-awesome-icon :icon="['fas', 'toolbox']" />
        </h4>

        <p v-html="$nltobr(car.chassis)" v-if="car.chassis"></p>
      </footer>
    </div>
  </div>
</template>

<script>
import Images from "@/components/engineer/images.vue";
import PrintHeader from "@/components/print/header";

export default {
  name: "Page1",
  props: ["car"],
  components: { PrintHeader, Images },
};
</script>

<style lang="scss" scoped>
main {
  grid-row-start: 1;
  grid-row-end: 2;
  grid-column-start: 1;
  grid-column-end: 2;

  display: flex;
  flex-direction: column;

  table {
    thead {
      border-bottom: 1px solid #333;
    }
    th {
      padding: 0.2em 0.5em;
    }

    td {
      position: relative;

      &:first-of-type {
        white-space: nowrap;
        font-size: 0.7em;
      }

      &:not(:first-of-type):after {
        content: "";
        position: absolute;
        top: 50%;
        left: 50%;
        height: 1em;
        width: 1em;
        display: block;
        border: 2px solid #333;
        transform: translate(-50%, -50%);
      }
    }
  }
  h6 {
    margin: 0;
    text-align: center;
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
      color: #25143d;
    }
  }
}

aside {
  position: relative;
  box-sizing: border-box;

  &::after {
    content: "";
    border-left: 1px solid #000;
    position: absolute;
    height: 100%;
    right: -5px;
    top: 0;
  }
}

footer {
  grid-row-start: 2;
  grid-row-end: 3;
  grid-column-start: 1;
  grid-column-end: 3;

  position: relative;

  &::after {
    content: "";
    border-top: 1px solid #000;
    position: absolute;
    width: 100%;
    top: -5px;
    left: 0;
  }
}

.page1 {
  display: grid;
  grid-template-rows: 4fr 1fr;
  grid-template-columns: repeat(2, 1fr);

  display: grid;
  gap: 10px;
}
</style>
