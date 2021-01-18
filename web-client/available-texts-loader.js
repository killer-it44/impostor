'use strict'

const fs = require('fs')

const textsDir = 'web-client/static-content/ui-texts'

const AvailableTextsLoader = function() {
    this.load = function() {
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
