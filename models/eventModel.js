const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    start: {                 // [YYYY, M, D, H, M]
      type: [Number],
      required: true
    },
    duration: {
      hours: { type: Number, default: 1 },
      minutes: { type: Number, default: 0 },
    },
    location: {
      type: String
    },
    company: {
      type: String
    },
    email: { 
      type: String, 
      required: true 
    }
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
