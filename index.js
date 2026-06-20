const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Your token mint (Solana token)
const TOKEN_MINT = "9QYxvrwTZHKneY1tiqnq6dEAcLCp5SUUi9JkeP4fpump";

// Bot ready event
client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// Get token price from DexScreener
async function getPrice() {
  try {
    const res = await axios.get(
      `https://api.dexscreener.com/latest/dex/tokens/${TOKEN_MINT}`
    );

    const pair = res.data.pairs?.[0];
    if (!pair) return null;

    return {
      price: parseFloat(pair.priceUsd),
      symbol: pair.baseToken?.symbol || "TOKEN",
    };
  } catch (err) {
    console.error("API error:", err.message);
    return null;
  }
}

// Message handler
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const args = message.content.trim().split(" ");
  const command = args[0].toLowerCase();

  // HELP COMMAND
  if (command === "!help") {
    return message.reply(
      `📖 Commands:
!price <swall amount>
!help - Show commands

Example:
!price 100`
    );
  }

  // PRICE COMMAND
  if (command === "!price") {
    const amount = parseFloat(args[1]);

    if (isNaN(amount)) {
      return message.reply("❌ Usage: !price <amount>\nExample: !price 100");
    }

    const token = await getPrice();

    if (!token) {
      return message.reply("❌ Could not fetch price right now.");
    }

    const total = amount * token.price;

    return message.reply(
      `💰 ${token.symbol} Price: $${token.price}

🧮 ${amount} ${token.symbol} = $${total.toFixed(6)} USD`
    );
  }
});

// Login
client.login(process.env.TOKEN);
