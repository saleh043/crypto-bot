const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent,
],
});

// Your token mint
const TOKEN_MINT = "9QYxvrwTZHKneY1tiqnq6dEAcLCp5SUUi9JkeP4fpump";

// Bot ready event
client.once("ready", () => {
console.log(`✅ Logged in as ${client.user.tag}`);
});

// Fetch token price from DexScreener
async function getPrice() {
try {
const url = `https://api.dexscreener.com/latest/dex/tokens/${TOKEN_MINT}`;
const res = await axios.get(url);

```
const pair = res.data.pairs?.[0];

if (!pair) return null;

return {
  price: parseFloat(pair.priceUsd),
  change24h: pair.priceChange?.h24 || "N/A",
  liquidity: pair.liquidity?.usd || "N/A",
  volume24h: pair.volume?.h24 || "N/A",
};
```

} catch (error) {
console.error("DexScreener Error:", error.message);
return null;
}
}

client.on("messageCreate", async (message) => {
if (message.author.bot) return;

const content = message.content.toLowerCase();

// Help command
if (content === "!help") {
return message.reply(
`📖 Commands

!price <amount> - Calculate token value
!help - Show this help message

Example:
!price 100`
);
}

// Price command
if (content.startsWith("!price")) {
const args = message.content.split(" ");
const amount = parseFloat(args[1]);

```
if (isNaN(amount)) {
  return message.reply(
    "❌ Please provide a valid amount.\nExample: !price 100"
  );
}

const tokenData = await getPrice();

if (!tokenData) {
  return message.reply(
    "❌ Unable to fetch token price right now."
  );
}

const total = amount * tokenData.price;

return message.reply(
  `💰 SWALL Price: $${tokenData.price}
```

🧮 ${amount} SWALL = $${total.toFixed(6)}

📈 24h Change: ${tokenData.change24h}%
💧 Liquidity: $${Number(tokenData.liquidity).toLocaleString()}
📊 24h Volume: $${Number(tokenData.volume24h).toLocaleString()}`
);
}
});

client.login(process.env.TOKEN);
