const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("connected to db");
}).catch(err => console.log(error))
