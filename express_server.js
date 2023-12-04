const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();

const PORT = 8080;

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const users = {};

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
// Helper function 
function getUserByEmail(email) {
  //looping over users using for in loop
  for (let userId in users) { 
    //getting user by ID
    const user = users[userId]
    //checking if users email matches
    if (user.email === email) {
      //returning users if matching 
      return user
    }
  }
  // return null if no matching users
  return null
};

// Routes Below 

app.get("/", (req, res) => {
  res.send("Hello!");
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
  // getting userId from the cookie
  const userId = req.cookies.user_id;
  //getting user object
  const user = users[userId];

  const localsVars = {
    user,
    urls: urlDatabase,
  };

  res.render("urls_new", localsVars);
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

  // getting userId from the cookie
  const userId = req.cookies.user_id;
  //getting user object
  const user = users[userId];

  const localsVars = {
    user,
    urls: urlDatabase,
  };

  res.render("urls_index", localsVars);
});

app.post('/login', (req, res) => {
  //get email and password from request body
  const { email, password } = req.body;
  const user = getUserByEmail(email) 
  //checking if user exists
  if (!user) {
    //if not return error
    return res.status(403).json({error: 'user does not exist'})
  }; 
  //checking if passwords match
  if (user.password !== password) {
    //if not return error
    return res.status(403).json({error: 'incorrect password'})
  };
  // set cookie to user_id
  res.cookie('user_id', user.id);
  //redirecting to urls page
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login')
});

app.get("/register", (req, res) => {
  // getting userId from the cookie
  const userId = req.cookies.user_id;
  //getting user object
  const user = users[userId];

  const localsVars = {
    user,
  };

  res.render("register", localsVars);
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;

  console.log(users)

  // return 400 if email or password are empty 
  if (!email || !password) {
    return res.status(400).json({error: 'Email or Password cannot be empty'});
  } 
  const user = getUserByEmail(email)
  // check if the email is already in use 
  if (user) {
    //send back a response with 400 code for same email
    return res.status(400).json({error: 'Email is already in use'});
  }
  // generate a random user ID
  const userId = generateRandomString(10);

  //create a new user object
  const newUser = {
    id: userId,
    email: email,
    password: password
  };

  // add the new user to the global users object
  users[userId] = newUser;

  // set the user_id cookie
  res.cookie('user_id', userId);

  //redirect to the /urls page
  res.redirect('/urls');

  // log it 
  console.log(' New user registered:', newUser);
})

app.get("/login", (req,res) => {
  // getting userId from the cookie
  const userId = req.cookies.user_id;
  //getting user object
  const user = users[userId];

  const localsVars = {
    user,
  };

  res.render('login', localsVars)
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});