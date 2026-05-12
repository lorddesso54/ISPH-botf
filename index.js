const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createVoiceConnection } = require('@discordjs/voice');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates]
});

const GUILD_ID = "1455925088565198918";
const CHANNEL_ID = "1455925088997343278";

let voiceConnection = null;

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  const guild = await client.guilds.fetch(GUILD_ID);
  const channel = guild.channels.fetch(CHANNEL_ID).then(channel => channel);

  function connectToVoice() {
    joinVoiceChannel({
      channelId: CHANNEL_ID,
      guildId: GUILD_ID,
      adapterCreator: guild.voiceAdapterCreator,
    })
      .then(connection => {
        voiceConnection = connection;
        console.log("Bot joined VC and will stay there 🧷");
      })
      .catch(error => {
        console.error("Error joining voice channel:", error);
        reconnect();
      });
  }

  function reconnect() {
    try {
      voiceConnection.destroy();
      voiceConnection = null;
      setTimeout(connectToVoice, 1000); // Wait 1 second before reconnecting
    } catch (error) {
      console.error("Error reconnecting to voice channel:", error);
      reconnect(); // Try again after 1 second
    }
  }

  connectToVoice();
});

client.on('voiceStateUpdate', (oldState, newState) => {
  // You can add logic here to handle voice state updates
});

process.on('uncaughtException', error => {
  console.error("Uncaught Exception:", error);
});

process.on('unhandledRejection', error => {
  console.error("Unhandled Rejection:", error);
});
