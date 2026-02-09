module.exports.generatePartnerId = () => {
  const ts = Date.now().toString();
  return "DP" + ts.slice(-6); // Max length = 8
};
