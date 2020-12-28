'use strict'

const Lobby = require('./application')
const GameFactory = require('../game/game-factory')

describe('lobby', () => {
    let lobby

    beforeEach(() => {
        lobby = new Lobby()
    })

    it('displays no running games initially', () => {
        expect(lobby.games).toEqual({})
    })

    it('can add a new game', () => {
        const newGame = new GameFactory().create()
        lobby.addGame('a', newGame)
        expect(lobby.games.a).toBe(newGame)
    })
})
