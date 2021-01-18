'use strict'

const Game = require('./game')

describe('game', () => {
    let game, randomIndexProvider, randomWordPairProvider

    beforeEach(() => {
        randomIndexProvider = { get: () => 0 }
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

        it('will show a different word to bob on start if he is the impostor', () => {
            const INDEX_BOB = 1
            randomIndexProvider.get = () => INDEX_BOB
            randomWordPairProvider.get = () => ['word1', 'word2']

            game.start()

            expect(game.players[0].word).toEqual('word1')
            expect(game.players[1].word).toEqual('word2')
            expect(game.players[2].word).toEqual('word1')
        })

        describe('started with alice being the impostor (=having the different word)', () => {
            beforeEach(() => {
                randomIndexProvider.get = () => 0
                randomWordPairProvider.get = () => ['chess', 'checkers']
                game.start()
                expect(game.winners).toEqual([])
            })

            it('will end when common word is guessed correctly - alice wins, gets 2 points (=size of group)', () => {
                game.guessWord('chess')
                expect(game.winners).toEqual(['alice'])
                expect(game.players[0].score).toBe(2)
                expect(game.players[1].score).toBe(0)
                expect(game.players[2].score).toBe(0)
            })

            it('will continue when common word is not guessed correctly', () => {
                game.guessWord('checkers')
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

        describe('guessing word', () => {
            it('will consider as correct if close enough', () => {
                randomWordPairProvider.get = () => ['Tom & Jerry', 'Sylvester & Tweety']
                game.start()
                game.guessWord('tom and jerry')
                expect(game.winners).not.toEqual([])

                game.start()
                game.guessWord('tom & jerri')
                expect(game.winners).not.toEqual([])
            })

            it('will not consider as correct if too different', () => {
                randomWordPairProvider.get = () => ['Tom & Jerry', 'Sylvester & Tweety']
                game.start()
                game.guessWord('tom and jerri')
                expect(game.winners).toEqual([])

                randomWordPairProvider.get = () => ['Shakespeare', 'Li Bai']
                game.start()
                game.guessWord('shakesbier')
                expect(game.winners).toEqual([])
            })

            it('will check if closer to the common word if the guess is close to both', () => {
                randomWordPairProvider.get = () => ['principal', 'principle']
                game.start()
                game.guessWord('principle')
                expect(game.winners).toEqual([])
                game.guessWord('principl')
                expect(game.winners).toEqual([])
                game.guessWord('prinzipal')
                expect(game.winners).not.toEqual([])
            })

            it('will ignore the hints in braces', () => {
                randomWordPairProvider.get = () => ['Checkers (game)', 'Chess']
                game.start()
                game.guessWord('checkers')
                expect(game.winners).not.toEqual([])

                randomWordPairProvider.get = () => ['Checkers', 'Chess']
                game.start()
                game.guessWord('checkers (game)')
                expect(game.winners).not.toEqual([])
            })
        })
    })

    describe('with 4 players (alice, bob, cindy and dave), started with alice being the impostor', () => {
        beforeEach(() => {
            randomIndexProvider.get = () => 0
            game.join('alice')
            game.join('bob')
            game.join('cindy')
            game.join('dave')
            game.start()
        })

        it('will continue when bob gets voted out', () => {
            game.voteImpostor('bob')
            expect(game.winners).toEqual([])
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
