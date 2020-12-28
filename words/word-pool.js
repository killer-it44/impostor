'use strict'

const words = require('./words')

const WordPool = function () {
    this.getCollection = (index) => {
        return [...words[index]]
    }

    this.getSize = () => {
        return words.length
    }
}

module.exports = WordPool
