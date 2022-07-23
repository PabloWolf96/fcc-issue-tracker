const { Schema, model } = require("mongoose");
const ProjectSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  issues: [
    {
      type: Schema.Types.ObjectId,
      ref: "Issue",
    },
  ],
});
module.exports = model("Project", ProjectSchema);
