'use strict'

const WordPool = require('./word-pool')

describe('word pool', () => {
    it('returns an array of strings for the given language', () => {
        const wordPool = new WordPool()
        const collection = wordPool.getCollection(0, 'de')
        expect(collection).toBeInstanceOf(Array)
        expect(collection[0]).toBeInstanceOf(String)
    })

    it('can be queried for its size for the given language', () => {
        const wordPool = new WordPool()
        const size = wordPool.getSize('de')
        expect(size).toBeInstanceOf(Number)
        expect(size).toBeGreaterThan(0)
    })

    it('can be queried for the available languages', () => {
        const wordPool = new WordPool()
        const supportedLanguages = wordPool.getSupportedLanguages()
        expect(supportedLanguages).toBeInstanceOf(Object)
        expect(supportedLanguages['en']).toBe('English')
    })
})
