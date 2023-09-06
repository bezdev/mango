class Banner {
    constructor(id) {
        this.TREE_HEIGHT_RANGE = { min: 120, max: 150 };
        this.TREE_NEEDLES_COUNT = 400;

        let canvas = document.getElementById(id);
        let computedStyle = window.getComputedStyle(canvas);
        this.height = parseInt(computedStyle.getPropertyValue("height", 10));
        this.width = parseInt(computedStyle.getPropertyValue("width", 10));
        canvas.height = this.height;
        canvas.width = this.width;

        this.context = canvas.getContext("2d");

        Banner.instance = undefined;
    }

    static getInstance() {
        if (Banner.instance === undefined) {
            Banner.instance = new Banner("banner");
        }

        return Banner.instance;
    }

    drawLine(x1, y1, x2, y2) {
        this.context.moveTo(x1, this.height - y1);
        this.context.lineTo(x2, this.height - y2);
    }

    drawGrassBlade(x, y, height) {
        let grassOffset = { min: 2,  max: 5 };

        this.context.beginPath();
        this.context.moveTo(x, y);
        var xOffsetTop = (Math.random() < 0.5 ? -1 : 1) * GetRandomInRange(grassOffset);
        var xOffsetBottom = (xOffsetTop > 0 ? 1 : -1) * 2;
        this.context.bezierCurveTo(x, y, x, y - height / 3, x + xOffsetTop, y - height);
        this.context.bezierCurveTo(x + xOffsetBottom, y - height / 3, x + xOffsetBottom, y, x + xOffsetBottom, y);
        this.context.stroke();
        this.context.fill();
    }

    drawGrass() {
        let grassCount = 1000;
        let grassColor = "#1e1e2c";
        let grassHeightRange = { min: 1, max: 15 };


        this.context.fillStyle = grassColor;
        this.context.strokeStyle= grassColor; 
        for (let i = 0; i < grassCount; i++) {
            let grassHeight = GetRandomInRange(grassHeightRange);
            this.drawGrassBlade(GetRandomBetween(0, this.width), this.height, grassHeight);
        }
    }

    drawTree(x, y, angle, height, color) {
        this.context.strokeStyle = color;
        this.context.globalAlpha = 1;
        this.context.lineCap = 'round';

        this.context.beginPath();

        let getEndPoint = function(x, y, angle, length) {
            let radAngle = angle * Math.PI / 180;
            return new Point(x + Math.cos(radAngle) * length, y + Math.sin(radAngle) * length);
        }

        // draw trunk
        this.context.lineWidth = 2;
        let endPoint = getEndPoint(x, y, angle, height);
        this.drawLine(x, y, endPoint.x, endPoint.y);

        // draw children
        this.context.lineWidth = 1;
        for (let i = 0; i < this.TREE_NEEDLES_COUNT; i++) {
            let branchStartHeight = GetRandomBetween(20, 100) / 100 * height;
            let branchStart = getEndPoint(x, y, angle, branchStartHeight);
            let branchAngle = (Math.random() < 0.5) ? -10 : 190;
            let branchEnd = getEndPoint(branchStart.x, branchStart.y, branchAngle, Math.pow(1 - branchStart.y / height, 2) * GetRandomBetween(40, 80));
            this.drawLine(branchStart.x, branchStart.y, branchEnd.x, branchEnd.y);
        }

        this.context.stroke();
    }

    drawSky() {
        var gradientHeight = this.height;
        var sky = this.context.createLinearGradient(0, 0, 0, gradientHeight);
        sky.addColorStop(0, "#000000");
        sky.addColorStop(.8, "#11387d");
        sky.addColorStop(1, "#11387d");
        this.context.fillStyle = sky;
        this.context.fillRect(0, 0, this.width, gradientHeight);
    }

    drawTrees() {
        let colorStart = "#11387d";
        let colorEnd = "#ffffff";
        let bounds = { min: 10, max: this.width - 10 };
        let rowCount = 2;
        let treeCount = 100;
        
        for (let row = 0; row < rowCount; row++) {
            let factor = row / (rowCount - 1);
            let color = InterpolateColor(colorStart, colorEnd, factor);
            let isFinalRow = row === rowCount - 1;
            let currentTreeCount = isFinalRow ? 23 : (1 - row / (rowCount)) * treeCount;
            if (isFinalRow) {
                let x = GetRandomBetween(bounds.min, bounds.max);
                bounds = { min: x - 100, max: x + 100 };
            }
            for (let i = 0; i < currentTreeCount; i++) {
                let x = GetRandomBetween(bounds.min, bounds.max);
                this.drawTree(
                    x,
                    0,
                    GetRandomBetween(85, 95),
                    GetRandomInRange(this.TREE_HEIGHT_RANGE),
                    color
                );
            }
        }
    }

    draw() {
        this.context.clearRect(0, 0, this.width, this.height);

        this.drawSky();

        this.drawTrees();

        this.drawGrass();
    }
}