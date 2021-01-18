'use strict'

const UiTexts = function (availableTexts) {
    const addGeneralLanguagesIfNotExisting = function (languages) {
        const specificLangs = languages.filter(l => l.length > 2)
        specificLangs.forEach((sl) => {
            const generalLang = sl.substr(0, 2)
            if (!languages.includes(generalLang)) {
                languages.splice(languages.indexOf(sl) + 1, 0, generalLang)
            }
        })
    }

    const mergeTextsForLanguages = function (languages) {
        let mergedTexts = {}
        languages.forEach((language) => {
            const moreSpecificLang = Object.keys(availableTexts).find(lang => lang.substr(0, 2) === language)
            mergedTexts = {
                ...(availableTexts[language] || availableTexts[moreSpecificLang] || {}),
                ...mergedTexts
            }
        })
        return mergedTexts
    }

    this.loadMergedTexts = function (acceptedLanguagesInOrder) {
        const languages = [...acceptedLanguagesInOrder]
        addGeneralLanguagesIfNotExisting(languages)
        if (!languages.includes('en')) languages.push('en')
        return mergeTextsForLanguages(languages)
    }
}

module.exports = UiTexts
