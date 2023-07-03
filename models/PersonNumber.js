const mongoose = require("mongoose");
const url = process.env.MONGODB_URI;

console.log(`Connecting to ${url}`);
mongoose
  .connect(url)
  .then(() => {
    console.log("Connected to database");
  })
  .catch((e) => {
    console.log(`Couldn't connect to the database: ${e.message}`);
  });

const personNumberSchema = mongoose.Schema({
  name: String,
  number: String,
});

personNumberSchema.set("toJSON", {
  transform: (doc, returnedObj) => {
    returnedObj.id = returnedObj._id.toString();
    delete returnedObj._id;
    delete returnedObj.__v;
  },
});

module.exports = mongoose.model("PersonNumber", personNumberSchema);
