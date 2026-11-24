export default (ctx, inject) => {
  // Inject $hello(msg) in Vue, context and store.
  inject("inputs", [
    { ar: "اكصدام امامي", en: "bumper_f", lang_en: "Front Bumper" },
    { ar: "الكبوت", en: "hood", lang_en: "Hood" },
    { ar: "رفرف أمامي يمين", en: "fender_f_r", lang_en: "Front Right Fender" },
    { ar: "باب امامي يمين", en: "door_f_r", lang_en: "Front Right Door" },
    { ar: "باب خلفي يمين", en: "door_b_r", lang_en: "Rear Right Door" },
    { ar: "رفرف خلفي يمين", en: "fender_b_r", lang_en: "Rear Right Fender" },
    { ar: "رفرف أمامي يسار", en: "fender_f_l", lang_en: "Front Left Fender" },
    { ar: "باب أمامي يسار", en: "door_f_l", lang_en: "Front Left Door" },
    { ar: "باب خلفي يسار", en: "door_b_l", lang_en: "Rear Left Door" },
    { ar: "رفرف خلفي يسار", en: "fender_b_l", lang_en: "Rear Left Fender" },
    { ar: "العتبة يمين", en: "fish_r", lang_en: "Right Side Sill" },
    { ar: "العتبة يسار", en: "fish_l", lang_en: "Left Side Sill" },
    { ar: "موزة يمين", en: "stand_r", lang_en: "Right Pillar" },
    { ar: "موزة يسار", en: "stand_l", lang_en: "Left Pillar" },
    { ar: "الشنطه", en: "trunk", lang_en: "Trunk" },
    { ar: "اكصدام خلفي", en: "bumper_b", lang_en: "Rear Bumper" },
    { ar: "سقف السياره", en: "roof", lang_en: "Car Roof" },
  ]);
};
