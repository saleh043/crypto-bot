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
    const response = await axios.get(
      "https://api.dexscreener.com/latest/dex/tokens/" + TOKEN_MINT
    );

    const pair = response.data.pairs?.[0];

    if (!pair) return null;

    return {
      price: Number(pair.priceUsd),
      symbol: pair.baseToken?.symbol || "SWALL",
      name: pair.baseToken?.name || "SWALL",
    };
  } catch (error) {
    console.error("Price fetch error:", error.message);
    return null;
  }
}

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const args = message.content.trim().split(/\s+/);
  const command = args[0].toLowerCase();

  if (command === "!price") {
    const amount = Number(args[1]);

    if (isNaN(amount)) {
      return message.reply(
        "❌ Usage: !price <amount>\nExample: !price 100"
      );
    }

    const token = await getPrice();

    if (!token) {
      return message.reply("❌ Unable to fetch token price.");
    }

    const total = amount * token.price;

    return message.reply(
      "💰 " + token.name + " (" + token.symbol + ")\n\n" +
      "📈 Current Price: $" + token.price + "\n" +
      "🧮 " + amount + " " + token.symbol + " = $" + total.toFixed(6) + " USD"
    );
  }
});

if (!process.env.TOKEN) {
  console.error("❌ TOKEN environment variable not found.");
  process.exit(1);
}

client.login(process.env.TOKEN);
