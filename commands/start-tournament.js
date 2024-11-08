const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { registerTeam, createMatch } = require('../utils/matchUtils');
const tournamentConfig = require('../config/tournament');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('start-tournament')
        .setDescription('Register teams and start map pick/ban for the tournament')
        .addStringOption(option => 
            option.setName('teamname')
                .setDescription('The name of the team')
                .setRequired(true))
        .addUserOption(option => 
            option.setName('captain')
                .setDescription('The captain of the team')
                .setRequired(true)),

    async execute(interaction) {
        const teamName = interaction.options.getString('teamname');
        const captain = interaction.options.getUser('captain');

        try {
            const team = registerTeam(teamName, captain);
            interaction.reply({ content: `${teamName} registered successfully!`, ephemeral: true });

            // If two or more teams are registered, start pairing for matches
            if (tournamentConfig.teams.length >= 2) {
                const [team1, team2] = tournamentConfig.teams.slice(-2); // Get last two teams to pair up

                const match = createMatch(team1, team2);
                const tournamentChannel = interaction.channel;
                const thread = await tournamentChannel.threads.create({
                    name: `Map Pick/Ban - ${team1.name} vs ${team2.name}`,
                    autoArchiveDuration: 60,
                    type: 'GUILD_PRIVATE_THREAD'
                });

                await thread.members.add(team1.captain.id);
                await thread.members.add(team2.captain.id);

                const embed = new MessageEmbed()
                    .setTitle(`Map Pick/Ban Phase: ${team1.name} vs ${team2.name}`)
                    .setDescription('Captains, please use the commands /pick or /ban to select or ban maps.')
                    .addField('Available Maps', match.mapPool.join(', '))
                    .setColor('BLUE');

                await thread.send({ content: `Welcome ${team1.captain} and ${team2.captain}`, embeds: [embed] });
            }
        } catch (error) {
            interaction.reply({ content: error.message, ephemeral: true });
        }
    }
};
