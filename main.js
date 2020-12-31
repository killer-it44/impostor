'use strict'

const RandomIndexProvider = require('./random-index/random-index-provider')
const GameFactory = require('./game/game-factory')
const express = require('express')
const expressWs = require('express-ws')
const app = express()
expressWs(app)

const randomIndexProvider = new RandomIndexProvider()
const games = {}
const clients = {}
const dummyClient = { send: () => null }

app.use(express.static('web-client'))

app.post('/games', function(req, res) {
    // TODO set a timeout of e.g. 30 minutes - if there is no activity, the room gets automatically deleted
    const gameId = randomIndexProvider.get(Math.pow(2, 24)).toString(16)
    games[gameId] = new GameFactory().create()
    clients[gameId] = {}
    res.status(201).location(`${gameId}`).end()
})

app.ws('/games/:id', function (ws, req) {
    const game = games[req.params.id]
    const gameClients = clients[req.params.id]

    const update = function () {
        const players = game.players.map((player) => ({
            name: player.name,
            isEliminated: player.isEliminated,
            score: player.score,
            isDisconnected: gameClients[player.name] === dummyClient
        }))
        game.players.forEach((player, index) => {
            gameClients[player.name].send(JSON.stringify({
                isStarted: Boolean(game.commonWord),
                isAdmin: (index === 0),
                players: players,
                word: player.word,
                winners: game.winners,
            }))
        })
    }

    ws.on('close', function () {
        const droppedPlayerName = Object.keys(gameClients).find((playerName) => gameClients[playerName] === ws)
        if (droppedPlayerName) {
            console.log(`${droppedPlayerName} dropped from game ${req.params.id}`)
            if (droppedPlayerName === game.players[0].name) {
                game.players.push(game.players.shift())
            }
            gameClients[droppedPlayerName] = dummyClient
        }
        update(req.params.id)
    })

    ws.on('message', function (msg) {
        msg = JSON.parse(msg)

        // TODO need to handle join failure - maybe joining should be handled through HTTP, not WS
        // TODO reconnect should somehow detect if it is really the same guy, not someone else just 'stealing the name', e.g. check:
        //      a) check that the connection of that player is dropped (not needed if the player would anyway get kicked after a timeout - see other TODO)
        //      b) have some mechanism to verify it is the same person, e.g. logon/secret mechanism or some client device identification (ip, agent, mac address, ...)
        if (msg.command === 'join') {
            // FIXME fails when somebody tries to join a game that doesn't exist (any more)
            if (gameClients[msg.playerName]) {
                console.log(`${msg.playerName} reconnected to game ${req.params.id}`)
            } else {
                game.join(msg.playerName)
            }
            gameClients[msg.playerName] = ws
        } else if (msg.command === 'start') {
            game.start()
        } else if (msg.command === 'kick') {
            game.kick(msg.playerName)
        } else if (msg.command === 'vote') {
            game.voteImposter(msg.playerName)
        } else {
            throw new Error('invalid command')
        }
        update()
    })
})

app.listen(process.env.PORT || 3000)
