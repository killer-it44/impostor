'use strict'

const RandomWordPairProvider = require('./random-word-pair-provider')

const fakeWordPoolFor = (words) => ({ 
    getCollection: (index) => [...words[index]], 
    getSize: () => words.length 
})

describe('random word pair provider', () => {
    describe('with word pool of only one pair', () => {
        it('returns always the same pair', () => {
            const randomWordPairProvider = new RandomWordPairProvider(fakeWordPoolFor([['a', 'b']]))
            const words = randomWordPairProvider.get()
            expect(words.sort()).toEqual(['a', 'b'])
        })
    })

    describe('with word pool of one triplet', () => {
        it('returns a random pair where both words are contained in the triplet', () => {
            const randomWordPairProvider = new RandomWordPairProvider(fakeWordPoolFor([['a', 'b', 'c']]))
            const words = randomWordPairProvider.get()
            expect(words.length).toBe(2)
            expect(words[0]).not.toBe(words[1])
            expect(['a', 'b', 'c']).toContain(words[0])
            expect(['a', 'b', 'c']).toContain(words[1])
        })

        it('should cover all words when called repeatedly', () => {
            const randomWordPairProvider = new RandomWordPairProvider(fakeWordPoolFor([['a', 'b', 'c']]))
            const MAX_REPS = 100000
            const matches = new Set()

            for (let i = 0; (i < MAX_REPS) && (matches.size !== 3); i++) {
                const words = randomWordPairProvider.get()
                matches.add(words[0]).add(words[1])
            }
            expect([...matches.values()].sort()).toEqual(['a', 'b', 'c'])
        })
    })

    describe('with word pool of two pairs', () => {
        it('should cover whole pool when called repeatedly', () => {
            const randomWordPairProvider = new RandomWordPairProvider(fakeWordPoolFor([['a', 'b'], ['c', 'd']]))
            const MAX_REPS = 100000
            const matches = new Set()

            for (let i = 0; (i < MAX_REPS) && (matches.size !== 4); i++) {
                const words = randomWordPairProvider.get()
                matches.add(words[0]).add(words[1])
            }
            expect([...matches.values()].sort()).toEqual(['a', 'b', 'c', 'd'])
        })
    })
})
