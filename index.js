const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");

// Create bot client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Your token mint
const TOKEN_MINT = "9QYxvrwTZHKneY1tiqnq6dEAcLCp5SUUi9JkeP4fpump";

// Bot ready
client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// Get price from DexScreener
async function getPrice() {
  try {
    const res = await axios.get(
      "https://api.dexscreener.com/latest/dex/tokens/" + TOKEN_MINT
    );

    const pair = res.data.pairs?.[0];
    if (!pair) return null;

    return {
      price: Number(pair.priceUsd),
      symbol: pair.baseToken?.symbol || "TOKEN",
    };
  } catch (err) {
    console.log("Error:", err.message);
    return null;
  }
}

// Commands
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const args = message.content.trim().split(" ");
  const cmd = args[0].toLowerCase();

  // PRICE COMMAND
  if (cmd === "!price") {
    const amount = Number(args[1]);

    if (isNaN(amount)) {
      return message.reply("❌ Usage: !price <amount> (example: !price 100)");
    }

    const token = await getPrice();

    if (!token) {
      return message.reply("❌ Price not available right now.");
    }

    const total = amount * token.price;

    return message.reply(
      "💰 " + token.symbol + " Price: $" + token.price + "\n\n" +
      "🧮 " + amount + " = $" + total.toFixed(6) + " USD"
    );
  }
});

// LOGIN (IMPORTANT)
client.login(process.env.TOKEN);
