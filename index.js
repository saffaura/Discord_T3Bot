const Discord = require('discord.js');
const config = require('./config');
const client = new Discord.Client();
const games = {};

client.once('ready', ()=> {
    console.log('Ready to play!');
});

client.on('message', message => {

    if (message.author.bot) {
        return;
    }

    // indices of available squares 
    /*
    1,   5,  9
    12, 16, 20
    23, 27, 31
    */
    
    const reply = message.content.startsWith(config.prefix) ||
                  message.content.startsWith(client.user.toString);
                  
    if (!reply) {
        return;
    }

    // check for help
    // TODO

    // check for stats (i.e. user has won x games and lost y games)
    // TODO

    // check for quit
    if (shouldQuit(message.content)) {
        doQuit(message);
        console.log(message.author.toString() + ' quit the game!');
        return;
    }

    // check if this user has an ongoing game
    if (games[message.author.tag]) {
        continueGame(message);
        return;
    }

    // else if no ongoing game
    newGame();

});

const shouldQuit = (content) => {
    if (content.trim().toLowerCase() == config.prefix + 'quit') {
        return true;
    }

    return false;
};

const doQuit = (message) => {
    // find the game associated with both players and remove it from the map
    // print author loses and opponent wins!

    const game = games[message.author.id];    

    if (game.opponent !== client.user.toString()) {
        delete games[game.opponentId];
        message.channel.send(message.author.toString() + ' forfeits! <@' + game.opponent + '> wins!');

    } else {
        message.channel.send(message.author.toString() + ' forfeits! I win!');
    }

    delete games[message.author.id];
};

const continueGame = (message) => {
    // if ongoing game, command must be row x col y
    // if x y out of range, print error
    // if x y taken, print error
    // else if command is different, print "please complete or quit your ongoing game" + ongoing game img
    // if move is valid, place move
    // check for win condition
    // if the bot is playing, compute next move
    // check for win condition
};

const newGame = (message) => {
    
    // t.play @user
    // t.play
    const args = message.content.split(/ +/);
    if (args.length > 2 || message.mentions.users.size > 1) {
        // invalid command
        return;
    }

    var board = '\\_  \\_  \\_\n\\_  \\_  \\_\n\\_  \\_  \\_';
    var opponent = client.user.toString();
    var opponentId = null;

    if (message.mentions.users.size == 1) {
        opponent = message.mentions.users[0].toString();
        opponentId = message.mentions.users[0].id;

        // store this game in opponent's map
        games[opponentId] = {board: board, opponent: message.author.toString(), opponentId: message.author.id};

    } else {
        const move = Math.floor((Math.random() * 2));
        if (move == 1) {
            board = nextMove(board);
        }
    }

    // store this game in user's map
    games[message.author.id] = {board: board, opponent: opponent, opponentId: opponentId};

    message.channel.send(message.author.toString() + '\'s move!\n'+ board);
};

const validMove = (board, row, col) => {

};

const nextMove = (board) => {
    var row = Math.floor((Math.random() * 3));
    var col = Math.floor((Math.random() * 3));
};

const checkWin = (message, lastMover) => {

};

const updateScoreboard = (winner, loser) => {

};

client.login(config.token);