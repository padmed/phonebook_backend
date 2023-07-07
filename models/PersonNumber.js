/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose');

const url = process.env.MONGODB_URI;

console.log(`Connecting to ${url}`);
mongoose
  .connect(url)
  .then(() => {
    console.log('Connected to database');
  })
  .catch((e) => {
    console.log(`Couldn't connect to the database: ${e.message}`);
  });

const personNumberSchema = mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: {
    type: String,
    required: true,
    validate: {
      validator(value) {
        return /^\d{3}-\d+$|^\d{2}-\d+$/.test(value);
      },
      message: 'invalid number format',
    },
  },
});

personNumberSchema.set('toJSON', {
  transform: (doc, returnedObj) => {
    // eslint-disable-next-line no-param-reassign
    returnedObj.id = returnedObj._id.toString();
    // eslint-disable-next-line no-underscore-dangle, no-param-reassign
    delete returnedObj._id;
    // eslint-disable-next-line no-underscore-dangle
    delete returnedObj.__v;
  },
});

module.exports = mongoose.model('PersonNumber', personNumberSchema);
