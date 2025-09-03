const cron = require("node-cron");
const fetch = require("node-fetch");  // ✅ add this
const Match = require("../models/Match");

const API_KEY = process.env.SPORTMONKS_API_KEY;
const API_URL = `https://api.sportmonks.com/v3/football/fixtures/live?api_token=${API_KEY}`;

const fetchMatches = async () => {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    if (!data.data) return;

    for (let m of data.data) {
      await Match.findOneAndUpdate(
        { matchId: m.id.toString() },
        {
          matchId: m.id.toString(),
          leagueId: m.league.id,
          leagueName: m.league.name,
          leagueLogo: m.league.image_path,
          leagueCountry: m.league.country?.name,
          homeTeam: m.participants[0]?.name,
          homeLogo: m.participants[0]?.image_path,
          awayTeam: m.participants[1]?.name,
          awayLogo: m.participants[1]?.image_path,
          homeScore: m.scores?.[0]?.score?.goals ?? null,
          awayScore: m.scores?.[1]?.score?.goals ?? null,
          status: m.state?.name || "NS",
          date: m.starting_at,
        },
        { upsert: true, new: true }
      );
    }

    console.log("✅ Matches updated");
  } catch (err) {
    console.error("❌ Error fetching matches:", err.message);
  }
};

// Run every 9 seconds
cron.schedule("*/9 * * * * *", fetchMatches);
