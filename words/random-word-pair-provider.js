'use strict'

const RandomIndexProvider = require('../random-index/random-index-provider')

const RandomWordPairProvider = function(wordPool) {
    const randomIndexProvider = new RandomIndexProvider()

    this.get = () => {
        const collection = wordPool.getCollection(randomIndexProvider.get(wordPool.getSize()))

        const rndIndex1 = randomIndexProvider.get(collection.length)
        const word1 = collection.splice(rndIndex1, rndIndex1 + 1)[0]
        const rndIndex2 = randomIndexProvider.get(collection.length)
        const word2 = collection.splice(rndIndex2, rndIndex2 + 1)[0]
        
        return [word1, word2]
    }
}

module.exports = RandomWordPairProvider
