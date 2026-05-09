const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates]
});
.
const GUILD_ID = "1125804223049777265";
const CHANNEL_ID = "1125804223926374453";

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  const guild = await client.guilds.fetch(GUILD_ID);
  const channel = guild.channels.cache.get(CHANNEL_ID);

  if (!channel) return console.log("Channel not found");

  joinVoiceChannel({
    channelId: CHANNEL_ID,
    guildId: GUILD_ID,
    adapterCreator: guild.voiceAdapterCreator,
  });

  console.log("Bot joined VC and will stay there 🧷");
});

client.login("process.env.TOKEN");            

