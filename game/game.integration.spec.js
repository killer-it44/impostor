'use strict'

const GameFactory = require('./game-factory')

describe('game integration', () => {
    it('should have a winner when one gets voted out of 3', () => {
        const game = new GameFactory().create('de')
        game.join('alice')
        game.join('bob')
        game.join('cindy')
        game.start()
        game.voteImpostor('alice')
        expect(game.winners.length).toBeGreaterThan(0)
        expect(game.winners.length).toBeLessThan(3)
    })
})
