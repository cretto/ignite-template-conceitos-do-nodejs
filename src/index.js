const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).send({ error: "Username not found!" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const hasAnyUserWithUsername = users.some(
    (user) => user.username === username
  );

  if (hasAnyUserWithUsername) {
    return response.status(400).send({ error: "Username already exists!" });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.status(200).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    created_at: new Date(),
    done: false,
  };

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const findTodoIndex = user.todos.findIndex((todo) => todo.id === id);

  if (findTodoIndex < 0) {
    return response.status(404).json({ error: "User todo not found!" });
  }

  const newTodo = {
    ...user.todos[findTodoIndex],
    title,
    deadline,
  };

  user.todos[findTodoIndex] = newTodo;

  return response.json(newTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const findTodoIndex = user.todos.findIndex((todo) => todo.id === id);

  if (findTodoIndex < 0) {
    return response.status(404).json({ error: "User todo not found!" });
  }

  const newTodo = {
    ...user.todos[findTodoIndex],
    done: true
  };

  user.todos[findTodoIndex] = newTodo;

  return response.json(newTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const findTodo = user.todos.find((todo) => todo.id === id);

  if (!findTodo) {
    return response.status(404).json({ error: "User todo not found!" });
  }

  user.todos.splice(findTodo, 1);

  return response.status(204).send();
});

module.exports = app;
