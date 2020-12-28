'use strict'

const GameFactory = require('./game/game-factory')
const express = require('express')
const expressWs = require('express-ws')
const app = express()

expressWs(app)

const game = new GameFactory().create()
const clients = {}

app.use(express.static('web-client'))

app.ws('/game', function (ws) {

    const update = function () {
        const players = game.players.map((player) => ({
            name: player.name,
            isEliminated: player.isEliminated,
            score: player.score
        }))  
        game.players.forEach((player, index) => {
            clients[player.name].send(JSON.stringify({
                isStarted: Boolean(game.commonWord),
                isAdmin: (index === 0),
                players: players,
                word: player.word,
                winner: winner
            }))
        })
    }

    // TODO handle connection close - we don't want to kick out folks immediately, but maybe should at least
    // a) schedule a timeout after which the player will get kicked
    // b) inform the others if it is the admin who 'disconnected', so they can claim the admin
    ws.on('close', function () {
        players.forEach((player) => {
            if (player.client === ws) {
                console.log(`${player.name} dropped`)
                player.client = { send: () => null }
            }
        })
    })

    ws.on('message', function (msg) {
        msg = JSON.parse(msg)

        // TODO need to handle join failure - maybe joining should be handled through HTTP, not WS
        // TODO reconnect should somehow detect if it is really the same guy, not someone else just 'stealing the name', e.g. check:
        //      a) check that the connection of that player is dropped (not needed if the player would anyway get kicked after a timeout - see other TODO)
        //      b) have some mechanism to verify it is the same person, e.g. logon/secret mechanism or some client device identification (ip, agent, mac address, ...)
        if (msg.command === 'join') {
            const reconnectingPlayer = players.find((player) => player.name === msg.playerName)
            if (reconnectingPlayer) {
                console.log(`${reconnectingPlayer.name} reconnected`)
                reconnectingPlayer.client = ws
            } else {
                players.push({ name: msg.playerName, client: ws, isEliminated: false, score: 0 })
            }
            update()
        }

        if (msg.command === 'start') {
            imposterIndex = Math.floor(Math.random() * players.length)
            const selectedWordPool = words[Math.floor(Math.random() * words.length)]
            const wordPool = [...selectedWordPool]
            const rndIndex = randomIndex(wordPool.length)
            word = wordPool.splice(rndIndex, rndIndex + 1)[0]
            const rndIndex2 = randomIndex(wordPool.length)
            imposterWord = wordPool.splice(rndIndex2, rndIndex2 + 1)[0]
            players.forEach((player) => player.isEliminated = false)
            isStarted = true
            winner = ''
            foundImposter = ''
            update()
        }

        if (msg.command === 'vote') {
            players.find((player) => (player.name === msg.playerName)).isEliminated = true
            const numberOfPlayersLeft = players.filter((player) => !player.isEliminated).length
            if (players[imposterIndex].isEliminated) {
                isStarted = false
                players.forEach((player) => {
                    player.score += (player === players[imposterIndex]) ? 0 : 1
                })
                winner = 'group'
                foundImposter = players[imposterIndex].name
                imposterIndex = -1
            } else if (numberOfPlayersLeft <= 2) {
                players[imposterIndex].score += players.length - 1
                isStarted = false
                winner = 'imposter'
                foundImposter = players[imposterIndex].name
                imposterIndex = -1
            }
            update()
        }
    })
})

app.listen(process.env.PORT || 3000)
