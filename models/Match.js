const mongoose = require("mongoose");

const MatchSchema = new mongoose.Schema({
  matchId: { type: String, unique: true },
  
  // League info
  leagueId: String,
  leagueName: String,
  leagueLogo: String,
  leagueCountry: String,
  
  // Teams
  homeTeam: String,
  awayTeam: String,
  homeLogo: String,
  awayLogo: String,
  
  // Scores
  homeScore: Number,
  awayScore: Number,
  
  // Status & time
  status: String,
  date: Date,
});

module.exports = mongoose.model("Match", MatchSchema);
