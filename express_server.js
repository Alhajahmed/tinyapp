const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.status(400).send("Email or password cannot be empty.");
    return;
  }
  if (getUserByEmail(email)) {
    res.status(400).send("Email already exists.");
    return;
  }
  const userId = generateRandomString(7);
  users[userId] = {
    id: userId,
    email: email,
    password: password,
  };
  console.log(users);
  res.cookie("user_id", userId);
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const user = users[req.cookies["user_id"]];
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
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email);
  if (!user) {
    res.status(403).send("Email not found.");
    return;
  }
  if (password !== user.password) {
    res.status(403).send("Incorrect password.");
    return;
  }
  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  if (urlDatabase[shortURL].userID === req.cookies["user_id"]) {
    delete urlDatabase[shortURL];
  } else if (!req.cookies["user_id"]) {
    res.redirect("/urls");
  } else if (!urlDatabase[shortURL]) {
    res.redirect("/urls");
  } else {
    res.send("You are not allowed to delete it");
  }
});
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  if (urlDatabase[shortURL].userID === req.cookies["user_id"]) {
    urlDatabase[shortURL].longURL = longURL;
    res.redirect("/urls");
    console.log("urlDatabase: ", urlDatabase);
  } else if (!req.cookies["user_id"]) {
    res.redirect("/urls");
  } else if (!urlDatabase[shortURL]) {
    res.redirect("/urls");
  }
  res.send("You are not allowed to edit it");
});
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
  const user = users[req.cookies["user_id"]];
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
  const templateVars = {
    user: users[req.cookies["user_id"]],
    id: req.params.id,
    longURL: urlsForUser(req.cookies["user_id"]),
  };
  console.log(urlsForUser(req.cookies["user_id"]));
  console.log(req.cookies["user_id"]);
  console.log(urlDatabase);
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.send(
      '<html><body><h1>Please log in <a href="/login">login</a> </h1></body></html>\n'
    );
  }
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
// app.js
app.get("/login", (req, res) => {
  const user = users[req.cookies["user_id"]];
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
  const user = users[req.cookies["user_id"]];
  if (user) {
    res.redirect("/urls");
  } else {
    res.render("registration");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
const getUserByEmail = function (email) {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
};

let urlsForUser = (id) => {
  for (let i in urlDatabase) {
    if (urlDatabase[i].userID === id) {
      return urlDatabase[i].longURL;
    }
  }
  return null;
};
