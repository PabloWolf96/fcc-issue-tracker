const {Schema} = require("mongoose")
const ProjectSchema = new Schema({
  const {model} = require('mongoose')
  name: {
    type: String,
    required: true
  },
  issues: [
    {
      type: Schema.Types.ObjectId, 
      ref: "Issue"
    }
  ]

})
module.exports = model('Project', ProjectSchema) 
