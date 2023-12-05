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
function getUserByEmail(email, database) {
  //looping over users using for in loop
  for (let userId in database) {
    //getting user by ID
    const user = database[userId]
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
function urlsForUser(id, database) {

  // new url database 
  const usersURLDatabase = {};

  // loop over urls database values using for in loop
  for (let shortURL in database) {
    // checking if shortURL belongs to user with id
    if (database[shortURL].userId === id) {

      // Adding urls that belong to the userId to a new database
      usersURLDatabase[shortURL] = database[shortURL]
    }
  };
  // return statement 
  return usersURLDatabase
};

module.exports = { generateRandomString, getUserByEmail, urlsForUser }
