function generateRandomString(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const getUserByEmail = function (email, users) {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return undefined;
};

let urlsForUser = (id) => {
  for (let i in urlDatabase) {
    if (urlDatabase[i].userID === id) {
      return urlDatabase[i].longURL;
    }
  }
  return null;
};

module.exports = { generateRandomString, getUserByEmail, urlsForUser };

module.exports = { generateRandomString, getUserByEmail, urlsForUser };
