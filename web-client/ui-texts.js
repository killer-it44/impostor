'use strict'

const UiTexts = function (availableTexts) {
    // REVISE can it be done as part of the lookup to eliminate constructor logic?
    // fallbacks: if e.g. there is no 'en.json', but 'en-US.json', then requesting texts for 'en' should return en-US
    Object.keys(availableTexts).filter(lang => lang.length > 2).forEach(specificLang => {
        if (!availableTexts[specificLang.substr(0, 2)]) {
            availableTexts[specificLang.substr(0, 2)] = availableTexts[specificLang]
        }
    })

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
            mergedTexts = { ...availableTexts[language] || {}, ...mergedTexts }
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
