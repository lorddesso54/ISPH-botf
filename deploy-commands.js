const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const commands = [
    new SlashCommandBuilder()
        .setName('wishlist')
        .setDescription('Submit your message anonymously')
        .addStringOption(option =>
            option.setName('message')
                  .setDescription('Your wishlist message')
                  .setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName('resetwishlist')
        .setDescription('Reset a user\'s wishlist submission (admins only)')
        .addUserOption(option =>
            option.setName('user')
                  .setDescription('The user to reset')
                  .setRequired(true)
        )
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Refreshing commands...');
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, '953098019534958652'),
            { body: commands },
        );
        console.log('Commands successfully reloaded.');
    } catch (error) {
        console.error(error);
    }
})();
