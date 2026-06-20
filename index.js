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
console.log(`✅ Logged in as ${client.user.tag}`);
});

async function getPrice() {
try {
const response = await axios.get(
`https://api.dexscreener.com/latest/dex/tokens/${TOKEN_MINT}`
);

```
const pair = response.data.pairs?.[0];

if (!pair) return null;

return {
  price: parseFloat(pair.priceUsd),
  name: pair.baseToken?.name || "SWALL",
  symbol: pair.baseToken?.symbol || "SWALL",
};
```

} catch (error) {
console.error("Error fetching price:", error.message);
return null;
}
}

client.on("messageCreate", async (message) => {
if (message.author.bot) return;

const args = message.content.trim().split(" ");
const command = args[0].toLowerCase();

if (command === "!help") {
return message.reply(
"📖 Commands:\n\n" +
"!price <amount> - Calculate token value\n" +
"!help - Show commands\n\n" +
"Example:\n!price 100"
);
}

if (command === "!price") {
const amount = parseFloat(args[1]);

```
if (isNaN(amount)) {
  return message.reply(
    "❌ Please enter a valid amount.\nExample: !price 100"
  );
}

const token = await getPrice();

if (!token) {
  return message.reply(
    "❌ Could not fetch token price right now."
  );
}

const total = amount * token.price;

return message.reply(
  `💰 ${token.symbol} Price: $${token.price}
```

🧮 ${amount} ${token.symbol} = $${total.toFixed(6)} USD`
);
}
});

client.login(process.env.TOKEN);
