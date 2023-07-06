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
            <th v-for="val in values" :key="val">{{ val }}</th>
          </thead>
          <tbody>
            <tr v-for="input in $inputs" :key="input.en">
              <td class="blue">{{ input.ar }}</td>
              <td class="text-center" v-for="(_, val) in values" :key="val">
                <font-awesome-icon
                  :icon="['fas', 'check']"
                  v-if="car.body[input.en] == val"
                />
              </td>
            </tr>
          </tbody>
        </table>
        <h6>الفايبر + الصدامات خارج الفحص</h6>
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
  data() {
    return {
      values: ["سليم", "معدل", "مرشوش", "رش ومعجون", "مغير ومرشوش"],
    };
  },
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
    margin-top: -1em;
    thead {
      border-bottom: 1px solid #333;
    }
    th {
      padding: 0.2em 0.5em;
      font-size: 0.8em;
      color: var(--color-blue-5);
    }

    td {
      position: relative;

      &.blue {
        color: var(--color-blue-5);
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
        height: 1em;
        width: 1em;
        display: block;
        border: 2px solid var(--color-blue-5);
        transform: translate(-50%, -50%);
      }
    }
  }
  h6 {
    margin: 0;
    text-align: center;
    color: #25143d;
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

    p {
      margin: 0;
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
  border-top: 1px solid #333;
}

.page1 {
  display: grid;
  grid-template-rows: 1fr auto;
  grid-template-columns: repeat(2, 1fr);

  display: grid;
  gap: 10px;
}
</style>
