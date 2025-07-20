<template>
  <section class="container" v-if="car?.sections?.length">
    <h1 class="text-lg opacity-60 my-4">الاقسام</h1>

    <div class="grid grid-cols-3 gap-4">
      <main
        v-for="(section, n) in car.sections"
        :key="n"
        class="col-span-1 rounded-md shadow bg-neutral-50 p-2"
      >
        <h1 class="text-center text-blue-700 text-lg my-2 font-bold">
          {{ section.title }}
          ({{ section.title_en }})
        </h1>

        <ul>
          <li
            v-for="(item, i) in section.items"
            :key="i"
            class="bg-white/80 my-3 p-2 simple_form"
          >
            <div class="flex justify-between items-center">
              <h4 class="text-sm text-gray-500">
                {{ item.name }}
                <br />
                ({{ item.name_en }})
              </h4>

              <button
                @click="item.edit = true"
                v-if="!item.edit"
                class="py-1 px-3 text-xs rounded shadow bg-blue-100 hover:bg-blue-200 text-blue-700"
              >
                اضف ملاحظات
              </button>
            </div>

            <div class="form-input my-4" v-if="item.edit">
              <textarea
                placeholder="ملاحظات"
                v-model="item.description"
                rows="2"
                class="!h-16"
              ></textarea>

              <label>
                <div class="flex gap-2 my-2">
                  <div
                    class="flex-1 text-center p-4 bg-slate-100 rounded border hover:bg-slate-200 cursor-pointer"
                  >
                    <font-awesome-icon
                      :icon="['fas', 'pencil']"
                      v-if="item.image"
                    />
                    <font-awesome-icon :icon="['fas', 'camera']" v-else />
                  </div>
                  <div
                    class="flex-1 text-center p-4 bg-red-100 rounded border hover:bg-red-200 cursor-pointer"
                    v-if="item.image"
                    @click.prevent.stop="item.image = ''"
                  >
                    <font-awesome-icon :icon="['fas', 'close']" />
                  </div>
                </div>

                <FileDropAble
                  class="!hidden"
                  :id="car._id"
                  @input="(image) => (item.image = image)"
                  @delete="() => (item.image = '')"
                >
                  <template> </template>
                </FileDropAble>
              </label>
              <img
                v-if="item.image"
                :src="item.image"
                class="w-full h-24 bg-neutral-100 aspect-square object-contain my-2 block col-1 rounded shadow"
              />
            </div>
          </li>
        </ul>
      </main>
    </div>
  </section>
  <div v-else></div>
</template>

<script>
export default {
  name: "Sections",
  props: ["car"],
};
</script>
