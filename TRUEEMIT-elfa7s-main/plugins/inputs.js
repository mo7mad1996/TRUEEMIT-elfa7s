export default (ctx, inject) => {
  // Inject $hello(msg) in Vue, context and store.
  inject("inputs", [
    { ar: "الكبوت", en: "hood" },
    { ar: "رفرف أمامي يمين", en: "fender_f_r" },
    { ar: "باب امامي يمين", en: "door_f_r" },
    { ar: "باب خلفي يمين", en: "door_b_r" },
    { ar: "رفرف خلفي يمين", en: "fender_b_r" },
    { ar: "رفرف أمامي يسار", en: "fender_f_l" },
    { ar: "باب أمامي يسار", en: "door_f_l" },
    { ar: "باب خلفي يسار", en: "door_b_l" },
    { ar: "رفرف خلفي يسار", en: "fender_b_l" },
    { ar: "السمكه الجانبيه يمين", en: "fish_r" },
    { ar: "السمكه الجانبيه يسار", en: "fish_l" },
    { ar: "عارضه يمين", en: "stand_r" },
    { ar: "عارضه يسار", en: "stand_l" },
    { ar: "عمود غمارة يمين", en: "pillar_r" },
    { ar: "عمود غمارة يسار", en: "pillar_l" },
    { ar: "الشنطه", en: "trunk" },
    { ar: "باب الصندوق الخلفي", en: "truck_door" },
    { ar: "سقف السياره", en: "roof" },
  ]);
};
