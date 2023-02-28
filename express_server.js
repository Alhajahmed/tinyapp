const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const {
  generateRandomString,
  urlsForUser,
  getUserByEmail,
} = require("./helpers");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["mySecKey"],
    maxAge: 24 * 60 * 60 * 1000,
  })
);
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10),
  },
};

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  if (!longURL) {
    res.send("URL Ids do not exist");
  } else {
    res.redirect(longURL);
  }
});
app.get("/urls/:id/edit", (req, res) => {
  const { id } = req.params;
  res.redirect(`/urls/${id}`);
});

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

app.get("/urls/new", (req, res) => {
  const user = users[req.session["user_id"]];
  const templateVars = {
    user: user,
  };
  if (!user) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.send("<html><body><h1>Page not found</h1></body></html>");
  }
  if (!users[req.session["user_id"]]) {
    return res.redirect("/login");
  }
  const templateVars = {
    user: users[req.session["user_id"]],
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
  };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  if (!req.session["user_id"]) {
    res.send(
      '<html><body><h1>Please log in <a href="/login">login</a> </h1></body></html>'
    );
  }
  const templateVars = {
    urls: urlsForUser(req.session["user_id"], urlDatabase),
    user: users[req.session["user_id"]],
  };
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  const user = users[req.session["user_id"]];
  if (user) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// app.js
app.get("/login", (req, res) => {
  const user = users[req.session["user_id"]];
  if (user) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: user,
    };
    res.render("login", templateVars);
  }
});

app.get("/register", (req, res) => {
  const user = users[req.session["user_id"]];
  if (user) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: user,
    };
    res.render("registration", templateVars);
  }
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.status(400).send("Email or password cannot be empty.");
    return;
  }
  if (getUserByEmail(email, users)) {
    res.status(400).send("Email already exists.");
    return;
  }
  const userId = generateRandomString(7);
  users[userId] = {
    id: userId,
    email: email,
    password: bcrypt.hashSync(password, 10),
  };
  console.log(users);
  req.session.user_id = userId;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const user = users[req.session["user_id"]];
  if (!user) {
    res.send("You must login/register");
  } else {
    const id = generateRandomString(6);
    const obj = { longURL: longURL, userID: user.id };
    urlDatabase[id] = obj;
    res.redirect(`/urls/${id}`);
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  if (!user) {
    res.status(403).send("Email not found.");
    return;
  }
  if (!bcrypt.compareSync(password, user.password)) {
    res.status(403).send("Incorrect password.");
    return;
  }
  req.session.user_id = user.id;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  if (!req.session["user_id"]) {
    res.redirect("/login");
    return;
  }
  if (
    urlDatabase[shortURL] &&
    urlDatabase[shortURL].userID === req.session["user_id"]
  ) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.redirect("/urls");
  }
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  if (urlDatabase[shortURL].userID === req.session["user_id"]) {
    urlDatabase[shortURL].longURL = longURL;
    res.redirect("/urls");
    console.log("urlDatabase: ", urlDatabase);
  } else if (!req.session["user_id"]) {
    res.redirect("/urls");
  } else if (!urlDatabase[shortURL]) {
    res.redirect("/urls");
  } else {
    res.send("You are not allowed to edit it");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
