const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const user = new Schema({
  name: String,
  user_id: { type: String, unique: true },
  logo: String,
  password: String,
  job: String,

  sections: [
    {
      title: { type: String, default: "" },
      title_en: { type: String, default: "" },
      items: [
        {
          name: { type: String, default: "" },
          name_en: { type: String, default: "" },
          image: { type: String, default: "" },
          description: { type: String, default: "" },
        },
      ],
    },
  ],

  lastLogin: Number,
});

mongoose.model("Users", user);
