$(function () {
    let getRandomLightColor = function () {
        let color = '#';

        for (let i = 0; i < 3; i++) {
            color += ('0' + Math.floor(((1 + Math.random()) * Math.pow(16, 2)) / 2).toString(16)).slice(-2);
        }

        return color;
    };

    let teamColor = $('#team_color');
    if (teamColor.val() === '#000000') {
        teamColor.val(getRandomLightColor());
    }

    let getTeamJson = function () {
        return JSON.stringify({
            name: $('#team_name').val(),
            color: $('#team_color').val(),
            fn: $('#team_function').val(),
        });
    };

    let game = null;

    $('#button_test').on('click', function () {
        if (game !== null) {
            game.destroy();
        }

        let board = $('#board_wrapper');

        game = new Game(board);
        game.importPlayer(getTeamJson());

        board.removeClass('invisible');

        game.playTurns();

        window.scroll(0, document.documentElement.offsetHeight);
    });

    $('#button_test_stop').on('click', function () {
        if (game !== null) {
            game.destroy();
        }
    });

    $('#button_export').on('click', function () {
        alert(getTeamJson());
    });
});