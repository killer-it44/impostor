'use strict'

const UiTexts = require('./ui-texts')

describe('UI Texts', () => {
    it('returns the texts for the preferred language', () => {
        let uiTexts = new UiTexts({ 'en': { 'MY_TEXT': 'hello world' } })
        expect(uiTexts.loadMergedTexts(['en'])['MY_TEXT']).toBe('hello world')
    })

    it('considers the order of the preferred languages and merges accordingly', () => {
        let uiTexts = new UiTexts({
            'en': { 'MY_TEXT': 'hello world' },
            'de': { 'MY_TEXT': 'hallo welt', 'ANOTHER_TEXT': 'anderer text' }
        })
        const texts = uiTexts.loadMergedTexts(['en', 'de'])
        expect(texts['MY_TEXT']).toBe('hello world')
        expect(texts['ANOTHER_TEXT']).toBe('anderer text')
    })

    it('defaults to "en" if text not available in preferred language, even if "en" is not requested', () => {
        let uiTexts = new UiTexts({ 'en': { 'MY_TEXT': 'hello world' } })
        expect(uiTexts.loadMergedTexts(['de'])['MY_TEXT']).toBe('hello world')
    })

    it('defaults to "en" even if no preferred language provided', () => {
        let uiTexts = new UiTexts({ 'en': { 'MY_TEXT': 'hello world' } })
        expect(uiTexts.loadMergedTexts([])['MY_TEXT']).toBe('hello world')
    })
})

