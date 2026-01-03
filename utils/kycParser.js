exports.extractPAN = (text) => {
  const match = text.match(/[A-Z]{5}[0-9]{4}[A-Z]{1}/);
  return match ? match[0] : null;
};

exports.extractDL = (text) => {
  const match = text.match(/[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7}/);
  return match ? match[0] : null;
};
