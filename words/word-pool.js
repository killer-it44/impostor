'use strict'

const words = {
    'de': require('./words-de'),
    'en': require('./words-en'),
    'zh': require('./words-zh')
}

const WordPool = function () {
    this.getCollection = (index, language) => {
        return [...words[language][index]]
    }

    this.getSize = (language) => {
        return words[language].length
    }
}

module.exports = WordPool
