'use strict'

const GameFactory = require('./game/game-factory')
const express = require('express')
const expressWs = require('express-ws')
const app = express()

expressWs(app)

const game = new GameFactory().create()
const clients = {}
const dummyClient = { send: () => null }

app.use(express.static('web-client'))

app.ws('/game', function (ws) {

    const update = function () {
        const players = game.players.map((player) => ({
            name: player.name,
            isEliminated: player.isEliminated,
            score: player.score,
            isDisconnected: clients[player.name] === dummyClient
        }))
        game.players.forEach((player, index) => {
            clients[player.name].send(JSON.stringify({
                isStarted: Boolean(game.commonWord),
                isAdmin: (index === 0),
                players: players,
                word: player.word,
                winners: game.winners,
            }))
        })
    }

    ws.on('close', function () {
        const droppedPlayerName = Object.keys(clients).find((name) => clients[name] === ws)
        if (droppedPlayerName) {
            console.log(`${droppedPlayerName} dropped`)
            if (droppedPlayerName === game.players[0].name) {
                game.players.push(game.players.shift())
            }
            clients[droppedPlayerName] = dummyClient
        }
        update()
    })

    ws.on('message', function (msg) {
        msg = JSON.parse(msg)

        // TODO need to handle join failure - maybe joining should be handled through HTTP, not WS
        // TODO reconnect should somehow detect if it is really the same guy, not someone else just 'stealing the name', e.g. check:
        //      a) check that the connection of that player is dropped (not needed if the player would anyway get kicked after a timeout - see other TODO)
        //      b) have some mechanism to verify it is the same person, e.g. logon/secret mechanism or some client device identification (ip, agent, mac address, ...)
        if (msg.command === 'join') {
            if (clients[msg.playerName]) {
                console.log(`${msg.playerName} reconnected`)
            } else {
                game.join(msg.playerName)
            }
            clients[msg.playerName] = ws
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
