'use strict'

const RandomIndexProvider = function() {
    this.get = (poolSize) => {
        return Math.floor(Math.random() * poolSize)
    }
}

module.exports = RandomIndexProvider
