'use strict'

const Game = require('./game')

describe('game', () => {
    let game, randomIndexProvider, randomWordPairProvider

    beforeEach(() => {
        randomIndexProvider = { get: () => null }
        randomWordPairProvider = { get: () => null }
        game = new Game(randomIndexProvider, randomWordPairProvider)
    })

    it('can be joined', () => {
        game.join('alice')
        expect(game.players.length).toBe(1)
    })

    it('needs 3 players to start', () => {
        game.join('alice')
        expect(game.canStart()).toBe(false)
        game.join('bob')
        expect(game.canStart()).toBe(false)
        game.join('cindy')
        expect(game.canStart()).toBe(true)
    })

    describe('with 3 players (alice, bob and cindy)', () => {
        beforeEach(() => {
            game.join('alice')
            game.join('bob')
            game.join('cindy')
        })

        it('will show the same word to all players except one (=imposter) when started', () => {
            const INDEX_BOB = 1
            randomIndexProvider.get = () => INDEX_BOB
            randomWordPairProvider.get = () => ['a', 'b']

            game.start()

            expect(game.players[0].word).toEqual('a')
            expect(game.players[1].word).toEqual('b')
            expect(game.players[2].word).toEqual('a')
        })

        describe('started with alice being the imposter (=having the different word)', () => {
            beforeEach(() => {
                randomIndexProvider.get = () => 0
                randomWordPairProvider.get = () => ['a', 'b']
                game.start()
                expect(game.winner).toBe(null)
            })

            it('will end when the common word is guessed correctly - the imposter wins', () => {
                game.guessWord('a')
                expect(game.winner).toBe(Game.IMPOSTER)
                expect(game.players[0].score).toBe(2)
                expect(game.players[1].score).toBe(0)
                expect(game.players[2].score).toBe(0)
            })

            it('will continue when the common word is not guessed correctly', () => {
                game.guessWord('b')
                expect(game.winner).toBe(null)
            })

            it('will end when the imposter gets voted out - group wins, get 1 point each', () => {
                game.voteImposter('alice')
                expect(game.winner).toBe(Game.GROUP)
                expect(game.players[0].score).toBe(0)
                expect(game.players[1].score).toBe(1)
                expect(game.players[2].score).toBe(1)
            })

            it('will end when only imposter and one other left - imposter wins, gets 2 points (=size of group)', () => {
                game.voteImposter('bob')
                expect(game.winner).toBe(Game.IMPOSTER)
                expect(game.players[0].score).toBe(2)
                expect(game.players[1].score).toBe(0)
                expect(game.players[2].score).toBe(0)
            })
        })
    })
})
