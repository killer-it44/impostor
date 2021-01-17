'use strict'

const RandomIndexProvider = require('../random-index/random-index-provider')

const RandomWordPairProvider = function(wordPool, language) {
    const randomIndexProvider = new RandomIndexProvider()

    this.get = () => {
        const wordPoolSize = wordPool.getSize(language)
        const collection = wordPool.getCollection(randomIndexProvider.get(wordPoolSize), language)

        const rndIndex1 = randomIndexProvider.get(collection.length)
        const word1 = collection.splice(rndIndex1, rndIndex1 + 1)[0]
        const rndIndex2 = randomIndexProvider.get(collection.length)
        const word2 = collection.splice(rndIndex2, rndIndex2 + 1)[0]
        
        return [word1, word2]
    }
}

module.exports = RandomWordPairProvider
