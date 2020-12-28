'use strict'

const Game = function (randomIndexProvider, randomWordPairProvider) {
    this.players = []
    this.commonWord = ''
    this.winner = null

    this.join = (name) => {
        this.players.push({ name: name, isEliminated: true, isImposter: false, word: this.commonWord, score: 0 })
    }

    this.canStart = () => {
        return this.players.length > 2
    }

    this.start = () => {
        const randomIndex = randomIndexProvider.get(this.players.length)
        const [word1, word2] = randomWordPairProvider.get()
        this.players.forEach((player, index) => {
            player.isEliminated = false
            player.isImposter = (index === randomIndex)
            player.word = player.isImposter ? word2 : word1
        })
        this.commonWord = word1
        this.winner = null
    }

    const addScore = (roleFilter, score) => {
        this.players.filter((p) => roleFilter(p)).forEach((p) => p.score += score)
    }

    this.guessWord = (word) => {
        if (word === this.commonWord) {
            this.winner = Game.IMPOSTER
            addScore((p) => p.isImposter, this.players.length - 1)
        }
    }

    this.voteImposter = (name) => {
        this.players.find((p) => p.name === name).isEliminated = true

        const remainingPlayers = this.players.filter((p) => !p.isEliminated)
        if (!remainingPlayers.find((p) => p.isImposter)) {
            this.winner = Game.GROUP
            addScore((p) => !p.isImposter, 1)
        } else if (remainingPlayers.length === 2) {
            this.winner = Game.IMPOSTER
            addScore((p) => p.isImposter, this.players.length - 1)
        }
    }
}

Game.IMPOSTER = Symbol()
Game.GROUP = Symbol()

module.exports = Game
