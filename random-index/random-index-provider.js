'use strict'

const RandomIndexProvider = function() {
    this.get = (poolSize) => {
        if (poolSize > 0) {
            return Math.floor(Math.random() * poolSize)
        }
        throw new Error('expected a value greater than 0')
    }
}

module.exports = RandomIndexProvider
