'use strict'

const Application = function() {

    this.games = {}
    
    this.addGame = (key, game) => {
        this.games[key] = game
    }
}

module.exports = Application
