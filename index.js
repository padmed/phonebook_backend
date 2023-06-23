const express = require("express");
const app = express();
app.use(express.json());

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

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/info", (request, response) => {
  response.send(
    `Phonebook has info for ${persons.length} persons 
    <br/> 
    ${new Date()}`
  );
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const personToSend = persons.find((x) => x.id === id);

  //If there's no personToSend then 404 error
  personToSend ? response.json(personToSend) : response.status(404).end();
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((x) => x.id !== id);

  //sends 204 status code either if the request was valid or not
  response.status(204).end();
});

app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!body.number || !body.name) {
    return response.status(400).json({
      error: "Person data missing",
    });
  }

  const personToAdd = {
    name: body.name,
    number: body.number,
    id: Math.floor(Math.random() * 999999999999999999),
  };

  persons = [...persons, personToAdd];
  response.json(personToAdd);
});

PORT = 3001;
app.listen(PORT);
