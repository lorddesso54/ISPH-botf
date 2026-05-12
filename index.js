const { Client, Collection, Intents } = require('discord.js');
const { token } = require('./config.json');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// Command handler
const commands = new Collection();

const loadCommands = async () => {
  const commandFiles = await fs.readdirSync('./commands');
  for (const file of commandFiles) {
    if (file.endsWith('.js')) {
      const command = require(`./commands/${file}`);
      commands.set(command.name, command);
    }
  }
};

// Event handlers
client.on('ready', () => {
  console.log('Bot is ready!');
});

client.on('messageCreate', (message) => {
  if (message.author.bot) return;
  const commandName = message.content.trim().split(' ')[0].toLowerCase();
  if (commands.has(commandName)) {
    commands.get(commandName).run(client, message);
  }
});

// Load commands
loadCommands();

client.login(token);      voiceConnection.destroy();
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
