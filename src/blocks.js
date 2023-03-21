// ==> Авторизация <== \\
function renderAuthorization(container) {

    const title = document.createElement('h1');
    title.textContent = 'Камень, Ножницы, Бумага';
    container.appendChild(title);

    const content = document.createElement('div');
    content.classList.add('div-flex');
    container.appendChild(content);

    const loginParagraph = document.createElement('p');
    loginParagraph.textContent = 'Ваш Никнейм';
    container.appendChild(loginParagraph);

    const inputField = document.createElement('input');
    inputField.classList.add('login-input')
    container.appendChild(inputField);

    const button = document.createElement('button');
    button.classList.add('login-button')
    button.textContent = 'Войти в игру';
    container.appendChild(button);

    const infoText = document.createElement('h3');
    infoText.classList.add('info-text')
    container.appendChild(infoText);
}

// ==> Список игроков <== \\
function renderPlayersList(container) {
    const title = document.createElement('h1');
    title.textContent = 'Лобби';
    container.appendChild(title);

    const playersList = document.createElement('h2');
    playersList.textContent = 'Список игроков:';
    container.appendChild(playersList);

    const content = document.createElement('div');
    content.classList.add('div-flex')
    container.appendChild(content);

    window.application.timers.push(setInterval(function () {
        request({
            url: `${backURL}player-list?token=${window.application.token['token']}`,
            onSuccess: (data) => {
                clearElement(content);

                console.log(data.status);
                const ul = document.createElement('ul');

                const players = data.list.map(item => item.login);
                players.join();
                let logins = [...players];

                logins.forEach(element => {
                    const playerLogin = document.createElement('li');
                    playerLogin.textContent = element;
                    ul.classList.add('ul-image');
                    ul.appendChild(playerLogin);
                    content.appendChild(ul);
                });
            },
            onError:
                () => {
                    console.log('ошибка списка игроков');

                    const errorText = app.querySelector('.info-text');
                    errorText.textContent = 'Ошибка списка игроков на сервере';

                    window.application.renderScreen('login-screen');
                }
        });
    }, 1000)
    );

}

// ==> кнопка 'Играть' <== \\
function renderPlayButton(container) {
    const button = document.createElement('button');
    button.classList.add('play-button')
    button.textContent = 'Играть';
    container.appendChild(button);

    const playButton = container.querySelector('.play-button');

    playButton.addEventListener('click', () => {

        request({
            url: `${backURL}start?token=${window.application.token['token']}`,
            onSuccess: (data) => {

                window.application.id['id'] = data["player-status"].game.id;
                window.application.renderScreen('waiting-screen');
            },
            onError:
                () => {
                    console.log('ошибка старта игры');

                    const errorText = app.querySelector('.info-text');
                    errorText.textContent = 'Ошибка старта игры на сервере';

                    window.application.renderScreen('login-screen');
                }
        });
    });

}

// ==> Ожидание игры <== \\
function renderWaitingBlock(container) {
    const title = document.createElement('h1');
    title.textContent = 'ПОИСК ИГРЫ';
    container.appendChild(title);

    const content = document.createElement('div');
    content.classList.add('div-flex')
    container.appendChild(content);

    const spinner = document.createElement('img');
    spinner.getAttribute = ('src');
    spinner.src = '3ppP.gif';
    content.appendChild(spinner);

    const waiting = document.createElement('h2');
    waiting.textContent = 'Ожидаем подключения соперника...';
    content.appendChild(waiting);

    window.application.timers.push(setInterval(function () {
        request({
            url: `${backURL}game-status?token=${window.application.token['token']}&id=${window.application.id['id']}`,
            onSuccess: (data) => {
                console.log(`ожидание Игры ${data["game-status"].status}`);
                if (data["game-status"].status !== 'waiting-for-start') {
                    const dataEnemy = data["game-status"].enemy;
                    window.application.enemy['enemy'] = dataEnemy.login;
                    window.application.renderScreen('game-screen');
                }


            },
            onError:
                () => {
                    console.log('Ошибка поиска игры на сервер');

                    const errorText = app.querySelector('.info-text');
                    errorText.textContent = 'Ошибка поиска игры на сервере';

                    window.application.renderScreen('lobby-screen');
                }
        });
    }, 500)
    );
}

// ==> Ход игры <== \\
function renderGameBlock(container) {
    const title = document.createElement('h1');
    title.textContent = 'В ИГРЕ';

    const vs = document.createElement('h3');
    vs.textContent = `ВЫ vs ${window.application.enemy['enemy']}`;

    const content = document.createElement('div');
    content.classList.add('div-flex')

    container.appendChild(title);
    container.appendChild(vs)
    container.appendChild(content);

    const buttonRock = document.createElement('button');
    buttonRock.classList.add('ingame-button')
    buttonRock.classList.add('rock');
    buttonRock.textContent = 'Камень';
    content.appendChild(buttonRock);

    const buttonScissors = document.createElement('button');
    buttonScissors.classList.add('ingame-button')
    buttonScissors.classList.add('scissors');
    buttonScissors.textContent = 'Ножницы';
    content.appendChild(buttonScissors);

    const buttonPaper = document.createElement('button');
    buttonPaper.classList.add('ingame-button')
    buttonPaper.classList.add('paper');
    buttonPaper.textContent = 'Бумага';
    content.appendChild(buttonPaper);

    const infoText = document.createElement('h3');
    infoText.classList.add('info-text')
    infoText.textContent = 'ВАШ ХОД';
    container.appendChild(infoText);


    buttonRock.addEventListener('click', () => {
        request({
            url: `${backURL}play?token=${window.application.token['token']}&id=${window.application.id['id']}&move=rock`,
            onSuccess: (data) => {
                console.log('КАМЕНЬ');
                if (data["game-status"].status === 'waiting-for-enemy-move') {
                    console.log('НА ЭКРАН ОЖИДАНИЯ ИГРОКА');
                    window.application.renderScreen('waitingplayer-screen');
                }
                else if (data["game-status"].status === 'waiting-for-your-move') {
                    console.log('ничья, ходим ещё раз');

                    const infoText = app.querySelector('.info-text');
                    infoText.textContent = '';
                    setTimeout(function () {
                        infoText.textContent = 'НИЧЬЯ, ходите ещё раз.';
                    }, 500);

                    return;
                }
                else if (data["game-status"].status === 'lose') {
                    console.log('ПОРАЖЕНИЕ');
                    window.application.renderScreen('lose-screen');
                }
                else if (data["game-status"].status === 'win') {
                    console.log('ПОБЕДА');
                    window.application.renderScreen('win-screen');
                }
                return;

            },
            onError:
                () => {
                    console.log('ошибка хода');

                    const errorText = app.querySelector('.info-text');
                    errorText.textContent = 'Ошибка обработки хода на сервере';

                    window.application.renderScreen('lobby-screen');
                }
        });
    });

    buttonScissors.addEventListener('click', () => {
        request({
            url: `${backURL}play?token=${window.application.token['token']}&id=${window.application.id['id']}&move=scissors`,
            onSuccess: (data) => {
                console.log('НОЖНИЦЫ');
                if (data["game-status"].status === 'waiting-for-enemy-move') {
                    window.application.renderScreen('waitingplayer-screen');
                }
                else if (data["game-status"].status === 'waiting-for-your-move') {
                    console.log('ничья, ходим ещё раз');

                    const infoText = app.querySelector('.info-text');
                    infoText.textContent = '';
                    setTimeout(function () {
                        infoText.textContent = 'НИЧЬЯ, ходите ещё раз.';
                    }, 500);

                    return;
                }
                else if (data["game-status"].status === 'lose') {
                    window.application.renderScreen('lose-screen');
                }
                else if (data["game-status"].status === 'win') {
                    window.application.renderScreen('win-screen');
                }
                return;
            },
            onError:
                () => {
                    console.log('ошибка хода');

                    const errorText = app.querySelector('.info-text');
                    errorText.textContent = 'Ошибка обработки хода на сервере';

                    window.application.renderScreen('lobby-screen');
                }
        });
    });

    buttonPaper.addEventListener('click', () => {
        request({
            url: `${backURL}play?token=${window.application.token['token']}&id=${window.application.id['id']}&move=paper`,
            onSuccess: (data) => {
                console.log('БУМАГА');
                if (data["game-status"].status === 'waiting-for-enemy-move') {
                    window.application.renderScreen('waitingplayer-screen');
                }
                else if (data["game-status"].status === 'waiting-for-your-move') {
                    console.log('ничья, ходим ещё раз');

                    const infoText = app.querySelector('.info-text');
                    infoText.textContent = '';
                    setTimeout(function () {
                        infoText.textContent = 'НИЧЬЯ, ходите ещё раз.';
                    }, 500);

                    return;
                }
                else if (data["game-status"].status === 'lose') {
                    window.application.renderScreen('lose-screen');
                }
                else if (data["game-status"].status === 'win') {
                    window.application.renderScreen('win-screen');
                }
                return;
            },
            onError:
                () => {
                    console.log('ошибка хода');

                    const errorText = app.querySelector('.info-text');
                    errorText.textContent = 'Ошибка обработки хода на сервере';

                    window.application.renderScreen('lobby-screen');
                }
        });
    });



}

// ==> Ожидание Хода соперника <== \\
function renderWaitingPlayerBlock(container) {
    const title = document.createElement('h1');
    title.textContent = 'В ИГРЕ';

    const vs = document.createElement('h3');
    vs.textContent = `ВЫ vs ${window.application.enemy['enemy']}`;

    const content = document.createElement('div');
    content.classList.add('div-flex')

    const spinner = document.createElement('img');
    spinner.getAttribute = ('src');
    spinner.src = 'img/loading.gif';
    content.appendChild(spinner);

    const waitingPlayer = document.createElement('h2');
    waitingPlayer.textContent = 'Ожидаем Ход соперника...';
    content.appendChild(waitingPlayer);

    container.appendChild(title);
    container.appendChild(vs)
    container.appendChild(content);

    window.application.timers.push(setInterval(function () {
        request({
            url: `${backURL}game-status?token=${window.application.token['token']}&id=${window.application.id['id']}`,
            onSuccess: (data) => {
                console.log(`ожидание Хода соперника ${data["game-status"].status}`);

                if (data["game-status"].status === 'waiting-for-enemy-move') {
                    return;
                } else if (data["game-status"].status === 'win') {
                    window.application.renderScreen('win-screen');
                } else if (data["game-status"].status === 'lose') {
                    window.application.renderScreen('lose-screen');
                } else if (data["game-status"].status === 'waiting-for-your-move') {
                    console.log('НИЧЬЯ, ходим ещё раз');
                    setTimeout(function () {
                        const infoText = app.querySelector('.info-text');
                        infoText.textContent = '';
                        infoText.textContent = 'НИЧЬЯ, ходим ещё раз';
                    }, 5);

                    window.application.renderScreen('game-screen');
                }
                return;
            },
            onError:
                () => {
                    console.log('ошибка ожидания хода соперника');

                    const errorText = app.querySelector('.info-text');
                    errorText.textContent = 'Ошибка ожидания хода соперника';

                    window.application.renderScreen('lobby-screen');
                }
        });
    }, 500)
    );
}

// ==> текст Победы <== \\
function renderWinBlock(container) {
    const winText = document.createElement('h1');
    winText.classList.add('text_shadows');
    winText.textContent = 'ПОБЕДА';
    container.appendChild(winText);
}

// ==> текст Поражения <== \\
function renderLoseBlock(container) {
    const loseText = document.createElement('h1');
    loseText.classList.add('text_shadows');
    loseText.textContent = 'ПОРАЖЕНИЕ';
    container.appendChild(loseText);
}

// ==> кнопка 'Перейти в Лобби' <== \\
function renderLobbyButton(container) {
    const lobbyButton = document.createElement('button');
    lobbyButton.classList.add('lobby-button')
    lobbyButton.textContent = 'в Лобби';
    container.appendChild(lobbyButton);

    lobbyButton.addEventListener('click', () => {
        window.application.renderScreen('lobby-screen');
    });
}

// ==> кнопка 'в Начало' <== \\
function renderBeginButton(container) {
    const beginButton = document.createElement('button');
    beginButton.classList.add('begin-button');
    beginButton.textContent = 'в Начало';
    container.appendChild(beginButton);

    beginButton.addEventListener('click', () => {
        window.application.renderScreen('login-screen');
    });
}

// ==> доп.Инфо и Ошибок <== \\
function renderErrorText(container) {
    const infoText = document.createElement('h3');
    infoText.classList.add('info-text')
    container.appendChild(infoText);
}


// ==> Записываем функции рендеринга Блока в поле главного объекта <== \\
window.application.blocks['authorization'] = renderAuthorization;
window.application.blocks['players-list'] = renderPlayersList;
window.application.blocks['play-button'] = renderPlayButton;
window.application.blocks['waiting-block'] = renderWaitingBlock;
window.application.blocks['game-block'] = renderGameBlock;
window.application.blocks['waitingplayer-block'] = renderWaitingPlayerBlock;
window.application.blocks['win-block'] = renderWinBlock;
window.application.blocks['lose-block'] = renderLoseBlock;
window.application.blocks['lobby-button'] = renderLobbyButton;
window.application.blocks['begin-button'] = renderBeginButton;
window.application.blocks['info-text'] = renderErrorText;