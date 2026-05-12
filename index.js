const { Client, Intents } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');

// ===== CONFIG =====
const TOKEN = process.env.TOKEN;
const OWNER_ID = '559382779100397589';
const GUILD_ID = '1455925088565198918';
const CHANNEL_ID = '1455925088997343278';
// ==================

if (!TOKEN) {
  console.error('❌ Missing TOKEN (use export TOKEN=...)');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// ===== READY =====
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  setTimeout(connectToVoice, 2000);
});

// ===== SAY COMMAND =====
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.author.id !== OWNER_ID) return;
  if (!message.content.startsWith('!say')) return;

  const text = message.content.slice(4).trim();
  if (!text) return;

  await message.delete().catch(console.error);
  await message.channel.send(text);
});

// ===== VOICE CONNECT =====
function connectToVoice() {
  const guild = client.guilds.cache.get(GUILD_ID);

  if (!guild) {
    console.log('❌ Guild not found');
    return setTimeout(connectToVoice, 5000);
  }

  try {
    const connection = getVoiceConnection(GUILD_ID);
    if (connection) connection.destroy();

    joinVoiceChannel({
      channelId: CHANNEL_ID,
      guildId: GUILD_ID,
      adapterCreator: guild.voiceAdapterCreator,
    });

    console.log('🔊 Connected to voice channel');
  } catch (err) {
    console.error('❌ Voice error:', err);
    setTimeout(connectToVoice, 5000);
  }
}

// ===== CLEAN RECONNECT (SAFE TIMER) =====
setInterval(() => {
  const connection = getVoiceConnection(GUILD_ID);
  if (!connection) {
    console.log('🔁 Reconnecting voice...');
    connectToVoice();
  }
}, 15000);

// ===== ERROR HANDLING =====
process.on('uncaughtException', console.error);
process.on('unhandledRejection', console.error);

// ===== LOGIN =====
client.login(TOKEN);
