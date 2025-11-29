const mongoose = require('mongoose');


const riderSchema = new mongoose.Schema({
// Do NOT store Aadhar number. Only keep a flag that it was verified.
aadharVerified: { type: Boolean, default: false },
panUrl: { type: String },
dlUrl: { type: String },
selfieUrl: { type: String },
name: { type: String, required: true },
dob: { type: Date },
primaryPhone: { type: String, required: true },
secondaryPhone: { type: String },
email: { type: String },
city: { type: String, required: true },
area: { type: String, required: true },
vehicleType: {
type: String,
enum: ['ev', 'bike', 'scooty'],
required: true,
},
address: { type: String },
//store license number or PAN number if required by law. If sensitive, avoid storing raw values.
// dlNumber: { type: String },
// panNumber: { type: String },
createdAt: { type: Date, default: Date.now },
status: { type: String, enum: ['pending', 'active', 'rejected'], default: 'pending' },
});


module.exports = mongoose.model('Rider', riderSchema);