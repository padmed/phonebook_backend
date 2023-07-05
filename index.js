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
app.get("/api/persons", (request, response) => {
  PersonNumber.find({}).then((result) => {
    response.json(result);
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
app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const personToSend = persons.find((x) => x.id === id);

  //If there's no personToSend then 404 error
  personToSend ? response.json(personToSend) : response.status(404).end();
});

//Handles delete request of a single data
app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  PersonNumber.findByIdAndRemove(id)
    .then(() => {
      response.status(204).end();
    })
    .catch((e) => {
      console.log(e.message);
    });
});

//Formats POST request logging
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :content"
  )
);

//Posts data
app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!body.number || !body.name) {
    return response.status(400).json({
      error: "Person data missing",
    });
  }

  // //If the name exists in the persons object, this throws an error
  // if (persons.find((x) => x.name === body.name)) {
  //   return response
  //     .status(400)
  //     .json({ error: "The name already exists in the phonebook" });
  // }

  const personToAdd = new PersonNumber({
    name: body.name,
    number: body.number,
  });

  personToAdd.save().then((result) => {
    response.send(result);
  });
});

app.use(unknownEndpoint);
PORT = process.env.PORT || 3001;
app.listen(PORT);
