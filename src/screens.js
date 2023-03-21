
// ==> Авторизация <== \\
function renderLoginScreen() {
    app.textContent = '';
    window.application.timers.forEach(timer => {
        clearInterval(timer);
    });

    window.application.renderBlock('authorization', app);

    const loginButton = app.querySelector('.login-button');
    const loginInput = app.querySelector('.login-input');

    loginButton.addEventListener('click', () => {
        if (loginInput.value === '') {
            const infoText = app.querySelector('.info-text');
            infoText.textContent = 'введите Никнейм';
            return;
        }
        const nameLogin = loginInput.value;
        request({
            url: `${backURL}login?login=${nameLogin}`,
            onSuccess: (data) => {
                window.application.token['token'] = data.token;
                request({
                    url: `${backURL}player-status?token=${window.application.token['token']}`,
                    onSuccess: (data) => {
                        if (data["player-status"].status === 'lobby') {
                            window.application.renderScreen('lobby-screen');
                        }
                        else if (data["player-status"].status === 'game') {
                            console.log('этот игрок уже в игре');

                            const infoText = app.querySelector('.info-text');
                            infoText.textContent = 'ВОЗВРАЩАЕМСЯ В ИГРУ';

                            const game = data["player-status"].game;
                            window.application.id['id'] = game.id;

                            request({
                                url: `${backURL}game-status?token=${window.application.token['token']}&id=${window.application.id['id']}`,
                                onSuccess: (data) => {
                                    const dataEnemy = data["game-status"].enemy;
                                    window.application.enemy['enemy'] = dataEnemy.login;


                                    if (data["game-status"].status === 'waiting-for-enemy-move') {
                                        window.application.renderScreen('waitingplayer-screen');
                                    } else if (data["game-status"].status === 'waiting-for-your-move') {

                                        const infoText = app.querySelector('.info-text');
                                        infoText.textContent = 'ВАШ ХОД';

                                        window.application.renderScreen('game-screen');
                                    } else if (data["game-status"].status === 'lose') {
                                        window.application.renderScreen('lose-screen');
                                    } else if (data["game-status"].status === 'win') {
                                        window.application.renderScreen('win-screen');
                                    }
                                },
                                onError:
                                    () => {
                                        console.log('ошибка поиска игры');

                                        const errorText = app.querySelector('.info-text');
                                        errorText.textContent = 'Ошибка поиска игры на сервере';

                                        window.application.renderScreen('lobby-screen');
                                    }
                            });
                        }
                    },
                    onError:
                        () => {
                            console.log('ошибка статуса игрока');
                        }
                });

            },
            onError:
                () => {
                    console.log('ошибка логина');
                }
        });
    });


}

// ==> Лобби <== \\
function renderLobbyScreen() {
    app.textContent = '';
    window.application.timers.forEach(timer => {
        clearInterval(timer);
    });

    window.application.renderBlock('players-list', app);
    window.application.renderBlock('play-button', app);

    window.application.renderBlock('begin-button', app);

    window.application.renderBlock('info-text', app);
}

// ==> Ожидания игры <== \\
function renderWaitingScreen() {
    app.textContent = '';
    window.application.timers.forEach(timer => {
        clearInterval(timer);
    });

    window.application.renderBlock('waiting-block', app);

    window.application.renderBlock('info-text', app);
}

// ==> Ход игры <== \\
function renderGameScreen() {
    app.textContent = '';
    window.application.timers.forEach(timer => {
        clearInterval(timer);
    });

    window.application.renderBlock('game-block', app);

}

// ==> Ожидания Хода соперника <== \\
function renderWaitingPlayerScreen() {
    app.textContent = '';
    window.application.timers.forEach(timer => {
        clearInterval(timer);
    });

    window.application.renderBlock('waitingplayer-block', app);

    window.application.renderBlock('info-text', app);
}

// ==> Победа <== \\
function renderWinScreen() {
    window.application.timers.forEach(timer => {
        clearInterval(timer);
    });

    const app = document.querySelector('.app');
    app.textContent = '';

    const title = document.createElement('h1');
    title.textContent = 'Камень Ножницы Бумага';

    const vs = document.createElement('h3');
    vs.textContent = `ВЫ vs ${window.application.enemy['enemy']}`;

    const content = document.createElement('div');
    content.classList.add('div-flex')

    window.application.renderBlock('win-block', content);
    window.application.renderBlock('play-button', content);
    window.application.renderBlock('lobby-button', content);

    app.appendChild(title);
    app.appendChild(vs)
    app.appendChild(content);

    const appButton = app.querySelector('.play-button');
    appButton.textContent = 'Играть ещё!';
}

// ==> Поражение <== \\
function renderLoseScreen() {
    window.application.timers.forEach(timer => {
        clearInterval(timer);
    });

    const app = document.querySelector('.app');
    app.textContent = '';

    const title = document.createElement('h1');
    title.textContent = 'Камень Ножницы Бумага';

    const vs = document.createElement('h3');
    vs.textContent = `ВЫ vs ${window.application.enemy['enemy']}`;

    const content = document.createElement('div');
    content.classList.add('div-flex')

    window.application.renderBlock('lose-block', content);
    window.application.renderBlock('play-button', content);
    window.application.renderBlock('lobby-button', content);

    app.appendChild(title);
    app.appendChild(vs)
    app.appendChild(content);

    const appButton = document.querySelector('.play-button');
    appButton.textContent = 'Играть ещё!';
}



// ==> Записываем функцию рендеринга Экрана в поле главного объекта <== \\
window.application.screens['login-screen'] = renderLoginScreen;
window.application.screens['lobby-screen'] = renderLobbyScreen;
window.application.screens['waiting-screen'] = renderWaitingScreen;
window.application.screens['game-screen'] = renderGameScreen;
window.application.screens['waitingplayer-screen'] = renderWaitingPlayerScreen;
window.application.screens['win-screen'] = renderWinScreen;
window.application.screens['lose-screen'] = renderLoseScreen;