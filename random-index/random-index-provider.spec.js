'use strict'

const RandomIndexProvider = require('./random-index-provider')

describe('random index provider', () => {
    let randomIndexProvider

    beforeEach(() => {
        randomIndexProvider = new RandomIndexProvider()
    })

    it('returns always 0 if the pool size is 1', () => {
        const index = randomIndexProvider.get(0)
        expect(index).toBe(0)
    })

    it('returns 0 or 1 if the pool size is 2', () => {
        const index = randomIndexProvider.get(2)
        expect(index).toBeGreaterThanOrEqual(0)
        expect(index).toBeLessThanOrEqual(1)
    })

    it('should cover the whole range when called repeatedly', () => {
        const MAX_REPS = 100000
        const matches = new Set()
        for (let i = 0; (i < MAX_REPS) && (matches.size !== 2); i++) {
            const index = randomIndexProvider.get(2)
            matches.add(index)
        }
        expect(matches.size).toBe(2)
    })
})
