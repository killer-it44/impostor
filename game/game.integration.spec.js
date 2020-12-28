'use strict'

const GameFactory = require('./game-factory')
const { IMPOSTER, GROUP } = require('./game')

describe('game', () => {
    let game

    beforeEach(() => {
        game = new GameFactory().create()
        game.join('alice')
        game.join('bob')
        game.join('cindy')
    })

    it('can play multiple rounds - sometimes the imposter should win, sometimes the group should winn', () => {
        const MAX_REPS = 100000
        const winners = new Set()

        for (let i = 0; (i < MAX_REPS) && (winners.size !== 2); i++) {
            game.start()
            game.voteImposter('alice')
            winners.add(game.winner)
        }
        expect(winners.size).toBe(2)
        expect(winners.has(IMPOSTER) && winners.has(GROUP)).toBeTrue()
    })
})
