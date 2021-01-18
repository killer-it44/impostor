'use strict'

const AvailableTextsLoader = require('../available-texts-loader')

const pools = new AvailableTextsLoader().load('words/pools')
const supportedLanguages = {}
Object.keys(pools).forEach(lang => supportedLanguages[pools[lang].code] = pools[lang].nativeName);

const WordPool = function () {
    this.getCollection = (index, language) => [...pools[language].words[index]]
    this.getSize = language => pools[language].words.length
    this.getSupportedLanguages = () => supportedLanguages
}

module.exports = WordPool
