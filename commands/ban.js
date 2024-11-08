const { SlashCommandBuilder } = require('@discordjs/builders');
const tournamentConfig = require('../config/tournament');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a map for the tournament')
        .addStringOption(option => 
            option.setName('map')
                .setDescription('Map to ban')
                .setRequired(true)),

    async execute(interaction) {
        const map = interaction.options.getString('map');
        const match = tournamentConfig.matches.find(
            m => m.team1.captain.id === interaction.user.id || m.team2.captain.id === interaction.user.id
        );

        // Ensure this is a valid match and it’s the correct player's turn
        if (!match) return interaction.reply({ content: 'You are not in an active match.', ephemeral: true });
        if (match.turn !== interaction.user.id) return interaction.reply({ content: 'It’s not your turn to ban a map.', ephemeral: true });
        if (!match.mapPool.includes(map)) return interaction.reply({ content: 'Invalid map or already banned.', ephemeral: true });

        // Ban the map
        match.mapPool = match.mapPool.filter(m => m !== map);
        interaction.reply(`${map} has been banned.`);

        // Check if only one map remains
        if (match.mapPool.length === 1) {
            const finalMap = match.mapPool[0];
            interaction.channel.send(`Only one map remains! The chosen map for this match is **${finalMap}**.`);
            match.mapPool = []; // Clear the pool as the map has been selected
        } else {
            // Switch turns to the other captain
            match.turn = (match.turn === match.team1.captain.id) ? match.team2.captain.id : match.team1.captain.id;
            interaction.channel.send(`<@${match.turn}>, it’s your turn to ban a map.`);
        }
    }
};