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

// Bot ready
client.once("ready", () => {
  console.log("✅ Bot online as " + client.user.tag);
});

// Get price from DexScreener
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

// Commands
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const args = message.content.trim().split(" ");
  const cmd = args[0].toLowerCase();

  // HELP COMMAND (nice UI)
  if (cmd === "!help") {
    return message.reply(
      "🤖 **Crypto Bot Help Menu**\n\n" +
      "📊 **Commands:**\n" +
      "• `!price <amount>` → Check token value\n" +
      "• `!help` → Show this help menu\n\n" +
      "💡 **Example:**\n" +
      "`!price 100`\n\n" +
      "⚡ This bot tracks live token price from DexScreener"
    );
  }

  // PRICE COMMAND
  if (cmd === "!price") {
    const amount = Number(args[1]);

    if (!amount || isNaN(amount)) {
      return message.reply(
        "❌ Invalid usage!\n👉 Example: `!price 100`"
      );
    }

    const token = await getPrice();

    if (!token) {
      return message.reply("❌ Could not fetch price right now.");
    }

    const total = amount * token.price;

    return message.reply(
      "💰 **" + token.symbol + " Price:** $" + token.price + "\n\n" +
      "🧮 **Calculation:**\n" +
      amount + " " + token.symbol + " = $" + total.toFixed(6) + " USD"
    );
  }
});

// Login
client.login(process.env.TOKEN);
