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

async function getPrice() {
  const url = `https://api.dexscreener.com/latest/dex/tokens/${TOKEN_MINT}`;
  const res = await axios.get(url);

  const pair = res.data.pairs?.[0];
  if (!pair) return null;

  return parseFloat(pair.priceUsd);
}

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase().startsWith("how much")) {
    const amount = parseFloat(message.content.split(" ")[2]);

    if (isNaN(amount)) {
      return message.reply("❌ Use: how much 10");
    }

    const price = await getPrice();
    if (!price) return message.reply("❌ Price not found");

    const total = amount * price;

    message.reply(
      `💰 1 token = $${price}\n🧮 ${amount} tokens = **$${total.toFixed(
        4
      )} USD**`
    );
  }
});

client.login(process.env.TOKEN);
