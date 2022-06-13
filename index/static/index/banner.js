function Banner(banner) {
    var DrawStar = function(x, y) {
        var INNER_STAR_RADIUS = { min: 0, max: 1 };
        var OUTER_STAR_RADIUS = { min: 1, max: 2 };

        var outerStarRadius = GetRandomInRange(OUTER_STAR_RADIUS)
        var gradient = context.createRadialGradient(x, y, GetRandomInRange(INNER_STAR_RADIUS), x, y, outerStarRadius);

        var r = (Math.round(Math.random() * GetRandomInRange({ min: 100, max: 255 }))).toString(16);
        if (r.length == 1) { r = "0" + r; }  // needs to be 2 digits, so prefix with '0' if necessary
        var g = (Math.round(Math.random() * GetRandomInRange({ min: 100, max: 255 }))).toString(16);
        if (g.length == 1) { g = "0" + g; }  // needs to be 2 digits, so prefix with '0' if necessary
        var b = (Math.round(Math.random() * GetRandomInRange({ min: 100, max: 255 }))).toString(16);
        if (b.length == 1) { b = "0" + b; }  // needs to be 2 digits, so prefix with '0' if necessary
        var outerColor = "#" + r + g + b;
        gradient.addColorStop(0, "#ffffff");
        gradient.addColorStop(1, outerColor);

        context.beginPath();
        context.arc(x, y, outerStarRadius, 0, 2 * Math.PI);

        context.fillStyle = gradient;
        context.stroke();
        context.fill();
    };

    var DrawGrass = function(x, y, height) {
        var TOP_OFFSET = { min: 2,  max: 5 };

        context.fillStyle = GRASS_COLOR;
        context.strokeStyle= GRASS_COLOR;
        context.beginPath();
        context.moveTo(x, y);
        var xOffsetTop = (Math.random() < 0.5 ? -1 : 1) * GetRandomInRange(TOP_OFFSET);
        var xOffsetBottom = (xOffsetTop > 0 ? 1 : -1) * 2;
        context.bezierCurveTo(x, y, x, y - height / 3, x + xOffsetTop, y - height);
        context.bezierCurveTo(x + xOffsetBottom, y - height / 3, x + xOffsetBottom, y, x + xOffsetBottom, y);
        context.stroke();
        context.fill();
    };

    var DrawMapleTree = function(x, y, height) {
        var TRUNK_LENGTH =          { min: 10,   max: 10   };
        var TRUNK_BRANCH_POSITION = { min: 0.1,  max: 0.80 };
        var TRUNK_ANGLE =           { min: 80,   max: 100  };
        var NUM_CHILDREN =          { min: 5,    max: 7    };
        var BRANCH_ANGLE =          { min: 20,   max: 60   };
        var BRANCH_MULTIPLIER =     { min: 0.5,  max: 0.5  };
        var BRANCH_POSITION =       { min: 0.25, max: 0.75 };
        var BRANCH_DEPTH =          { min: 3,    max: 3    };
        var LEAF_RADIUS = 20;
        var GROW_SPEED = 2000;//300;
        var BRANCH_COLOR = "#ffffff";

        var DrawLine = function(p1, p2) {
            context.moveTo(p1.x, p1.y);
            context.lineTo(p2.x, p2.y);
            //context.moveTo(Math.round(p1.x), Math.round(p1.y));
            //context.lineTo(Math.round(p2.x), Math.round(p2.y));
        };

        var GetDistanceBetweenTwoPoints = function(p1, p2) {
            dx = p2.x - p1.x;
            dy = p2.y - p1.y;

            return Math.abs(Math.sqrt(dx * dx + dy * dy));
        };

        var GetEndPoint = function(p, angle, length) {
            radAngle = angle * Math.PI / 180;
            return { x: p.x + Math.cos(radAngle) * length,
                     y: p.y - Math.sin(radAngle) * length };
        };

        // generate locations on the branch where the children should spawn
        var GenerateArrayOfChildrenPositions = function(branchLength, position) {
            var numChildren = Math.round(GetRandomInRange(NUM_CHILDREN));
            var children = new Array(numChildren);
            
            for (var i = 0; i < numChildren; i++) {
                children[i] = GetRandomInRange(position) * branchLength;
            }

            children.sort(function(a, b) {
                return a - b;
            });

            return children;
        };

        function IsFinished() {
            return finished;
        }

        function Render(currentTime) {
            if(!startTime) {
                startTime = currentTime;
                lastTime = currentTime;
                requestAnimationFrame(Render);
                return;
            }

            var growSinceLastTime = (currentTime - lastTime) / 1000 * GROW_SPEED;

            context.lineWidth = 2; // (BRANCH_DEPTH.max + 1) - branches[i].depth;
            context.lineCap = 'round';
            context.beginPath();

            var branchesLeft = false;

            // iterate through all branches and update those who can grow
            for (var i = 0; i < branches.length; i++) {
                if (branches[i].lengthLeft <= 0)
                    continue;

                branchesLeft = true;

                // calculate length to draw in this current time frame
                var growLength = growSinceLastTime;

                // if there is an initial grow, use that instead
                if (branches[i].initialGrow > 0) {
                    growLength = branches[i].initialGrow;
                    branches[i].initialGrow = 0;
                }

                // actual growth length can't be longer than the remaining length of the branch
                var actualGrowLength = branches[i].lengthLeft - growLength > 0 ? growLength : branches[i].lengthLeft;

                var endPoint = GetEndPoint(branches[i], branches[i].angle, actualGrowLength)

                DrawLine(branches[i], endPoint);

                branches[i].lengthLeft -= growLength;

                // see if there are any children to be made
                if (branches[i].depth < BRANCH_DEPTH.max && branches[i].children.length > 0) {
                    var lengthDrawn = branches[i].length - branches[i].lengthLeft;
                    while(lengthDrawn >= branches[i].children[0])
                    {
                        var childLength = GetRandomInRange(BRANCH_MULTIPLIER) * branches[i].initialLength;
                        var childAngle = branches[i].angle + ((Math.random() < 0.5 ? -1 : 1) * GetRandomInRange(BRANCH_ANGLE));
                        var childGrowLength = lengthDrawn - branches[i].children[0];
                        var childStartPoint = GetEndPoint(branches[i], branches[i].angle, growLength - childGrowLength);
                        var generatedChildren = GenerateArrayOfChildrenPositions(childLength, BRANCH_POSITION);
                        branches.push({
                            x: childStartPoint.x,
                            y: childStartPoint.y,
                            initialGrow: childGrowLength,
                            initialLength: childLength,
                            length: generatedChildren[generatedChildren.length - 1],
                            lengthLeft: generatedChildren[generatedChildren.length - 1],
                            angle: childAngle,
                            depth: branches[i].depth + 1,
                            children: generatedChildren
                        });

                        branches[i].children.shift();
                    }
                }

                // make a leaf if this is the end
                if (branches[i].depth == BRANCH_DEPTH.max && branches[i].lengthLeft <= 0) {
                    leafs.push(endPoint);
                }

                branches[i].x = endPoint.x;
                branches[i].y = endPoint.y;
            }

            context.stroke();

            context.globalAlpha = 0.5;
            while(leafs.length > 0) {
                var leaf = leafs.shift();

                var r = "ff";
                var g = (Math.round(Math.random() * GetRandomInRange({ min: 100, max: 255 }))).toString(16);
                if (g.length == 1) { g = "0" + g; }  // needs to be 2 digits, so prefix with '0' if necessary
                var b = "00";
                context.strokeStyle = "#" + r + g + b;
                context.fillStyle = "#" + r + g + b;

                context.beginPath();
                context.arc(leaf.x, leaf.y, LEAF_RADIUS, 0, 2 * Math.PI, false);
                context.closePath();
                context.stroke();
                context.fill();
            }

            context.strokeStyle = BRANCH_COLOR;
            context.fillStyle = BRANCH_COLOR;
            context.globalAlpha = 1;

            // document.getElementById("fps").innerText = 1000 / (currentTime - lastTime);

            lastTime = currentTime;
            if (branchesLeft) {
                requestAnimationFrame(Render);
            } else {
                finished = true;
            }
        }

        var finished = false;

        var startTime;
        var lastTime;

        var branches = [];
        var leafs = [];

        // add trunk as initial branch
        var generatedChildren = GenerateArrayOfChildrenPositions(height, TRUNK_BRANCH_POSITION);
        var trunk = {
            x: x,
            y: y,
            initialGrow: 0,
            initialLength: height,
            length: generatedChildren[generatedChildren.length - 1],
            lengthLeft: generatedChildren[generatedChildren.length - 1],
            angle: GetRandomInRange(TRUNK_ANGLE),
            depth: 1,
            children: generatedChildren
        };
        branches.push(trunk);

        context.strokeStyle = BRANCH_COLOR;

        requestAnimationFrame(Render);
    };

    var debug = document.getElementById("debug");
    var canvas = document.getElementById(banner);
    canvas.width = 1000;
    canvas.height = 250;
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    // draw sky
    var gradientHeight = canvas.height - 50;
    var sky = context.createLinearGradient(0, 0, 0, gradientHeight);
    sky.addColorStop(0, "#150c21");
    sky.addColorStop(1, "#81387d");
    context.fillStyle = sky;
    context.fillRect(0, 0, canvas.width, gradientHeight);

    sky = context.createLinearGradient(0, gradientHeight, 0, canvas.height);
    sky.addColorStop(0, "#81387d");
    sky.addColorStop(1, "#e03569");
    context.fillStyle = sky;
    context.fillRect(0, gradientHeight, canvas.width, canvas.height);

/*
    // draw stars
    var starsLeft = 500;
    while (starsLeft > 0) {
        DrawStar(GetRandomInRange({ min: 0, max: canvas.width }), GetRandomInRange({ min: 0, max: canvas.height }));
        starsLeft--;
    }
*/

    // draw maples
    var MAPLE_SPAWN_DELAY =    { min: 0, max: 0 };
    var MAPLE_SPAWN_POSITION = { min: 100, max: 900 };
    var mapleTreesLeft = 13;
    var currentSpawnTime = 0;
    while (mapleTreesLeft > 0) {
        var spawnDelay = GetRandomInRange(MAPLE_SPAWN_DELAY);
        currentSpawnTime += spawnDelay
        setTimeout(function() {
            DrawMapleTree(GetRandomInRange(MAPLE_SPAWN_POSITION), 250, 180);
        }, currentSpawnTime);
        mapleTreesLeft--;
    }

    // draw grass
    var GRASS_SPAWN_POSITION = { min: 0, max: canvas.width };
    var GRASS_HEIGHT         = { min: 1,   max: 15  };
    var GRASS_COLOR          = "#f9f9f9";
    var grassLeft = 1000;
    while (grassLeft > 0) {
        DrawGrass(GetRandomInRange(GRASS_SPAWN_POSITION), canvas.height, GetRandomInRange(GRASS_HEIGHT));
        grassLeft--;
    }
}