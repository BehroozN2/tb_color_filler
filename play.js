$(function () {
    let game = new Game($('#board_wrapper'));

    $('#button_load_examples').on('click', function () {
        game.addPlayer({
            name: 'Hard Coded',
            color: '#a7ff2f',
            fn: function (x, y, turn, memory) {
                if (turn <= 20) {
                    return 'right';
                } else if (turn === 21) {
                    return 'bottom';
                } else if (turn <= 41) {
                    return 'left';
                } else if (turn === 42) {
                    return 'bottom';
                } else if (turn <= 62) {
                    return 'right';
                }
            },
        });

        game.addPlayer({
            name: 'Random',
            color: '#ff7777',
            fn: function (x, y, turn, memory) {
                let moves = ['top', 'bottom', 'left', 'right'];
                return moves[Math.floor(Math.random() * moves.length)];
            },
        });

        game.addPlayer({
            name: 'Loop Around',
            color: '#4fa7ff',
            fn: function (x, y, turn, memory) {
                if (y === 1 && x !== 20) {
                    return 'right';
                } else if (x === 1) {
                    return 'top';
                } else if (y === 20) {
                    return 'left';
                } else if (x === 20) {
                    return 'bottom';
                }
            },
        });

        game.addPlayer({
            name: 'Horizontal',
            color: '#ffa346',
            fn: function (x, y, turn, memory) {
                if (x === 1) {
                    return memory.direction = 'right';
                } else if (x === 20) {
                    return memory.direction = 'left';
                } else {
                    return memory.direction;
                }
            },
        });

        $('#button_ready').trigger('click');
    });

    $('#button_import_team').on('click', function () {
        let teamJSON = prompt('Enter team\'s JSON');

        if (teamJSON) {
            $('#button_load_examples').prop('disabled', true);
            game.importPlayer(teamJSON);
        }
    });

    $('#button_ready').on('click', function () {
        game.start();

        $('#board_wrapper').removeClass('invisible');

        $(this).prop('disabled', true);
        $('#button_load_examples').prop('disabled', true);
        $('#button_import_team').prop('disabled', true);
    });

    $('#button_start').on('click', function () {
        game.playTurns();

        $('#board_wrapper').removeClass('invisible');

        $(this).prop('disabled', true);
        $('#button_load_examples').prop('disabled', true);
        $('#button_import_team').prop('disabled', true);
        $('#button_ready').prop('disabled', true);
    });
});