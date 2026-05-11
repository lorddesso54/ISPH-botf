const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates]
});

const GUILD_ID = "1455925088565198918";
const CHANNEL_ID = "1455925088997343278";

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  const guild = await client.guilds.fetch(GUILD_ID);

  try {
    // Check if already connected
    if (!getVoiceConnection(GUILD_ID)) {
      await joinVoiceChannel({
        channelId: CHANNEL_ID,
        guildId: GUILD_ID,
        adapterCreator: guild.voiceAdapterCreator,
      });
      console.log("Joined voice channel successfully");
    }
  } catch (error) {
    console.error("Error joining voice channel:", error);
  }
});

client.on('voiceStateUpdate', async (oldState, newState) => {
  // If the bot was disconnected
  if (oldState.member.id === client.user.id && !newState.channel) {
    console.log("⚠️ Got disconnected... rejoining");
    const guild = oldState.guild;

    try {
      if (!getVoiceConnection(GUILD_ID)) {
        await joinVoiceChannel({
          channelId: CHANNEL_ID,
          guildId: GUILD_ID,
          adapterCreator: guild.voiceAdapterCreator,
        });
        console.log("Rejoined voice channel");
      }
    } catch (error) {
      console.error("Error rejoining voice channel:", error);
    }
  }
});

client.login(process.env.TOKEN);  }
});

client.login(process.env.TOKEN);
