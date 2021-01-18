'use strict'

const Game = require('../game/game')
const RandomIndexProvider = require('../random-index/random-index-provider')
const RandomWordPairProvider = require('../words/random-word-pair-provider')

const GameFactory = function () {
    this.create = (wordPool, language) => {
        return new Game(new RandomIndexProvider(), new RandomWordPairProvider(wordPool, language))
    }
}

module.exports = GameFactory
