const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Token mint (your coin)
const TOKEN_MINT = "9QYxvrwTZHKneY1tiqnq6dEAcLCp5SUUi9JkeP4fpump";

// Bot ready event
client.once("ready", () => {
  console.log("✅ Bot online as " + client.user.tag);
});

// Get price from DexScreener
async function getPrice() {
  try {
    const url = "https://api.dexscreener.com/latest/dex/tokens/" + TOKEN_MINT;
    const res = await axios.get(url);

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
  const cmd = args[0].toLowerCase();

  // HELP
  if (cmd === "!help") {
    return message.reply(
      "📖 Commands:\n\n" +
      "!price <amount>\n" +
      "!help - Show help\n\n" +
      "Example:\n!price 100"
    );
  }

  // PRICE
  if (cmd === "!price") {
    const amount = Number(args[1]);

    if (!amount || isNaN(amount)) {
      return message.reply("❌ Usage: !price <amount>\nExample: !price 100");
    }

    const token = await getPrice();

    if (!token) {
      return message.reply("❌ Could not fetch price right now.");
    }

    const total = amount * token.price;

    const response =
      "💰 " + token.symbol + " Price: $" + token.price + "\n\n" +
      "🧮 " + amount + " " + token.symbol + " = $" + total.toFixed(6) + " USD";

    return message.reply(response);
  }
});

// Login
client.login(process.env.TOKEN);
