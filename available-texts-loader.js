'use strict'

const fs = require('fs')

const AvailableTextsLoader = function() {
    this.load = function(textsDir) {
        const availableTexts = {}
        
        const availableLanguageFiles = fs.readdirSync(textsDir)
        availableLanguageFiles.forEach((langFile) => {
            const content = JSON.parse(fs.readFileSync(`${textsDir}/${langFile}`))
            availableTexts[langFile.split('.')[0]] = content
        })

        return availableTexts
    }
}

module.exports = AvailableTextsLoader
