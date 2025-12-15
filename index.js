require('dotenv').config();
const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] 
});

const ADMIN_CHANNEL_ID = '1449370698295410730';
const PUBLIC_CHANNEL_ID = '1449369790278930463';

// Track users who already submitted
const submissions = new Map();

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const isAdmin = interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);

    // --- Wishlist command ---
    if (interaction.commandName === 'wishlist') {
        const message = interaction.options.getString('message');
        if (!message) return interaction.reply({ content: 'You must provide a message!', ephemeral: true });

        // Check if user already submitted
        if (submissions.has(interaction.user.id)) {
            return interaction.reply({ content: '❌ You have already submitted a message!', ephemeral: true });
        }

        try {
            // Send full wishlist to admin channel
            const adminChannel = await client.channels.fetch(ADMIN_CHANNEL_ID);
            if (adminChannel) {
                await adminChannel.send(`📌 Wishlist submitted by **${interaction.user.tag}**:\n"${message}"`);
            }

            // Send public notification
            const publicChannel = await client.channels.fetch(PUBLIC_CHANNEL_ID);
            if (publicChannel) {
                await publicChannel.send(`📝 **${interaction.user.tag}** just added a message!`);
            }

            // Record submission
            submissions.set(interaction.user.id, message);

            // Confirm privately to user
            await interaction.reply({ content: '✅ Your wishlist message has been submitted!', ephemeral: true });

        } catch (err) {
            console.error(err);
            await interaction.reply({ content: 'There was an error submitting your wishlist.', ephemeral: true });
        }
    }

    // --- Reset command (admins only) ---
    if (interaction.commandName === 'resetwishlist') {
        if (!isAdmin) return interaction.reply({ content: '❌ Only admins can reset submissions!', ephemeral: true });

        const userId = interaction.options.getUser('user')?.id;
        if (!userId) return interaction.reply({ content: '❌ You must mention a user to reset.', ephemeral: true });

        if (submissions.has(userId)) {
            submissions.delete(userId);
            await interaction.reply({ content: `✅ Reset wishlist submission for <@${userId}>.`, ephemeral: true });
        } else {
            await interaction.reply({ content: '❌ That user has no submission to reset.', ephemeral: true });
        }
    }
});


const REACT_CHANNEL_ID = "1449368564829126756";
const REACTIONS = ["👍", "👎"]; // add as many as you want

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.channel.id !== REACT_CHANNEL_ID) return;

  try {
    for (const emoji of REACTIONS) {
      await message.react(emoji);
    }
  } catch (err) {
    console.error("Reaction failed:", err);
  }
});

client.login(process.env.TOKEN);
