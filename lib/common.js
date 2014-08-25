/**
 * shuffle
 *
 * @param {Number|undefined} times
 * @return {Array}
 */
Array.prototype.shuffle = function(times) {
    if(undefined === times) times = this.length * 2;

    var temp;
    while(times--) {
        var a = Number.random(0, this.length - 1);
        var b = Number.random(0, this.length - 1);
        temp = this[a];
        this[a] = this[b];
        this[b] = temp;
    }

    return this;
};

