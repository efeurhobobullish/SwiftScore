const cron = require("node-cron");
const fetch = require("node-fetch");
const Match = require("../models/Match");
require("dotenv").config();

const API_KEY = process.env.SPORTMONKS_API_KEY;
const API_URL = `https://api.sportmonks.com/v3/football/fixtures/live?api_token=${API_KEY}`;

const fetchMatches = async () => {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    if (!data.data) {
      console.log("⚠️ No matches found");
      return;
    }

    for (let m of data.data) {
      const home = m.participants?.[0];
      const away = m.participants?.[1];

      await Match.findOneAndUpdate(
        { matchId: m.id.toString() },
        {
          matchId: m.id.toString(),
          league: m.league?.name || "Unknown League",
          homeTeam: home?.name || "Home",
          awayTeam: away?.name || "Away",
          homeLogo: home?.image_path || null,   // ✅ save logo
          awayLogo: away?.image_path || null,   // ✅ save logo
          homeScore: m.scores?.localteam_score ?? 0,
          awayScore: m.scores?.visitorteam_score ?? 0,
          status: m.state?.state || "NS",
          date: m.starting_at,
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
cron.schedule("*/9 * * * * *", fetchMatches);
