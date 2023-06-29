const mongoose = require("mongoose");

//If the parameters are not provided, message is displayed and the program execution stops
if (process.argv.length < 3) {
  console.log(
    "*********\n\nTo log out all numbers type a Password \n \nTo save a number type in the following format: Password, Name, Number \n \n********* "
  );
  process.exit(1);
}

const password = process.argv[2];
const URL = `mongodb+srv://padmed:${password}@cluster0.dxdowo8.mongodb.net/?retryWrites=true&w=majority`;
const phoneNumberSchema = mongoose.Schema({
  name: String,
  number: String,
});
const phoneNumber = mongoose.model("phoneNumber", phoneNumberSchema);

mongoose.connect(URL);
//If user provides more then 3 parameters, it means that he wants to save the new number
if (process.argv.length > 3) {
  const name = process.argv[3];
  const number = process.argv[4];

  const newPhoneNumber = new phoneNumber({
    name,
    number,
  });

  newPhoneNumber.save().then((result) => {
    console.log(`Added ${result.name}'s number ${result.number} to phonebook`);
    mongoose.connection.close();
  });
}

//If there are exactly 3 params, it is assumed that the third param. is the password and all the data gets displayed
if (process.argv.length === 3) {
  console.log("Phonebook: ");
  phoneNumber.find({}).then((result) => {
    result.forEach((phoneNumber) => {
      console.log(phoneNumber.name, phoneNumber.number);
    });
    mongoose.connection.close();
  });
}
