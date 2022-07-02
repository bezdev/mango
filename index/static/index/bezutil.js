class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

function GetRandomInRange(range) {
    return Math.random() * (range.max - range.min) + range.min;
}

function GetRandomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

function GetRandomElementsBetween(count, min, max) {
    let result = [];
    for (let i = 0; i < count; i++) {
        result.push(GetRandomBetween(min, max));
    }

    return result;
}

function PosOrNeg() {
    return Math.random() < 0.5 ? -1 : 1;
}

function YesOrNow() {
    return PosOrNegOne() > 0;
}

function randomColor() {
    var r = (Math.round(Math.random() * GetRandomInRange({ min: 100, max: 255 }))).toString(16);
    if (r.length == 1) { r = "0" + r; }
    var g = (Math.round(Math.random() * GetRandomInRange({ min: 100, max: 255 }))).toString(16);
    if (g.length == 1) { g = "0" + g; }
    var b = (Math.round(Math.random() * GetRandomInRange({ min: 100, max: 255 }))).toString(16);
    if (b.length == 1) { b = "0" + b; }

    return "#" + Math.floor(Math.random()*16777215).toString(16); //"#" + r + g + b;
}

function RoundToNearestMultipleOf(number, multiple) {
    var retVal = number / multiple;
    if (number % multiple !== 0) {
        if (retVal > 0) {
            retVal = Math.floor(retVal) + 1;
        } else {
            retVal = Math.ceil(retVal) - 1;
        }
    }

    return retVal *= multiple;
}

function getPositionOfElement(element) {
    for (var xOffset = 0, yOffset = 0; element != null; xOffset += element.offsetLeft, yOffset += element.offsetTop, element = element.offsetParent);
    return {x: xOffset, y: yOffset};
}

Array.prototype.peek = function() {
    return this[this.length - 1];
};