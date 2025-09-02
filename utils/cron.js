const cron = require("node-cron");
const fetch = require("node-fetch");
const Match = require("../models/Match");
require("dotenv").config();

const API_URL = "https://api-football-v1.p.rapidapi.com/v3/fixtures?live=all";
const API_HEADERS = {
  "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
  "x-rapidapi-key": process.env.RAPIDAPI_KEY, // store in .env
};

const fetchMatches = async () => {
  try {
    const res = await fetch(API_URL, { headers: API_HEADERS });
    const data = await res.json();

    if (!data.response) {
      console.log("⚠️ No matches found");
      return;
    }

    for (let m of data.response) {
      await Match.findOneAndUpdate(
        { matchId: m.fixture.id.toString() },
        {
          matchId: m.fixture.id.toString(),
          league: m.league.name,
          homeTeam: m.teams.home.name,
          awayTeam: m.teams.away.name,
          homeScore: m.goals.home,
          awayScore: m.goals.away,
          status: m.fixture.status.short, // NS, 1H, 2H, FT etc
          date: m.fixture.date,
        },
        { upsert: true, new: true }
      );
    }

    console.log("✅ Matches updated at", new Date().toLocaleTimeString());
  } catch (err) {
    console.error("❌ Error fetching matches:", err.message);
  }
};

// Run every 5 seconds
cron.schedule("*/5 * * * * *", fetchMatches);
