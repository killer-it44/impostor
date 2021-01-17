'use strict'

const words = {
    'de': require('./words-de'),
    'en': require('./words-en'),
    'zh': require('./words-zh')
}

const WordPool = function () {
    this.getCollection = (index) => {
        return [...words['de'][index]]
    }

    this.getSize = () => {
        return words['de'].length
    }
}

module.exports = WordPool
