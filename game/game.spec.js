'use strict'

const Game = require('./game')

describe('game', () => {
    let game, randomIndexProvider, randomWordPairProvider

    beforeEach(() => {
        randomIndexProvider = { get: () => null }
        randomWordPairProvider = { get: () => ['word1', 'word2'] }
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

        it('will show a different word to bob on start if he is the imposer', () => {
            const INDEX_BOB = 1
            randomIndexProvider.get = () => INDEX_BOB

            game.start()

            expect(game.players[0].word).toEqual('word1')
            expect(game.players[1].word).toEqual('word2')
            expect(game.players[2].word).toEqual('word1')
        })

        describe('started with alice being the impostor (=having the different word)', () => {
            beforeEach(() => {
                randomIndexProvider.get = () => 0
                game.start()
                expect(game.winners).toEqual([])
            })

            it('will end when common word is guessed correctly - alice wins, gets 2 points (=size of group)', () => {
                game.guessWord('word1')
                expect(game.winners).toEqual(['alice'])
                expect(game.players[0].score).toBe(2)
                expect(game.players[1].score).toBe(0)
                expect(game.players[2].score).toBe(0)
            })

            it('will continue when common word is not guessed correctly', () => {
                game.guessWord('word2')
                expect(game.winners).toEqual([])
            })

            it('will end when alive gets voted out - bob and cindy win, get 1 point each', () => {
                game.voteImpostor('alice')
                expect(game.winners).toEqual(['bob', 'cindy'])
                expect(game.players[0].score).toBe(0)
                expect(game.players[1].score).toBe(1)
                expect(game.players[2].score).toBe(1)
            })

            it('will end when bob gets voted out - alice wins, gets 2 points (=size of group)', () => {
                game.voteImpostor('bob')
                expect(game.winners).toEqual(['alice'])
                expect(game.players[0].score).toBe(2)
                expect(game.players[1].score).toBe(0)
                expect(game.players[2].score).toBe(0)
            })

            it('will end when bob gets kicked from the game - alice wins, game cannot be started anymore', () => {
                game.kick('bob')
                expect(game.winners).toEqual(['alice'])
                expect(game.canStart()).toBe(false)
            })
        })
    })

    describe('kicking players', () => {
        it('will remove the player from the game', () => {
            game.join('alice')
            game.kick('alice')
            expect(game.players.length).toBe(0)
        })

        it('will determine winner if game already started and kicking one player would end it', () => {
            game.join('alice')
            game.join('bob')
            game.join('cindy')
            game.start()
            game.kick('alice')
            expect(game.winners).not.toEqual([])
        })

        it('will not determine winner if game not started', () => {
            game.join('alice')
            game.join('bob')
            game.kick('alice')
            expect(game.winners).toEqual([])
        })
    })
})
