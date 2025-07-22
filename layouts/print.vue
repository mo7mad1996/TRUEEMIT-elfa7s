<template>
  <div class="bg min-h-screen" ref="p">
    <clientOnly>
      <div
        class="fixed py-2 top-0 z-50 flex justify-center items-center w-full print:hidden gap-2"
      >
        <button
          class="btn !bg-neutral-800 hover:!bg-neutral-700 !border-neutral-800 !text-neutral-300 font-light"
          @click="print"
        >
          طباعة

          <font-awesome-icon icon="fa-solid fa-print" />
        </button>

        <button
          class="btn !bg-neutral-800 hover:!bg-neutral-800 !border-neutral-800 !text-neutral-300 font-light"
          @click="lang = lang == 'ar' ? 'en' : 'ar'"
        >
          <div
            class="transition-all"
            :class="{ 'text-neutral-600': lang == 'en' }"
          >
            عربي
          </div>
          <div
            class="transition-all"
            :class="{ 'text-neutral-600': lang == 'ar' }"
          >
            ENGLISH
          </div>
        </button>
      </div>
      <NuxtChild :lang="lang" />
      <img
        class="logo-print"
        :src="$shop.logo"
        v-if="!['exclusive'].includes($auth.user.job)"
      />
    </clientOnly>
  </div>
</template>

<script>
export default {
  data() {
    return {
      lang: "ar",
    };
  },
  methods: {
    print() {
      window.print();
    },
  },
  mounted() {
    if (!this.$route.query.hasOwnProperty("no_print")) this.print();
  },
};
</script>

<style lang="scss">
.bg {
  background: #706969;
  padding: 2em;

  @media print {
    background: white;
    padding: 0;
  }
}

.page {
  margin: 4em auto 0;
  background: white;
  display: table;
  width: 210mm;
  min-height: 297mm;
  padding: 0.5in;
  // font-size: 18px;
  overflow: hidden;

  box-shadow: 0 0 10px #2a505d;

  @media print {
    width: calc(210mm - 1in);
    min-height: calc(297mm - 1in);
    overflow: hidden !important;
    padding: 0;
    box-shadow: none;
    margin: 0;
  }
}

.footer {
  font-size: 0.7em;
  color: #000;
  box-sizing: border-box;
  width: 100%;
  border-top: 1px solid #333;

  > div {
    flex: 1;

    span {
      display: flex;
      gap: 1em;
      margin: 0.3em 0;

      svg {
        display: block;
        width: 1em;
      }
    }
  }

  .left {
    text-align: left;
    direction: ltr;
  }
  .right {
    text-align: right;
    direction: rtl;
  }

  @media print {
    display: flex;
  }
}

.logo-print {
  display: none;

  @media print {
    position: fixed;
    display: block;
    left: 1em;
    bottom: 3em;
    width: 7em;
    height: 7em;
    object-fit: contain;
  }
}
</style>
