const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates]
});

const GUILD_ID = "1455925088565198918";
const CHANNEL_ID = "1455925088997343278";

client.once('ready', async () => {
 console.log(`Logged in as ${client.user.tag}`);

  const guild = await client.guilds.fetch(GUILD_ID);

  joinVoiceChannel({
    channelId: CHANNEL_ID,
    guildId: GUILD_ID,
    adapterCreator: guild.voiceAdapterCreator,
  });

  console.log("Bot joined VC and will stay there 🧷");
});

client.on('voiceStateUpdate', (oldState, newState) => {
  // Check if it's the bot that got disconnected
  if (oldState.member.id === client.user.id && !newState.channel) {
    console.log("⚠️ Got disconnected... rejoining");

    const guild = oldState.guild;

    joinVoiceChannel({
      channelId: "1125804223926374453", // your VC ID
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
    });
  }
});

client.login(process.env.TOKEN);
