const mongoose = require("mongoose");

const MatchSchema = new mongoose.Schema({
  matchId: { type: String, unique: true },
  league: String,
  homeTeam: String,
  awayTeam: String,
  homeLogo: String, 
  awayLogo: String,  
  homeScore: Number,
  awayScore: Number,
  status: String,
  date: Date,
});

module.exports = mongoose.model("Match", MatchSchema);
