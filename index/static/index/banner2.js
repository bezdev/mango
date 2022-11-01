class RecurringTimer {
    constructor(time, func) {
        this.time = time;
        this.elapsedTime = 0.0;
        this.func = func;
    }

    update(delta) {
        this.elapsedTime += delta;
        if (this.elapsedTime > this.time) {
            this.func(this.elapsedTime);
            this.elapsedTime -= this.time;
        }
    }
}

class Timer {
    constructor(startTime) {
        this.startTime = startTime;
        this.currentTime = this.startTime;
        this.delta = 0.0;
        this.recurringTimers = [];
    }

    updateTime(currentTime) {
        this.delta = currentTime - this.currentTime;
        this.currentTime = currentTime;
 
        for (let i = 0; i < this.recurringTimers.length; i++) {
            this.recurringTimers[i].update(this.delta);
        }
    }

    createRecurringTimer(time, func) {
        this.recurringTimers.push(new RecurringTimer(time, func));
    }

    getTime() {
        return this.currentTime - this.startTime;
    }
}

class Branch {
    set(x, y, angle, length, depth, isActive) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.length = length;
        this.lengthLeft = this.length;
        this.depth = depth;
        this.isActive = isActive;
        this.isNeedle = false;
        this.width = 0;
        this.color = "";
    }

    constructor(id) {
        this.id = id;
        this.set(0, 0, 0, 0, 0, 0, false, false);
    }

    getEndPoint(length) {
        let radAngle = this.angle * Math.PI / 180;
        return new Point(this.x + Math.cos(radAngle) * length, this.y + Math.sin(radAngle) * length);    }
}

class Banner {
    constructor(id) {
        this.width = 1000;
        this.height = 150;
        this.treeHeightRange = { min: 120, max: 150 };
        this.treeBucketCount = Math.floor(GetRandomBetween(3, 12));
        this.maxTrees = this.treeBucketCount < 6 ? 6 : 30;
        this.branchLimit = 10000;
        this.growSpeed = 1000;
        this.branchColor = "#ffffff";
        this.needleColor = "#006857";

        this.maxHeight = -1;
        this.maxBranchCount = -1;
        this.branchPool = Array(this.branchLimit);
        this.branchTypes = [];

        for (let i = 0; i < this.branchPool.length; i++) {
            this.branchPool[i] = new Branch(i);
        }

        this.openBranches = [];
        for (let i = 0; i < this.branchPool.length; i++) {
            this.openBranches.push(i);
        }

        var debug = document.getElementById("debug");
        let canvas = document.getElementById(id);
        canvas.width = this.width;
        canvas.height = this.height;

        this.context = canvas.getContext("2d");
        this.isFirstFrame = true;

        this.timer = new Timer();
        Banner.instance = undefined;
    }

    static getInstance() {
        if (Banner.instance === undefined) {
            Banner.instance = new Banner("banner");
        }

        return Banner.instance;
    }

    static getRandomColor() {
        let i = Math.floor(GetRandomBetween(0, 6));
        if (i === 6) return "#98efef; //this.needleColor; #ff88ff";
        //else if (i === 9) return "#ff88ff"; //"#f9f9f9"; //#00e8c5";
        //else if (i === 2) return "#ff88ff";
        else return "f9f9f9";//"#98efef";// "#8686c4";
    }

    addBranch(x, y, angle, length, depth, isActive) {
        if (this.openBranches.length === 0) return 0;

        let i = this.openBranches.pop();

        if (depth === 0) {
            // let childrenCount = Math.floor(GetRandomBetween(8, 15));
            // this.branchPool[i].children = new Array(childrenCount);

            // for (let j = 0; j < childrenCount; j++) {
            //     this.branchPool[i].children[j] = GetRandomBetween(50, length);
            // }

            // this.branchPool[i].children.sort(function(a, b) {
            //     return b - a;
            // });
        }

        this.branchPool[i].set(x, y, angle, length, depth, isActive, false);

        return i;
    }

    addBranchType(id, width, color) {
        let shouldPush = true;
        for (let i = 0; i < this.branchTypes.length; i++) {
            if (this.branchTypes[i].width === width
                && this.branchTypes[i].color === color) {
                shouldPush = false;
            }
        }

        this.branchPool[id].width = width;
        this.branchPool[id].color = color;
        if (shouldPush) this.branchTypes.push({ width: width, color: color });
    }

    removeBranch(id) {
        this.branchPool[id].x = 0;
        this.branchPool[id].y = 0;
        this.branchPool[id].angle = 0;
        this.branchPool[id].length = 0;
        this.branchPool[id].lengthLeft = 0;
        this.branchPool[id].depth = 0;
        this.branchPool[id].isActive = false;
        this.branchPool[id].isNeedle = false;
        this.branchPool[id].width = 0;
        this.branchPool[id].color = "";
        
        this.openBranches.push(id);
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
        let grassColor = "#f9f9f9";
        let grassHeight = { min: 1, max: 15 };

        this.context.fillStyle = grassColor;
        this.context.strokeStyle= grassColor; 

        for (let i = 0; i < grassCount; i++) {
            this.drawGrassBlade(GetRandomBetween(0, this.width), this.height, GetRandomInRange(grassHeight));
        }
    }

    drawBranches(delta) {
        if (delta > 100) delta = 100;
        let addedChildren = [];

        for (let a = 0; a < this.branchTypes.length; a++) {
            this.context.strokeStyle = this.branchTypes[a].color;
            this.context.globalAlpha = 1;
            this.context.lineWidth = this.branchTypes[a].width;
            this.context.lineCap = 'round';
            this.context.beginPath();

            let count = 0;
            let branchCount = this.branchPool.length - this.openBranches.length;
            for (let i = 0; i < this.branchPool.length; i++) {
                let branch = this.branchPool[i];
                if (!branch.isActive) continue;
                if (branch.width !== this.branchTypes[a].width) continue;
                if (branch.color !== this.branchTypes[a].color) continue;

                let growSpeed = 0;
                if (branch.isNeedle) {
                    growSpeed = this.growSpeed * .3;
                } else {
                    growSpeed = this.growSpeed;
                }
                growSpeed = branch.finalBranch === true ? 300 : growSpeed;
                if (growSpeed > 500) growSpeed = 10000;

                let growLength = delta / 1000 * growSpeed;
                let finalGrow = !!(branch.lengthLeft <= growLength);
                growLength = finalGrow ? branch.lengthLeft : growLength;
                branch.lengthLeft -= growLength;
                let totalGrown = branch.length - branch.lengthLeft;

                let endPoint = branch.getEndPoint(growLength);
                if (branch.isNeedle || branch.depth < 3) this.drawLine(branch.x, branch.y, endPoint.x, endPoint.y);

                branch.x = endPoint.x;
                branch.y = endPoint.y;

                if (branch.y > this.maxHeight) this.maxHeight = branch.y;
                if (branchCount > this.maxBranchCount) this.maxBranchCount = branchCount;
                while (branch.children && totalGrown > branch.children.peek()) {
                    let childBranch = branch.children.pop();

                    let depth = branch.depth + 1;
                    let angle = 0;
                    let length = branch.length;
                    let childrenCount = 0;
                    if (depth === 1) {
                        length *= .90 * (1 - childBranch / branch.length);
                        angle = branch.angle + (Math.random() < 0.5 ? -1 : 1) * GetRandomBetween(70, 130);
                        childrenCount = Math.floor(GetRandomBetween(5, 7));
                    } else if (depth < 4) {
                        length *= .70 * (1 - childBranch / branch.length);
                        childrenCount = Math.floor(GetRandomBetween(1, 4));
                        angle = branch.angle + (Math.random() < 0.5 ? -1 : 1) * GetRandomBetween(30, 60);
                    }  else if (depth === 4) {
                    }

                    let p = branch.getEndPoint(-(totalGrown - childBranch));
                    let ci = this.addBranch(p.x, p.y, angle, length, depth, false);
                    this.addBranchType(ci, 1, branch.color);
                    if (childrenCount > 0) {
                        this.branchPool[ci].children = new Array(childrenCount);

                        for (let j = 0; j < childrenCount; j++) {
                            this.branchPool[ci].children[j] = GetRandomBetween(depth === 0 ? 50 : 0, length);
                        }

                        this.branchPool[ci].children.sort(function(a, b) {
                            return b - a;
                        });
                    }

                    addedChildren.push(ci);
                }

                if (finalGrow) {
                    if (branch.depth < 3 && !branch.isNeedle) {
                        let needleCount = 0;
                        if (branch.depth === 0) needleCount = (branch.finalBranch === true) ?  500 : 300;//200;
                        else if (branch.depth === 1) needleCount = 50;
                        else if (branch.depth === 2) needleCount = 15;
                        else needleCount = 10;
                        for (let j = 0; j < needleCount; j++) {
                            let p = branch.getEndPoint(-GetRandomBetween(0, branch.length));
                            if (p.y < 30) continue;
                            let angle = -10;
                            if (Math.random() < 0.5) angle = 190;
                            let ci = this.addBranch(p.x, p.y, angle, Math.pow(1 - p.y / this.maxHeight, 2) * GetRandomBetween(40, 80), 100, true);
                            this.branchPool[ci].isNeedle = true;
                            this.addBranchType(ci, 1, branch.color);
                            this.branchPool[ci].finalBranch = branch.finalBranch;
                        }
                    }

                    if (branch.depth < 1) this.treesDrawn++;
                    this.removeBranch(i);
                }
            }

            this.context.stroke();
        }

        for (let i = 0; i < addedChildren.length; i++) {
            this.branchPool[addedChildren[i]].isActive = true;
        }
    }

    drawTree(x, y, angle, height, color, isFinalBranch) {
        let ci = this.addBranch(x, y, angle, height, 0, true);
        //this.addBranchType(ci, 2, "#ffffff");
        this.addBranchType(ci, 2, color);
        this.branchPool[ci].finalBranch = isFinalBranch;
    }

    drawTreeThread(time) {
        let banner = Banner.getInstance();
        if (banner.stopTrees) return;
        if (banner.trees == 3 && banner.treesDrawn < 3) return;
        banner.trees++;
        let search = -1;
        let color;
        if (banner.trees > banner.maxTrees) search = 1;
        if (search > 0) search = Math.floor(GetRandomBetween(0, 4));
        if (search == 3) {
            banner.stopTrees = true;
            color = "#f9f9f9";
        } else color = "#f9f9f9";

        let bucketId = banner.stopTrees ? banner.treeBucketCount - 1: Math.floor(GetRandomBetween(0, banner.treeBucketCount - 1));
        banner.drawTree(banner.treeBuckets[bucketId] + PosOrNeg() * GetRandomBetween(5, 25), 0, GetRandomBetween(85, 95), GetRandomInRange(banner.treeHeightRange), color, banner.stopTrees);
    }

   static render(currentTime) {
        let banner = Banner.getInstance();

        if (banner.isFirstFrame) {
            banner.frames = 0;
            banner.trees = 0;
            banner.treesDrawn = 0;
            banner.treeBuckets = [];
            let margin = 100;
            for (let i = 0; i < banner.treeBucketCount; i++) {
                banner.treeBuckets.push(GetRandomBetween(0 + margin, banner.width - margin));
            }
            banner.stopTrees = false;
            banner.timer = new Timer(currentTime);
            banner.timer.createRecurringTimer(1000, function(time) {
                // console.log("FPS: " + banner.frames * 1000.0 / time);
                banner.frames = 0;
            });
            banner.timer.createRecurringTimer(1, function(time) { banner.drawTreeThread(time); });
        } else {
            banner.frames++;
            banner.timer.updateTime(currentTime);

            banner.drawBranches(banner.timer.delta);
        }
        banner.isFirstFrame = false;

        if (banner.stopTrees && banner.openBranches.length == banner.branchPool.length) {
            return;
        }

        requestAnimationFrame(Banner.render);
    };

    draw() {
        this.context.clearRect(0, 0, this.width, this.height);

        // draw sky
        var gradientHeight = this.height - 15;
        var sky = this.context.createLinearGradient(0, 0, 0, gradientHeight);
        sky.addColorStop(0, "#000000");
        sky.addColorStop(1, "#11387d");
        this.context.fillStyle = sky;
        this.context.fillRect(0, 0, this.width, gradientHeight);

        sky = this.context.createLinearGradient(0, gradientHeight, 0, this.height);
        sky.addColorStop(0, "#11387d");
        // sky.addColorStop(1, "#e03569");
        sky.addColorStop(1, this.needleColor);
        this.context.fillStyle = sky;
        this.context.fillRect(0, gradientHeight, this.width, this.height);

        this.drawGrass();

        requestAnimationFrame(Banner.render);
    }
}