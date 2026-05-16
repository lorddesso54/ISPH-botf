const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection, VoiceConnectionStatus, entersState } = require('@discordjs/voice');

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
    GatewayIntentBits.GuildVoiceStates,
  ],
});

let reconnecting = false; // Prevent overlapping reconnect attempts

// ===== VOICE CONNECT =====
async function connectToVoice() {
  if (reconnecting) return;
  reconnecting = true;

  const guild = client.guilds.cache.get(GUILD_ID);
  if (!guild) {
    console.log('❌ Guild not found, retrying in 5s...');
    reconnecting = false;
    return setTimeout(connectToVoice, 5000);
  }

  try {
    // Destroy any existing connection first
    const existing = getVoiceConnection(GUILD_ID);
    if (existing) existing.destroy();

    const connection = joinVoiceChannel({
      channelId: CHANNEL_ID,
      guildId: GUILD_ID,
      adapterCreator: guild.voiceAdapterCreator,
      selfDeaf: true,   // Keeps the bot deafened (less likely to be kicked by bots/admin tools)
      selfMute: false,
    });

    // Wait until the connection is actually ready
    await entersState(connection, VoiceConnectionStatus.Ready, 15_000);
    console.log('🔊 Connected to voice channel');

    // ===== HANDLE DISCONNECT EVENTS ON THE CONNECTION =====
    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      console.log('⚠️ Disconnected — attempting to recover...');
      try {
        // Discord sometimes disconnects briefly; try to reconnect before destroying
        await Promise.race([
          entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
          entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
        ]);
        // Recovered automatically
        console.log('✅ Recovered from disconnect');
      } catch {
        // Could not recover — destroy and do a full reconnect
        connection.destroy();
        reconnecting = false;
        console.log('🔁 Full reconnect triggered');
        setTimeout(connectToVoice, 2000);
      }
    });

    connection.on(VoiceConnectionStatus.Destroyed, () => {
      console.log('💀 Connection destroyed — reconnecting...');
      reconnecting = false;
      setTimeout(connectToVoice, 2000);
    });

  } catch (err) {
    console.error('❌ Voice error:', err.message);
    reconnecting = false;
    setTimeout(connectToVoice, 5000);
  }

  reconnecting = false;
}

// ===== CATCH BOT BEING MOVED OR KICKED VIA VOICE STATE =====
client.on('voiceStateUpdate', (oldState, newState) => {
  // Only care about our bot's voice state
  if (oldState.member?.id !== client.user?.id) return;

  // Bot was disconnected (moved to null channel = kicked/disconnected)
  if (oldState.channelId && !newState.channelId) {
    console.log('🚫 Bot was kicked from voice — reconnecting...');
    reconnecting = false;
    setTimeout(connectToVoice, 2000);
  }

  // Bot was moved to a different channel — rejoin the correct one
  if (newState.channelId && newState.channelId !== CHANNEL_ID) {
    console.log('↩️ Bot was moved — returning to original channel...');
    reconnecting = false;
    setTimeout(connectToVoice, 1000);
  }
});

// ===== FALLBACK INTERVAL (catches any edge cases) =====
setInterval(() => {
  const connection = getVoiceConnection(GUILD_ID);
  const isHealthy =
    connection &&
    connection.state.status !== VoiceConnectionStatus.Destroyed &&
    connection.state.status !== VoiceConnectionStatus.Disconnected;

  if (!isHealthy && !reconnecting) {
    console.log('🔁 Fallback: reconnecting voice...');
    connectToVoice();
  }
}, 15_000);

// ===== READY =====
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  setTimeout(connectToVoice, 2000);
});

// ===== ERROR HANDLING =====
process.on('uncaughtException', console.error);
process.on('unhandledRejection', console.error);

// ===== LOGIN =====
client.login(TOKEN);
