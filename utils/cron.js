const cron = require("node-cron");
const Match = require("../models/Match");

const API_KEY = process.env.FOOTBALL_API_KEY; // put this in .env
const API_URL = "https://v3.football.api-sports.io/fixtures?live=all";

const fetchMatches = async () => {
  try {
    const res = await fetch(API_URL, {
      headers: { "x-apisports-key": API_KEY },
    });
    const data = await res.json();

    if (!data.response) return;

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

    console.log("✅ Matches updated");
  } catch (err) {
    console.error("❌ Error fetching matches:", err.message);
  }
};

// Run every 5 seconds
cron.schedule("*/9 * * * * *", fetchMatches);
