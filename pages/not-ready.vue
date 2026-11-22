<template>
  <main class="min-h-screen flex items-center justify-center px-6 text-center" dir="rtl">
    <section class="max-w-xl rounded-xl bg-white p-8 shadow-lg">
      <h1 class="mb-4 text-2xl font-bold">الموقع لسه مش جاهز</h1>
      <p v-if="$shop.status === 'unavailable'">
        تعذر التحقق من بيانات الفرع حاليًا. حاول مرة أخرى لاحقًا أو تواصل معنا للمساعدة.
      </p>
      <p v-else-if="$shop.status === 'expired'">
        انتهت صلاحية اشتراك هذا الفرع. يرجى التواصل مع TRUEEMIT لتجديد الاشتراك.
      </p>
      <p v-else-if="$shop.status === 'unconfigured' || $shop.status === 'invalid_branch'">
        لم يتم إعداد الفرع لهذا الموقع بعد. تواصل معنا لإضافة الفرع وإكمال التجهيز.
      </p>
      <p v-else>
        لم يتم العثور على بيانات هذا الفرع، والموقع غير جاهز للاستخدام حتى الآن.
      </p>
      <a
        class="mt-6 inline-block rounded bg-blue-700 px-5 py-3 text-white hover:bg-blue-800"
        href="https://trueemit.dev/contact"
      >
        تواصل معنا لإضافة الفرع
      </a>
    </section>
  </main>
</template>

<script>
export default {
  auth: false,
  layout: "login",
  head: () => ({ title: "الموقع غير جاهز" }),
};
</script>
