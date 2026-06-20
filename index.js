const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const TOKEN_MINT = "9QYxvrwTZHKneY1tiqnq6dEAcLCp5SUUi9JkeP4fpump";

client.once("ready", () => {
  console.log("✅ Bot online as " + client.user.tag);
});

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

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const args = message.content.trim().split(" ");
  const cmd = args[0].toLowerCase();

  // HELP COMMAND
  if (cmd === "!help") {
    return message.reply(
      "📖 Commands:\n\n" +
      "!price <amount> - Calculate token value\n" +
      "!help - Show commands\n\n" +
      "Example:\n!price 100"
    );
  }

  // PRICE COMMAND
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

    return message.reply(
      "💰 " + token.symbol + " Price: $" + token.price +
      "\n\n🧮 " + amount + " " + token.symbol + " = $" + total.toFixed(6) + " USD"
    );
  }
});

client.login(process.env.TOKEN);
