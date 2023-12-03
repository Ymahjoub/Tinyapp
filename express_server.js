const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080;


app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }

  return randomString;
}

// Routes Below 

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL
  const shortURL = generateRandomString(6)
  console.log(req.body);
  console.log(longURL);
  console.log(shortURL);
  urlDatabase[shortURL] = longURL
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id
  const longURL = urlDatabase[shortURL];

  if (!longURL) {
    res.status(404).send("short URL not found");
  } else {

    const templateVars = { id: req.params.id, longURL };
    res.render("urls_show", templateVars);
  }
});

app.get("/u/:id", (req, res) => {

  const shortURL = req.params.id
  const longURL = urlDatabase[shortURL];

  if (!longURL) {
    res.status(404).send("short URL not found");
  } else {

    res.redirect(longURL);
  }
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const newLongURL = req.body.longURL;

  if (urlDatabase.hasOwnProperty(shortURL)) {
    urlDatabase[shortURL] = newLongURL;
    res.redirect("/urls");
  } else {
    res.status(404).send("short URL not found")
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;

  if (urlDatabase.hasOwnProperty(shortURL)) {
    delete urlDatabase[shortURL];

    res.redirect("/urls");
  } else {
    res.status(404).send("short URL not found")
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const localsVars = {
    username: req.cookies["username"],
    urls: urlDatabase,
  };
  res.render("urls_index", localsVars);
});

app.post('/login', (req, res) => {
  const { username } = req.body;
  res.cookie('username', username);
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});