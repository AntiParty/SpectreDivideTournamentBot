const { SlashCommandBuilder } = require('@discordjs/builders');
const tournamentConfig = require('../config/tournament');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pick')
        .setDescription('Pick a map for the tournament')
        .addStringOption(option => 
            option.setName('map')
                .setDescription('Map to pick')
                .setRequired(true)),

    async execute(interaction) {
        const map = interaction.options.getString('map');
        const match = tournamentConfig.matches.find(
            m => m.team1.captain.id === interaction.user.id || m.team2.captain.id === interaction.user.id
        );

        if (match && match.mapPool.includes(map)) {
            match.mapPool = match.mapPool.filter(m => m !== map); // Remove the picked map from the pool
            interaction.reply(`${map} has been picked.`);
        } else {
            interaction.reply('Invalid map or already picked.');
        }
    }
};
