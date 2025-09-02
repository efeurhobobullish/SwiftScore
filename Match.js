const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
  matchId: { type: String, required: true, unique: true },
  league: { type: String },
  homeTeam: { type: String },
  awayTeam: { type: String },
  homeScore: { type: Number, default: 0 },
  awayScore: { type: Number, default: 0 },
  status: { type: String }, // NS = Not Started, LIVE, FT = Finished
  date: { type: Date },
});

module.exports = mongoose.model("Match", matchSchema);
