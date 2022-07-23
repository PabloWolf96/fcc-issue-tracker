const { model, Schema } = require("mongoose");
const IssueSchema = new Schema({
  issue_title: {
    type: String,
    required: true,
  },
  issue_text: {
    type: String,
    required: true,
  },
  created_on: {
    type: Date,
    default: new Date(),
  },
  updated_on: {
    type: Date,
    default: new Date(),
  },
  created_by: {
    type: String,
    required: true,
  },
  assigned_to: String,
  open: {
    type: Boolean,
    default: true,
  },
  status_text: String,

  project: {
    type: Schema.Types.ObjectId,
    ref: "Project",
  },
});
module.exports = model("Issue", IssueSchema);
