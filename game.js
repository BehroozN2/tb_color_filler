let Game = function (wrapper) {
    this.constants = {
        TURNS: 1000,
        TURN_DELAY: 50,
        BOARD_SIZE: 20,
        CELL_SIZE: 32,
        COLOR_BACKGROUND: '#666666',
        COLOR_EMPTY: '#FFFFFF',
        COLOR_ACTIVE: '#000000',
    };

    this.constants.POSITIONS = [
        [0, 0],
        [this.constants.BOARD_SIZE - 1, 0],
        [this.constants.BOARD_SIZE - 1, this.constants.BOARD_SIZE - 1],
        [0, this.constants.BOARD_SIZE - 1],
    ];

    this.timer = null;

    this.wrapper = wrapper;

    this.canvas = {
        element: null,
        context: null,
    };

    this.currentTurn = null;
    this.players = [];
    this.board = [...Array(this.constants.BOARD_SIZE)].map(ignored => Array(this.constants.BOARD_SIZE).fill(null));

    let self = this;

    self.destroy = function () {
        if (self.timer !== null) {
            clearTimeout(self.timer);
            self.timer = null;
        }

        self.wrapper.empty();
    };

    self.addPlayer = function (player) {
        let playerPosition = self.constants.POSITIONS[self.players.length % self.constants.POSITIONS.length];
        player.position = [playerPosition[0], playerPosition[1]];
        player.memory = {};
        self.players.push(player);
    };

    self.importPlayer = function (playerJson) {
        let player = JSON.parse(playerJson);
        eval('player.fn = ' + player.fn);
        self.addPlayer(player);
    };

    self.start = function () {
        self.currentTurn = 0;
        self.setConqueredCells();
        self.draw();
    };

    self.turn = function () {
        self.currentTurn++;
        self.move();
        self.setConqueredCells();
        self.draw();
    };

    self.playTurns = function () {
        if (self.currentTurn === null) {
            self.start();
        } else {
            self.turn();
        }

        if (self.currentTurn < self.constants.TURNS) {
            self.timer = setTimeout(
                function () {
                    self.playTurns();
                },
                self.constants.TURN_DELAY
            );
        }
    };

    self.move = function () {
        self.players.forEach(function (player) {
            let playerX = player.position[0];
            let playerY = player.position[1];

            let playerMove = player.fn(playerX + 1, playerY + 1, self.currentTurn, player.memory);

            if (playerMove === 'top') {
                playerY--;
            } else if (playerMove === 'bottom') {
                playerY++;
            } else if (playerMove === 'left') {
                playerX--;
            } else if (playerMove === 'right') {
                playerX++;
            }

            player.position = [
                Math.max(Math.min(playerX, self.constants.BOARD_SIZE - 1), 0),
                Math.max(Math.min(playerY, self.constants.BOARD_SIZE - 1), 0),
            ];
        });
    };

    self.setConqueredCells = function () {
        let conqueredCells = {};

        self.players.forEach(function (player, playerIndex) {
            let playerPosition = player.position[0] + '_' + player.position[1];

            if (typeof conqueredCells[playerPosition] === 'undefined') {
                conqueredCells[playerPosition] = [];
            }

            conqueredCells[playerPosition].push(playerIndex);
        });

        $.each(conqueredCells, function (ignored, playerIndexes) {
            if (playerIndexes.length !== 1) {
                return true;
            }

            let playerIndex = playerIndexes[0];
            let playerPosition = self.players[playerIndex].position;
            self.board[playerPosition[1]][playerPosition[0]] = playerIndex;
        });
    };

    self.getScores = function () {
        let scores = Array(self.players.length).fill(0);

        for (let x = 0; x < self.constants.BOARD_SIZE; x++) {
            for (let y = 0; y < self.constants.BOARD_SIZE; y++) {
                let playerIndex = self.board[y][x];

                if (playerIndex !== null) {
                    scores[playerIndex]++;
                }
            }
        }

        return scores;
    };

    self.draw = function () {
        self.wrapper.find('.turn').text(self.currentTurn);
        self.wrapper.find('.players').empty();
        let playerScores = self.getScores();

        for (let x = 0; x < self.constants.BOARD_SIZE; x++) {
            for (let y = 0; y < self.constants.BOARD_SIZE; y++) {
                self.drawCell(x, y);
            }
        }

        self.players.forEach(function (player, playerIndex) {
            self.drawPlayerCell(player.position[0], player.position[1]);

            self.wrapper.find('.players').append(
                $('<div></div>', {class: 'mb-1'})
                    .append(
                        $(
                            '<div></div>',
                            {
                                class: 'd-inline-block me-1 border border-dark',
                                style: 'width: 0.75rem; height: 0.75rem; background-color: ' + player.color + ';',
                                text: ' ',
                            }
                        )
                    )
                    .append(
                        $('<span></span>', {text: player.name + ': '})
                    )
                    .append(
                        $(
                            '<span></span>',
                            {
                                class: 'float-end',
                                text: playerScores[playerIndex],
                            }
                        )
                    )
            );
        });
    };

    self.drawCell = function (x, y) {
        let cellPlayer = self.board[y][x];

        let cellSize = self.constants.CELL_SIZE;
        let cellX = ((x + 1) * cellSize) + (x + 2);
        let cellY = ((y + 1) * cellSize) + (y + 2);

        self.setCanvasColor(cellPlayer === null ? self.constants.COLOR_EMPTY : self.players[cellPlayer].color);
        self.canvas.context.fillRect(cellX, cellY, cellSize, cellSize);
    };

    self.drawPlayerCell = function (x, y) {
        let cellSize = self.constants.CELL_SIZE;
        let cellX = ((x + 1) * cellSize) + (x + 2);
        let cellY = ((y + 1) * cellSize) + (y + 2);

        self.setCanvasColor(self.constants.COLOR_ACTIVE);
        self.canvas.context.lineWidth = 2;
        self.canvas.context.strokeRect(cellX + 1.5, cellY + 1.5, cellSize - 3, cellSize - 3);
    };

    self.drawHelpers = function () {
        let cellSize = self.constants.CELL_SIZE;
        let fontSize = Math.round((cellSize / 8) * 3);

        self.canvas.context.fontSize = fontSize + 'px';
        self.setCanvasColor(self.constants.COLOR_EMPTY);

        for (let x = 0; x < self.constants.BOARD_SIZE; x++) {
            let cellX = ((x + 1) * cellSize) + (x + 2);
            self.canvas.context.fillText('x=' + (x + 1), cellX + (cellSize / 6), (cellSize + fontSize) / 2);
        }

        for (let y = 0; y < self.constants.BOARD_SIZE; y++) {
            let cellY = ((y + 1) * cellSize) + (y + 2);
            self.canvas.context.fillText('y=' + (y + 1), cellSize / 4, cellY + (cellSize + fontSize) / 2);
        }
    };

    self.setCanvasColor = function (color) {
        self.canvas.context.fillStyle = color;
    };

    self.initiate = function () {
        self.wrapper.append('<h4>Turn: <span class="turn"></span></h4>');
        self.wrapper.append('<div class="players mb-3"></div>');

        let canvasSize = ((self.constants.BOARD_SIZE + 1) * (self.constants.CELL_SIZE + 1)) + 1;

        self.canvas.element = $('<canvas width="' + canvasSize + '" height="' + canvasSize + '"></canvas>');
        self.wrapper.append(self.canvas.element);
        self.canvas.context = self.canvas.element[0].getContext('2d');

        self.canvas.element.css({
            'background-color': self.constants.COLOR_BACKGROUND,
        });

        self.drawHelpers();
    };

    self.initiate();
};