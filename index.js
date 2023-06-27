const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const app = express();
let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

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

//Handles GET request
app.get("/api/persons", (request, response) => {
  response.json(persons);
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
  const id = Number(request.params.id);
  persons = persons.filter((x) => x.id !== id);

  //sends 204 status code either if the request was valid or not
  response.status(204).end();
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

  //If the name exists in the persons object, this throws an error
  if (persons.find((x) => x.name === body.name)) {
    return response
      .status(400)
      .json({ error: "The name already exists in the phonebook" });
  }

  const personToAdd = {
    name: body.name,
    number: body.number,
    id: Math.floor(Math.random() * 999999999999999999),
  };

  persons = [...persons, personToAdd];
  response.json(personToAdd);
});

app.use(unknownEndpoint);
PORT = process.env.PORT || 3001;
app.listen(PORT);
