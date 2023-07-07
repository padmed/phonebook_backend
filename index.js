require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const PersonNumber = require('./models/PersonNumber');

const app = express();

const unknownEndpoint = (request, response) => {
  response.status(404).send(
    JSON.stringify({
      error: 'Unknown endpoint',
    }),
  );
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (error, request, response, next) => {
  console.log('--------------------------');
  console.log(`Error name: ${error.name}`);
  console.log(`Error message: ${error.message}`);
  console.log('--------------------------');

  if (error.name === 'CastError') {
    return response.status(400).json({
      error: 'Malformatted ID',
    });
  }
  if (error.name === 'ValidationError') {
    return response
      .status(422)
      .json({ error: error.name, errorMessage: error.message });
  }
  return response.status(error.status).json({
    error: error.message,
  });
};

// Token for logging POST request contents
// eslint-disable-next-line no-unused-vars
morgan.token('content', (request, response) => JSON.stringify({
  name: request.body.name,
  number: request.body.number,
}));

// Parses JSON
app.use(express.json());

// Using "tiny" predefined logging format for all request methods, except POST method
app.use(
  morgan('tiny', {
    // eslint-disable-next-line object-shorthand, no-unused-vars
    skip: function (request, response) {
      return request.method === 'POST';
    },
  // eslint-disable-next-line comma-dangle
  })
);

// Allows cross-origin browsing
app.use(cors());

// Declare frontend
app.use(express.static('build'));

// Handles GET request
app.get('/api/persons', (request, response, next) => {
  PersonNumber.find({})
    .then((result) => {
      response.json(result);
    })
    .catch((e) => {
      next(e);
    });
});

// Handles .../info GET request
app.get('/info', (request, response) => {
  PersonNumber.find({}).then((persons) => {
    response.send(
      `Phonebook has info for ${persons.length} persons 
    <br/> 
    ${new Date()}`,
    );
  });
});

// Handles a single data GET request
app.get('/api/persons/:id', (request, response, next) => {
  const { id } = request.params;

  PersonNumber.findById(id)
    .then((result) => {
      if (result) {
        response.json(result);
      // eslint-disable-next-line brace-style
      }
      // If data doesn't exist, new error obj is created and passed to error handler middleware
      else {
        const error = new Error("Person data doesn't exist");
        error.status = 404;
        next(error);
      }
    })
    // If mongodb returns an error, it is passed to error handler middleware
    .catch((e) => {
      next(e);
    });
});

// Handles delete request of a single data
app.delete('/api/persons/:id', (request, response, next) => {
  const { id } = request.params;
  PersonNumber.findByIdAndRemove(id)
    .then(() => {
      response.status(204).end();
    })
    .catch((e) => {
      next(e);
    });
});

// Formats POST request logging
app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :content',
  ),
);

// Posts data
app.post('/api/persons', (request, response, next) => {
  const { body } = request;

  // If person data is missing, new error obj is created and passed to error handler middleware
  if (!body.number || !body.name) {
    const error = new Error('Person data is missing');
    error.status = 400;
    // After error handler handles the error - we close end the response with .end()
    // so the program stops excecuting and malformatted data isn't saved on the server
    next(error).end();
  }

  const personToAdd = new PersonNumber({
    name: body.name,
    number: body.number,
  });

  personToAdd
    .save()
    .then((result) => {
      response.send(result);
    })
    .catch((e) => {
      next(e);
    });
});

// Updates data
app.put('/api/persons/:id', (request, response, next) => {
  const { id } = request.params;
  const { name, number } = request.body;

  // Finds matching mongodb data, updates it by newly created object's properties.
  // Third parameter {new: true} makes the server immediately return udpated object
  // Context: 'query', makes mongoose to run validators on query level operations
  PersonNumber.findByIdAndUpdate(
    id,
    { name, number },
    { new: true, context: 'query', runValidators: 'true' }
  )
    .then((result) => {
      if (result) {
        response.json(result);
      } else {
        const error = new Error('Person doesnt exist in the database');
        error.status = 404;
        next(error);
      }
    })
    .catch((e) => {
      next(e);
    });
});

app.use(unknownEndpoint);
app.use(errorHandler);
const PORT = process.env.PORT || 3001;
app.listen(PORT);
