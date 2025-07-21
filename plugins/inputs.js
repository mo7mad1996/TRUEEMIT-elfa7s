export default (ctx, inject) => {
  // Inject $hello(msg) in Vue, context and store.
  inject("inputs", [
    { ar: "الكبوت", en: "hood", lang_en: "Hood" },
    { ar: "رفرف أمامي يمين", en: "fender_f_r", lang_en: "Front Right Fender" },
    { ar: "باب امامي يمين", en: "door_f_r", lang_en: "Front Right Door" },
    { ar: "باب خلفي يمين", en: "door_b_r", lang_en: "Rear Right Door" },
    { ar: "رفرف خلفي يمين", en: "fender_b_r", lang_en: "Rear Right Fender" },
    { ar: "رفرف أمامي يسار", en: "fender_f_l", lang_en: "Front Left Fender" },
    { ar: "باب أمامي يسار", en: "door_f_l", lang_en: "Front Left Door" },
    { ar: "باب خلفي يسار", en: "door_b_l", lang_en: "Rear Left Door" },
    { ar: "رفرف خلفي يسار", en: "fender_b_l", lang_en: "Rear Left Fender" },
    { ar: "السمكه الجانبيه يمين", en: "fish_r", lang_en: "Right Side Skirt" },
    { ar: "السمكه الجانبيه يسار", en: "fish_l", lang_en: "Left Side Skirt" },
    { ar: "عارضه يمين", en: "stand_r", lang_en: "Right B-pillar Support" },
    { ar: "عارضه يسار", en: "stand_l", lang_en: "Left B-pillar Support" },
    { ar: "عمود غمارة يمين", en: "pillar_r", lang_en: "Right Cabin Pillar" },
    { ar: "عمود غمارة يسار", en: "pillar_l", lang_en: "Left Cabin Pillar" },
    { ar: "الشنطه", en: "trunk", lang_en: "Trunk" },
    { ar: "باب الصندوق الخلفي", en: "truck_door", lang_en: "Tailgate" },
    { ar: "سقف السياره", en: "roof", lang_en: "Car Roof" },
  ]);
};
