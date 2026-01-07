const mongoose = require("mongoose");

const { Schema } = mongoose;
 
const RiderAssetsSchema = new Schema(

  {

    riderId: {

      type: Schema.Types.ObjectId,

      ref: "Rider",

      required: true,

      unique: true, // one asset record per rider

    },
 
    assets: [

      {

        assetType: {

          type: String,

          enum: ["T_SHIRT", "BAG", "HELMET", "JACKET", "ID_CARD", "OTHER"],

          required: true,

        },
 
        assetName: {

          type: String, // e.g. "T-Shirt Size L"

        },
 
        quantity: {

          type: Number,

          default: 1,

        },
 
        issuedDate: {

          type: Date,

          default: Date.now,

        },
 
        status: {

          type: String,

          enum: ["ISSUED", "RETURNED", "LOST"],

          default: "ISSUED",

        },
 
        returnedDate: {

          type: Date,

        },

      },

    ],
 
    issuedBy: {

      type: Schema.Types.ObjectId,

      ref: "Admin",

    },
 
    remarks: String,

  },

  { timestamps: true }

);
 
module.exports = mongoose.model("RiderAssets", RiderAssetsSchema);

 