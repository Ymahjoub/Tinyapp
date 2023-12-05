const express = require("express");
const cookieSession = require('cookie-session')
const bcrypt = require("bcryptjs");
const app = express();

const PORT = 8080;

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['MySecret']
}));

const users = {};

const urlDatabase = {};

// Helper function
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

//Helper function 
function urlsForUser(id) {

  // new url database 
  const usersURLDatabase = {};

  // loop over urls database values using for in loop
  for (let shortURL in urlDatabase) {
    // checking if shortURL belongs to user with id
    if (urlDatabase[shortURL].userId === id) {

      // Adding urls that belong to the userId to a new database
      usersURLDatabase[shortURL] = urlDatabase[shortURL]
    }
  };
  // return statement 
  return usersURLDatabase
};

// Routes Below 

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.post("/urls", (req, res) => {
  // getting userId from the cookie
  const userId = req.session.user_id;
  //getting user object
  const user = users[userId];
  if (!user) {
    res.set("Content-Type", 'text/html');
    res.send('<p>ERROR: Unauthorized</p>')
  }
  const longURL = req.body.longURL
  const shortURL = generateRandomString(6)
  console.log(req.body);
  console.log(longURL);
  console.log(shortURL);
  // urlDatabase[shortURL] = longURL
  urlDatabase[shortURL] = {
    longURL,
    userId,
  };
  res.redirect("urls")
});

app.get("/urls/new", (req, res) => {
  // getting userId from the cookie
  const userId = req.session.user_id;
  //getting user object
  const user = users[userId];

  const localsVars = {
    user,
    urls: urlDatabase,
  };

  if (!user) {
    res.redirect('/login');
  }

  res.render("urls_new", localsVars);
});

app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id
  const urlData = urlDatabase[shortURL]


  // getting userId from the cookie
  const userId = req.session.user_id;
  //getting user object
  const user = users[userId];

  if (!user) {
    //if not return error
    return res.send("<html><body> <b>401 ERROR:</b> Please Login or Register to continue</body></html>\n");
  };

  if (!urlData) {
    return res.status(404).send("short URL not found");
  }

  if (urlData.userId !== userId) {
    return res.send("<html><body> <b>403 ERROR:</b> Unauthorized </body></html>\n");
  };

  const templateVars = { id: req.params.id, longURL: urlData.longURL };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {

  const shortURL = req.params.id
  const longURL = urlDatabase[shortURL].longURL;

  if (!longURL) {
    res.status(404).send("short URL not found");
  } else {

    res.redirect(longURL);
  }
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const newLongURL = req.body.longURL;

  // getting userId from the cookie
  const userId = req.session.user_id;
  //getting user object
  const user = users[userId];

  if (!user) {
    //if not return error
    return res.send("<html><body> <b>401 ERROR:</b> Please Login or Register to continue</body></html>\n");
  };

  if (urlDatabase.hasOwnProperty(shortURL)) {
    const urlData = urlDatabase[shortURL]
    if (userId !== urlData.userId) {
      return res.send("<html><body> <b>403 ERROR:</b> Unauthorized </body></html>\n");
    }
    urlData.longURL = newLongURL;
    res.redirect("/urls");
  } else {
    res.status(404).send("short URL not found")
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;

  // getting userId from the cookie
  const userId = req.session.user_id;
  //getting user object
  const user = users[userId];

  if (!user) {
    //if not return error
    return res.send("<html><body> <b>401 ERROR:</b> Please Login or Register to continue</body></html>\n");
  };

  if (urlDatabase.hasOwnProperty(shortURL)) {

    const urlData = urlDatabase[shortURL]
    if (userId !== urlData.userId) {
      return res.send("<html><body> <b>403 ERROR:</b> Unauthorized </body></html>\n");
    }

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
  const userId = req.session.user_id;
  //getting user object
  const user = users[userId];

  //getting urls For User
  const usersURLDatabase = urlsForUser(userId);

  const localsVars = {
    user,
    urls: usersURLDatabase,
  };

  if (!user) {
    //if not return error
    return res.send("<html><body> <b>401 ERROR:</b> Please Login or Register to continue</body></html>\n");
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
    return res.status(403).json({ error: 'user does not exist' })
  };
  //checking if passwords match
  if (!bcrypt.compareSync(password, user.password)) {
    //if not return error
    return res.status(403).json({ error: 'incorrect password' })
  };
  // set cookie to user_id
  req.session.user_id = user.id;
  //redirecting to urls page
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login')
});

app.get("/register", (req, res) => {
  // getting userId from the cookie
  const userId = req.session.user_id;
  //getting user object
  const user = users[userId];

  const localsVars = {
    user,
  };

  if (user) {
    res.redirect('/urls');
  }

  res.render("register", localsVars);
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  console.log(users)

  // return 400 if email or password are empty 
  if (!email || !password) {
    return res.status(400).json({ error: 'Email or Password cannot be empty' });
  }
  const user = getUserByEmail(email)
  // check if the email is already in use 
  if (user) {
    //send back a response with 400 code for same email
    return res.status(400).json({ error: 'Email is already in use' });
  }
  // generate a random user ID
  const userId = generateRandomString(10);

  //create a new user object
  const newUser = {
    id: userId,
    email: email,
    password: hashedPassword
  };

  // add the new user to the global users object
  users[userId] = newUser;

  // set the user_id cookie
  req.session.user_id = userId;

  //redirect to the /urls page
  res.redirect('/urls');

  // log it 
  console.log(' New user registered:', newUser);
})

app.get("/login", (req, res) => {
  // getting userId from the cookie
  const userId = req.session.user_id;
  //getting user object
  const user = users[userId];

  const localsVars = {
    user,
  };
  if (user) {
    res.redirect('/urls');
  }
  res.render('login', localsVars)
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});