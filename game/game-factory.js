'use strict'

const Game = require('../game/game')
const RandomIndexProvider = require('../random-index/random-index-provider')
const RandomWordPairProvider = require('../words/random-word-pair-provider')
const WordPool = require('../words/word-pool')

const GameFactory = function () {
    this.create = () => {
        return new Game(new RandomIndexProvider(), new RandomWordPairProvider(new WordPool()))
    }
}

module.exports = GameFactory
