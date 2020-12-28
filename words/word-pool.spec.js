'use strict'

const WordPool = require('./word-pool')

describe('word pool', () => {
    it('returns an array of strings', () => {
        const wordPool = new WordPool()
        const collection = wordPool.getCollection(0)
        expect(collection).toBeInstanceOf(Array)
        expect(collection[0]).toBeInstanceOf(String)
    })

    it('can be queried for its size', () => {
        const wordPool = new WordPool()
        const size = wordPool.getSize()
        expect(size).toBeInstanceOf(Number)
    })
})
