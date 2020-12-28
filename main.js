'use strict'

const GameFactory = require('./game/game-factory')
const express = require('express')
const expressWs = require('express-ws')
const app = express()

expressWs(app)

const game = new GameFactory().create()
const playerClientMap = {}

app.use(express.static('web-client'))

app.ws('/game', function (ws) {

    const update = function () {
        const players = game.players.map((player) => ({
            name: player.name,
            isEliminated: player.isEliminated,
            score: player.score
        }))
        game.players.forEach((player, index) => {
            playerClientMap[player.name].send(JSON.stringify({
                isStarted: Boolean(game.commonWord),
                isAdmin: (index === 0),
                players: players,
                word: player.word,
                winners: game.winners,
            }))
        })
    }

    // TODO handle connection close - we don't want to kick out folks immediately, but maybe should at least
    // a) schedule a timeout after which the player will get kicked
    // b) inform the others if it is the admin who 'disconnected', so they can claim the admin
    ws.on('close', function () {
        const droppedPlayerName = Object.keys(playerClientMap).find((playerName) => playerClientMap[playerName] === ws)
        if (droppedPlayerName) {
            console.log(`${droppedPlayerName} dropped`)
            playerClientMap[droppedPlayerName] = { send: () => null }
        }
    })

    ws.on('message', function (msg) {
        msg = JSON.parse(msg)

        // TODO need to handle join failure - maybe joining should be handled through HTTP, not WS
        // TODO reconnect should somehow detect if it is really the same guy, not someone else just 'stealing the name', e.g. check:
        //      a) check that the connection of that player is dropped (not needed if the player would anyway get kicked after a timeout - see other TODO)
        //      b) have some mechanism to verify it is the same person, e.g. logon/secret mechanism or some client device identification (ip, agent, mac address, ...)
        if (msg.command === 'join') {
            if (playerClientMap[msg.playerName]) {
                console.log(`${msg.playerName} reconnected`)
                playerClientMap[msg.playerName] = ws
            } else {
                game.join(msg.playerName)
                playerClientMap[msg.playerName] = ws
            }
            update()
        }

        if (msg.command === 'start') {
            game.start()
            update()
        }

        if (msg.command === 'vote') {
            game.voteImposter(msg.playerName)
            update()
        }
    })
})

app.listen(process.env.PORT || 3000)
