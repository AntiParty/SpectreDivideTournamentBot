const tournamentConfig = require('../config/tournament');

function registerTeam(teamName, captain) {
    if (tournamentConfig.teams.length >= tournamentConfig.maxTeams) {
        throw new Error('Maximum team limit reached.');
    }

    const team = { name: teamName, captain, isActive: true };
    tournamentConfig.teams.push(team);
    return team;
}

function createMatch(team1, team2) {
    const match = {
        team1,
        team2,
        mapPool: [...require('../config/mapPool')],
        turn: team1.captain.id, // Start with team1's captain's turn
    };
    tournamentConfig.matches.push(match);
    return match;
}

module.exports = { registerTeam, createMatch };
