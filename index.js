require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const PersonNumber = require("./models/PersonNumber");

const app = express();

const unknownEndpoint = (req, res) => {
  res.status(404).send(
    JSON.stringify({
      error: "Unknown endpoint",
    })
  );
};

const errorHandler = (error, req, res, next) => {
  console.log(error.message);

  if (error.name === "CastError") {
    return res.status(400).json({
      error: "Malformatted ID",
    });
  }
  return res.status(error.status).json({
    error: error.message,
  });
};

//Token for logging POST request contents
morgan.token("content", (req, res) => {
  return JSON.stringify({ name: req.body.name, number: req.body.number });
});

//Parses JSON
app.use(express.json());

//Using "tiny" predefined logging format for all request methods, except POST method
app.use(
  morgan("tiny", {
    skip: function (request, response) {
      return request.method === "POST";
    },
  })
);

//Allows cross-origin browsing
app.use(cors());

//Declare frontend
app.use(express.static("build"));

//Handles GET request
app.get("/api/persons", (request, response, next) => {
  PersonNumber.find({})
    .then((result) => {
      response.json(result);
    })
    .catch((e) => {
      next(e);
    });
});

//Handles .../info GET request
app.get("/info", (request, response) => {
  response.send(
    `Phonebook has info for ${persons.length} persons 
    <br/> 
    ${new Date()}`
  );
});

//Handles a single data GET request
app.get("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;

  PersonNumber.findById(id)
    .then((result) => {
      if (result) {
        response.json(result);
      }
      //If data doesn't exist, new error obj is created and passed to error handler middleware
      else {
        const error = new Error("Person data doesn't exist");
        error.status = 404;
        next(error);
      }
    })
    //If mongodb returns an error, it is passed to error handler middleware
    .catch((e) => {
      next(e);
    });
});

//Handles delete request of a single data
app.delete("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;
  PersonNumber.findByIdAndRemove(id)
    .then(() => {
      response.status(204).end();
    })
    .catch((e) => {
      next(e);
    });
});

//Formats POST request logging
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :content"
  )
);

//Posts data
app.post("/api/persons", (request, response, next) => {
  const body = request.body;

  //If person data is missing, new error obj is created and passed to error handler middleware
  if (!body.number || !body.name) {
    const error = new Error("Person data is missing");
    error.status = 404;
    //After error handler handles the error - we close end the response with .end()
    //so the program stops excecuting and malformatted data isn't saved on the server
    next(error).end();
  }

  const personToAdd = new PersonNumber({
    name: body.name,
    number: body.number,
  });

  personToAdd.save().then((result) => {
    response.send(result);
  });
});

//updates data
app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;
  const id = request.params.id;

  //Should be regular JS obj, not a mongo model
  const updatedPerson = {
    name: body.name,
    number: body.number,
  };

  //Finds matching mongodb data, updates it by newly created object's properties.
  //Third parameter {new: true} makes the server immediately return udpated object
  PersonNumber.findByIdAndUpdate(id, updatedPerson, { new: true })
    .then((result) => {
      if (result) {
        response.json(result);
      } else {
        const error = new Error("Person doesnt exist in the database");
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
PORT = process.env.PORT || 3001;
app.listen(PORT);
