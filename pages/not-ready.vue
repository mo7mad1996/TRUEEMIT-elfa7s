<template>
  <main class="not-ready">
    <canvas ref="canvas"></canvas>

    <section class="card" dir="rtl">
      <div class="icon" :class="status">
        <font-awesome-icon :icon="content.icon" />
      </div>

      <h1>{{ content.title }}</h1>
      <p class="message">{{ content.message }}</p>

      <p v-if="status === 'expired' && $shop.expiryDate" class="expiry">
        تاريخ انتهاء الاشتراك:
        <strong>{{ $moment($shop.expiryDate).format("DD MMMM YYYY") }}</strong>
      </p>

      <div class="actions">
        <button v-if="status === 'unavailable'" class="btn secondary" @click="reload">
          <font-awesome-icon icon="fa-solid fa-rotate-right" />
          تحديث الصفحة
        </button>
        <a class="btn primary" href="https://trueemit.dev/contact">
          <font-awesome-icon icon="fa-solid fa-headset" />
          {{ content.action }}
        </a>
      </div>

      <p class="hint">
        <font-awesome-icon icon="fa-solid fa-arrows-rotate" />
        بنراجع حالة الفرع لوحدنا كل شوية، وأول ما الموقع يجهز هنرجعك على طول.
      </p>
    </section>
  </main>
</template>

<script>
const CONTENT = {
  expired: {
    icon: "fa-solid fa-calendar-xmark",
    title: "اشتراكك انتهى",
    message:
      "انتهت صلاحية اشتراك المركز، فوقفنا المنصة مؤقتًا. جدد اشتراكك وارجع لشغلك في دقائق.",
    action: "تجديد الاشتراك",
  },
  unconfigured: {
    icon: "fa-solid fa-screwdriver-wrench",
    title: "الموقع لسه متجهزش",
    message:
      "الموقع ده لسه متربطش بأي فرع في TRUEEMIT. لو المركز بتاعك، كلمنا وهنجهزهولك على طول.",
    action: "تجهيز الفرع",
  },
  invalid_branch: {
    icon: "fa-solid fa-screwdriver-wrench",
    title: "الموقع لسه متجهزش",
    message:
      "في مشكلة في إعدادات الفرع الخاصة بالموقع ده. كلمنا وهنظبطهالك.",
    action: "تواصل معنا",
  },
  not_found: {
    icon: "fa-solid fa-magnifying-glass",
    title: "مش لاقيين الفرع ده",
    message:
      "الفرع المطلوب مش مسجل عندنا. ممكن يكون لسه ما اتسجلش، كلمنا وهنضيفه.",
    action: "تسجيل الفرع",
  },
  unavailable: {
    icon: "fa-solid fa-plug-circle-xmark",
    title: "في مشكلة مؤقتة",
    message:
      "مش قادرين نتأكد من بيانات الفرع دلوقتي. جرب تحديث الصفحة بعد شوية، ولو المشكلة مستمرة كلمنا.",
    action: "تواصل معنا",
  },
};

export default {
  auth: false,
  layout: "login",
  computed: {
    status() {
      return (this.$shop && this.$shop.status) || "not_found";
    },
    content() {
      return CONTENT[this.status] || CONTENT.not_found;
    },
  },
  data: () => ({ recheck: null }),
  mounted() {
    if (this.$partical) this.$partical(this.$refs.canvas);
    this.recheck = setInterval(this.checkStatus, 30000);
  },
  beforeDestroy() {
    clearInterval(this.recheck);
  },
  methods: {
    reload() {
      window.location.reload();
    },
    async checkStatus() {
      try {
        const response = await this.$axios.$get("/trueemit/shop");
        const shop = response.shop;
        Object.assign(this.$shop, shop || {}, {
          status: response.status,
          ready: Boolean(shop) && response.status === "ready",
        });

        if (this.$shop.ready) this.$router.push("/login");
      } catch (error) {
        // مفيش اتصال دلوقتي، نفضل على الصفحة ونحاول مرة تانية
      }
    },
  },
  head: () => ({ title: "الموقع غير جاهز" }),
};
</script>

<style lang="scss" scoped>
.not-ready {
  min-height: 100vh;
  display: grid;
  place-items: center;
  position: relative;
  overflow: hidden;
  padding: 1.5rem;

  canvas {
    position: absolute;
    top: 0;
    z-index: 1;
  }

  .card {
    position: relative;
    z-index: 2;
    max-width: 32rem;
    width: 100%;
    text-align: center;
    padding: 2.5rem 2rem;
    border-radius: 1rem;
    color: #eef6f8;
    background: rgba(4, 22, 35, 0.85);
    border: 1px solid rgba(1, 139, 154, 0.35);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(6px);

    .icon {
      width: 4.5rem;
      height: 4.5rem;
      margin: 0 auto 1.25rem;
      display: grid;
      place-items: center;
      border-radius: 50%;
      font-size: 1.75rem;
      color: #018b9a;
      background: rgba(1, 139, 154, 0.12);
      border: 1px solid rgba(1, 139, 154, 0.4);

      &.expired {
        color: #f59e0b;
        background: rgba(245, 158, 11, 0.12);
        border-color: rgba(245, 158, 11, 0.4);
      }
    }

    h1 {
      font-size: 1.6rem;
      font-weight: 700;
      margin-bottom: 0.75rem;
    }

    .message {
      color: #b8ccd4;
      line-height: 1.9;
    }

    .expiry {
      margin-top: 0.75rem;
      color: #f59e0b;
      font-size: 0.95rem;
    }

    .hint {
      margin-top: 1.25rem;
      font-size: 0.85rem;
      color: #7d98a3;

      svg {
        margin-left: 0.35rem;
      }
    }

    .actions {
      margin-top: 1.75rem;
      display: flex;
      justify-content: center;
      gap: 0.75rem;
      flex-wrap: wrap;

      .btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.7rem 1.6rem;
        border-radius: 0.6rem;
        font-weight: 600;
        transition: 0.2s;
        cursor: pointer;

        &.primary {
          color: #fff;
          background: #018b9a;

          &:hover {
            background: #016d78;
          }
        }

        &.secondary {
          color: #b8ccd4;
          background: transparent;
          border: 1px solid rgba(184, 204, 212, 0.35);

          &:hover {
            color: #fff;
            border-color: #fff;
          }
        }
      }
    }
  }
}
</style>
