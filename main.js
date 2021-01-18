'use strict'

// TODO the word "pool" is ambigious as it is used for the word pools but also by the random index provider
// TODO add http/ws integration test
// TODO split out separate routers for UI and Game
const RandomIndexProvider = require('./random-index/random-index-provider')
const GameFactory = require('./game/game-factory')
const express = require('express')
const expressWs = require('express-ws')
const AvailableTextsLoader = require('./available-texts-loader')
const UiTexts = require('./web-client/ui-texts')
const WordPool = require('./words/word-pool')

const app = express()
const wsInstance = expressWs(app)

const uiTexts = new UiTexts(new AvailableTextsLoader().load('web-client/static-content/ui-texts'))
app.use(express.static('web-client/static-content'))
app.get('/ui-texts.json', async (req, res) => {
    const acceptedLanguages = req.header('accept-language').split(',').map(lang => lang.split(';')[0])
    res.json(uiTexts.loadMergedTexts(acceptedLanguages))
})

const randomIndexProvider = new RandomIndexProvider()
const wordPool = new WordPool()
const games = {}
const clients = {}
const timeouts = {}
const dummyClient = { send: () => null }

const filterActivePlayers = (gameClients) => Object.values(gameClients).filter((c) => c !== dummyClient)
const filterInactivePlayers = (gameClients) => Object.values(gameClients).filter((c) => c === dummyClient)

setInterval(function () {
    console.log(`[heartbeat] ${wsInstance.getWss().clients.size} connected clients`)
    console.log(`[heartbeat] ${Object.keys(games).length} games`)
    const active = Object.values(clients).map(filterActivePlayers).flat().length
    const inactive = Object.values(clients).map(filterInactivePlayers).flat().length
    console.log(`[heartbeat] ${active} active, ${inactive} inactive players (${active + inactive} total)`)
}, 5000)

const endGame = function (id) {
    delete games[id]
    Object.values(clients[id]).forEach((client) => {
        client.send(JSON.stringify({ error: 'game-not-existing' }))
    })
    delete clients[id]
    console.log(`[${id}] ended, dropped all clients`)
    console.log(`${wsInstance.getWss().clients.size} clients remaining`)
}

app.get('/supported-word-pool-languages', async (req, res) => {
    res.json(wordPool.getSupportedLanguages())
})

app.post('/games', express.json(), function (req, res) {
    let gameId
    do { gameId = randomIndexProvider.get(1000000).toString().padStart(6, '0') } while (games[gameId])

    games[gameId] = new GameFactory().create(wordPool, req.body.language)
    clients[gameId] = {}
    const sixHours = 1000 * 60 * 60 * 6
    setTimeout(() => endGame(gameId), sixHours)
    timeouts[gameId] = Date.now() + sixHours
    res.status(201).location(`${gameId}`).end()
})

app.ws('/games/:id', function (ws, req) {
    const gameId = req.params.id
    console.log(`[${gameId}] new client connecting`)
    const game = games[gameId]
    const gameClients = clients[gameId]
    if (!game) {
        ws.send(JSON.stringify({ error: 'game-not-existing' }))
        ws.close(4000)
        console.log(`[${gameId}] game not existing`)
        return
    }

    const update = function () {
        const players = game.players.map((player, index) => ({
            name: player.name,
            word: (game.winners.length > 0) ? player.word : '???',
            isAdmin: (index === 0),
            isEliminated: player.isEliminated,
            score: player.score,
            isDisconnected: gameClients[player.name] === dummyClient
        }))
        game.players.forEach((player, index) => {
            gameClients[player.name].send(JSON.stringify({
                timeout: timeouts[gameId],
                players: players,
                isStarted: game.isStarted,
                canStart: game.canStart(),
                word: player.word,
                winners: game.winners,
            }))
        })
    }

    const executeCommand = function (msg) {
        if (msg.command === 'join') {
            if (gameClients[msg.playerName]) {
                console.log(`[${gameId}] ${msg.playerName} reconnected`)
            } else {
                console.log(`[${gameId}] ${msg.playerName} joined`)
                game.join(msg.playerName)
            }
            gameClients[msg.playerName] = ws
        } else if (msg.command === 'start') {
            console.log(`[${gameId}] new round started`)
            game.start()
        } else if (msg.command === 'kick') {
            console.log(`[${gameId}] ${msg.playerName} kicked`)
            game.kick(msg.playerName)
            delete gameClients[msg.playerName]
        } else if (msg.command === 'vote') {
            console.log(`[${gameId}] ${msg.playerName} voted`)
            game.voteImpostor(msg.playerName)
        } else if (msg.command === 'guess') {
            console.log(`[${gameId}] ${msg.word} guessed`)
            game.guessWord(msg.word)
        } else if (msg.command === 'claim') {
            console.log(`[${gameId}] ${msg.playerName} claimed admin`)
            const playerIndex = game.players.findIndex((p) => p.name == msg.playerName)
            game.players.unshift(game.players.splice(playerIndex, 1)[0])
        } else {
            throw new Error('invalid command or message')
        }
    }

    ws.on('close', function () {
        const disconnectedPlayerName = Object.keys(gameClients).find((playerName) => gameClients[playerName] === ws)
        if (disconnectedPlayerName) {
            gameClients[disconnectedPlayerName] = dummyClient
            update(gameId)
            console.log(`[${gameId}] ${disconnectedPlayerName} disconnected`)
        }
    })

    ws.on('message', function (msgString) {
        if (!game) {
            ws.send(JSON.stringify({ error: 'game-not-existing' }))
            console.log(`[${gameId}] game not existing`)
            return
        }
        const msg = JSON.parse(msgString)
        executeCommand(msg)
        update()
    })
})

app.listen(process.env.PORT || 3000)
