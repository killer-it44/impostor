'use strict'

const Game = function (randomIndexProvider, randomWordPairProvider) {
    this.players = []
    this.commonWord = ''
    this.winners = []
    this.isStarted = false

    this.join = (name) => {
        this.players.push({ name: name, isEliminated: true, isImpostor: false, word: this.commonWord, score: 0 })
    }

    this.canStart = () => {
        return this.players.length > 2
    }

    this.start = () => {
        const randomIndex = randomIndexProvider.get(this.players.length)
        const [word1, word2] = randomWordPairProvider.get()
        this.players.forEach((player, index) => {
            player.isEliminated = false
            player.isImpostor = (index === randomIndex)
            player.word = player.isImpostor ? word2 : word1
        })
        this.commonWord = word1
        this.winners = []
        this.isStarted = true
    }

    const addScore = (roleFilter, score) => {
        this.players.filter((p) => roleFilter(p)).forEach((p) => p.score += score)
    }

    const impostorWins = () => {
        this.winners = this.players.filter((p) => p.isImpostor).map((p) => p.name)
        addScore((p) => p.isImpostor, this.players.length - 1)
        this.isStarted = false
    }

    const groupWins = () => {
        this.winners = this.players.filter((p) => !p.isImpostor).map((p) => p.name)
        addScore((p) => !p.isImpostor, 1)
        this.isStarted = false
    }

    this.guessWord = (word) => {
        if (word === this.commonWord) {
            impostorWins()
        }
    }

    const checkIfFinished = () => {
        const remainingPlayers = this.players.filter((p) => !p.isEliminated)
        if (!remainingPlayers.find((p) => p.isImpostor)) {
            groupWins()
        } else if (remainingPlayers.length === 2) {
            impostorWins()
        }
    }

    this.voteImpostor = (name) => {
        this.players.find((p) => p.name === name).isEliminated = true
        checkIfFinished()
    }

    this.kick = (name) => {
        this.players = this.players.filter((p) => p.name !== name)
        if (this.isStarted) {
            checkIfFinished()
        }
    }
}

module.exports = Game
