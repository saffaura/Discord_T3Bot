const Discord = require('discord.js');
const config = require('./config');
const client = new Discord.Client();
const games = {};
const corners = [0, 2, 3, 5, 6, 8];
const centers = [1, 4, 7];

const setCharAt = (str, index, char)=> {
    return str.substr(0, index) + char + str.substr(index + char.length);
}

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
    let resume = games[message.author.id];
    if (shouldMove(message.content)) {
        if (resume) {
            continueGame(message);
        } else {
            message.reply("you have no current games. Use t.play to start a new game.");
        }
        return;
    }

    if (shouldPlay(message.content)) {
        newGame(message);
    }

});

const shouldQuit = (content) => {
    if (content.trim().toLowerCase() == config.prefix + 'quit') {
        return true;
    }

    return false;
};

const shouldMove = (content) => {
    let move = config.prefix + "move";
    let start = content.trim().substring(0, move.length);

    if (start == move) {
        return true;
    }

    return false;
};

const shouldPlay = (content) => {
    let play = config.prefix + "play";
    let start = content.trim().substring(0, play.length);
    
    if (start == play) {
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

    // command must be row x col y
    let content = message.content.toLowerCase();
    const check1 = /^t\.move row [1-3] col [1-3]/;
    const check2 = /^t\.move col [1-3] row [1-3]/;
    const check3 = /^t\.move [1-3], [1-3]/;

    if (check1.test(content) || check2.test(content) || check3.test(content)) {
        let row = content[content.indexOf("row") + 4];
        let col = content[content.indexOf("col") + 4];
        var game = games[message.author.id];

        if (!validMove(game.board, game.moves, row, col)) {
            message.reply("invalid move.");

        } else {

            var game = games[message.author.id];
            
            row--;
            col--;
        
            if (row != 0) {
                col += (row * 3);
            }
        
            let index = game.moves[col];
            game.board = setCharAt(game.board, index, game.val);
            game.moves[col] = -1;

            checkWin();

            if (game.opponentId == null) {
                const pair = nextMove(game.board, game.moves, message);
                game.board = pair.board;
                game.moves = pair.moves;
            }

            message.channel.send(message.author.toString() + '\'s move!\n'+ game.board);
        }


    } else {
        message.reply("invalid command. Please use the following format: t.move row 1 col 2");
    }

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
    var moves = [1, 5, 9, 12, 16, 20, 23, 27, 31];
    var opponent = client.user.toString();
    var opponentId = null;

    if (message.mentions.users.size == 1) {
        opponent = message.mentions.users[0].toString();
        opponentId = message.mentions.users[0].id;

        // store this game in opponent's map
        games[opponentId] = {board: board, opponent: message.author.toString(), opponentId: message.author.id, moves: moves, val: 'O'};

    } else {
        const move = Math.floor((Math.random() * 2));
        if (move == 1) {
            let pair = nextMove(board, moves);
            board = pair.board;
            moves = pair.moves;
        }
    }

    // store this game in user's map
    games[message.author.id] = {board: board, opponent: opponent, opponentId: opponentId, moves: moves, val: 'X'};
    console.log("added games[" +message.author.id + "]");

    message.channel.send(message.author.toString() + '\'s move!\n'+ board);
};

const validMove = (board, moves, row, col) => {
    row--;
    col--;

    if (row != 0) {
        col += (row * 3);
    }
    
    if (moves[col] == -1) {
        return false;
    }

    return (board[moves[col]] == '_')
};

const nextMove = (board, moves, message) => {
    // moves: [1, 5, 9, 12, 16, 20, 23, 27, 31];

    let moved = false;
    for (var i = 0; i < corners.length; i++) {
        // prioritize corner moves first
        if (moves[corners[i]] != -1) {
            const index = moves[corners[i]];
            if (board[index] == '_') {
                // make sure this slot is free
                board = setCharAt(board, index, 'O');
                moves[corners[i]] = -1;
                moved = true;
                break;
            }
        }
    }

    if (!moved) {
        for (var i = 0; i < centers.length; i++) {
            // move wherever
            if (moves[centers[i]] != -1) {
                const index = moves[centers[i]];
                if (board[index] == '_') {
                    // make sure this slot is free
                    board = setCharAt(board, index, 'O');
                    moves[centers[i]] = -1;
                    moved = true;
                    break;
                }
            }
        }
    }

    if (message != null) {
        checkWin();
    }

    return {board: board, moves: moves};
};

const checkWin = (message, lastMover) => {

};

const updateScoreboard = (winner, loser) => {

};

client.login(config.token);