const generateRandomString = (length) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const getUserByEmail = function (email, users) {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return undefined;
};

const urlsForUser = (id, urlDatabase) => {
  let userUrls = {};
  for (let i in urlDatabase) {
    if (urlDatabase[i].userID === id) {
      userUrls[i] = urlDatabase[i];
    }
  }
  return userUrls;
};

module.exports = { generateRandomString, getUserByEmail, urlsForUser };
