function GetRandomInRange(range) {
    return Math.random() * (range.max - range.min) + range.min;
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