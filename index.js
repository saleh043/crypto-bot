const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Your token mint (Solana)
const TOKEN_MINT = "9QYxvrwTZHKneY1tiqnq6dEAcLCp5SUUi9JkeP4fpump";

// Bot ready
client.once("ready", () => {
  console.log("✅ Bot is online as " + client.user.tag);
});

// Fetch price
async function getPrice() {
  try {
    const res = await axios.get(
      "https://api.dexscreener.com/latest/dex/tokens/" + TOKEN_MINT
    );

    const pair = res.data.pairs && res.data.pairs[0];
    if (!pair) return null;

    return {
      price: Number(pair.priceUsd),
      symbol: pair.baseToken?.symbol || "TOKEN",
    };
  } catch (err) {
    console.log("API error:", err.message);
    return null;
  }
}

// Messages
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const args = message.content.trim().split(" ");
  const command = args[0].toLowerCase();

  // HELP
  if (command === "!help") {
    return message.reply(
      "📖 Commands:\n\n" +
      "!price <swall amount>" +
      "!help - Show help\n\n" +
      "Example:\n!price 100"
    );
  }

  // PRICE
  if (command === "!price") {
    const amount = Number(args[1]);

    if (!amount || isNaN(amount)) {
      return message.reply("❌ Usage: !price <amount>\nExample: !price 100");
    }

    const token = await getPrice();

    if (!token) {
      return message.reply("❌ Could not fetch price right now.");
    }

    const total = amount * token.price;

    const msg =
      "💰 " + token.symbol + " Price: $" + token.price + "\n\n" +
      "🧮 " + amount + " " + token.symbol + " = $" + total.toFixed(6) + " USD";

    return message.reply(msg);
  }
});

// Login
client.login(process.env.TOKEN);
