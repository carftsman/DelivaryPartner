const admin = require("../config/firebase");

const sendToDevice = async ({ token, title, body, data = {} }) => {
  const message = {
    token,
    notification: { title, body },
    data,
  };

  return admin.messaging().send(message);
};

const sendToMultiple = async ({ tokens, title, body, data = {} }) => {
  const message = {
    tokens,
    notification: { title, body },
    data,
  };

  return admin.messaging().sendMulticast(message);
};

const sendToTopic = async ({ topic, title, body, data = {} }) => {
  const message = {
    topic,
    notification: { title, body },
    data,
  };

  return admin.messaging().send(message);
};

module.exports = {
  sendToDevice,
  sendToMultiple,
  sendToTopic,
};
