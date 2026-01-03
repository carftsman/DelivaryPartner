const Tesseract = require("tesseract.js");

async function extractTextFromBuffer(buffer) {
  const { data } = await Tesseract.recognize(buffer, "eng");
  return data.text;
}

function extractPAN(text) {
  return text.match(/[A-Z]{5}[0-9]{4}[A-Z]/)?.[0] || null;
}

function extractDL(text) {
  return text.match(/[A-Z]{2}[0-9]{2}[0-9]{11}/)?.[0] || null;
}
