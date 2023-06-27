class El {
    static H1 = "H1";
    static DIV = "DIV";
}

class Components {
    static Show(element) {
        element.style.display = "block";
    }

    static Hide(element) {
        element.style.display = "none";
    }

    static SetAttributes(element, attributes) {
        for (const [key, value] of Object.entries(attributes)) {
            element.setAttribute(key, value);
        }
    }

    static AddChild(parent, child) {
        parent.appendChild(child);
        return parent;
    }

    static AddChildGetChild(parent, child) {
        parent.appendChild(child);
        return child;
    }

    static SCRIPT(attributes) {
        let el = document.createElement("script");
        if (attributes) this.SetAttributes(el, attributes);
        return el;
    }

    static DIV(attributes) {
        let el = document.createElement("div");
        if (attributes) this.SetAttributes(el, attributes);
        return el;
    }

    static SPAN(attributes) {
        let el = document.createElement("span");
        if (attributes) this.SetAttributes(el, attributes);
        return el;
    }

    static A(attributes) {
        let el = document.createElement("a");
        if (attributes) this.SetAttributes(el, attributes);
        return el;
    }

    static UL(attributes) {
        let el = document.createElement("ul");
        if (attributes) this.SetAttributes(el, attributes);
        return el;
    }

    static LI(attributes) {
        let el = document.createElement("li");
        if (attributes) this.SetAttributes(el, attributes);
        return el;
    }
}
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

function Slugify(string) {
    string = string
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();

    if (string.endsWith('-')) {
        string = string.slice(0, -1);
    }

    return string;
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

function SmoothScroll(targetId, duration) {
    const body = document.getElementById("body");
    const startPosition = body.scrollTop;
    const targetPosition = (typeof targetId === 'number') ? targetId : document.getElementById(targetId).offsetTop;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }

    function scrollAnimation(currentTime) {
        if (startTime === null) {
            startTime = currentTime;
        }
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const easing = easeInOutCubic(progress);
        body.scrollTop = startPosition + distance * easing;
        if (elapsedTime < duration) {
            requestAnimationFrame(scrollAnimation);
        }
    }

    setTimeout(() => {
        requestAnimationFrame(scrollAnimation);
    }, 1);
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