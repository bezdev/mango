function PlotGraph(width, height) {
    var that = this;

    var padding = { left: 10, top: 10, right: 10, bottom: 10 };

    var defaultColors = [ "#FF0000", "#008000", "#0000FF", "#FFA500", "#FFFF00", "#4B0082", "#EE82EE" ]; // ROYGBIV
    var xAxis = { min: 0, max: 0, width: width };
    var yAxis = { min: 0, max: 0, height: height };

    var lines = [];

    var origin = { x: 0, y: 0 };

    var getRealX = function(x) {
        return padding.left + origin.x + (x / (xAxis.max - xAxis.min) * xAxis.width);
    };

    var getRealY = function(y) {
        return padding.top + yAxis.height - origin.y - (y / (yAxis.max - yAxis.min) * yAxis.height);
    };

    // Compute the origin coordinates based on the min/max values of the plot
    var ComputeOrigin = function() {
        // min/max are on the same side of the y-axis
        if (xAxis.min * xAxis.max >= 0) {
            // max is on the right side of the y-axis
            if (xAxis.max > 0) {
                origin.x = 0;
            // max is on the left side of the y-axis
            } else {
                origin.x = xAxis.width;
            }
        // min/max are on opposite sides of the y-axis
        } else {
            origin.x = (Math.abs(xAxis.min) / (xAxis.max - xAxis.min)) * xAxis.width;
        }

        // min/max are on the same side of the x-axis
        if (yAxis.min * yAxis.max >= 0) {
            // max is on the right side of the x-axis
            if (yAxis.max > 0) {
                origin.y = 0;
            // max is on the left side of the x-axis
            } else {
                origin.y = yAxis.height;
            }
        // min/max are on opposite sides of the x-axis
        } else {
            origin.y = (Math.abs(yAxis.min) / (yAxis.max - yAxis.min)) * yAxis.height;
        }
    };

    var CreateAxis = function() {
        var axis = document.createElementNS("http://www.w3.org/2000/svg", "g");
        // draw x-axis
        axis.appendChild(CreateSVGLine(xAxis.min, 0, xAxis.max, 0));
        // draw y-axis
        axis.appendChild(CreateSVGLine(0, yAxis.min, 0, yAxis.max));

        return axis;
    };

    var CreatePlotData = function() {
        var plotData = document.createElementNS("http://www.w3.org/2000/svg", "g");

        for (var i = 0; i < lines.length; i++) {
            var path = CreateSVGPath(lines[i].p, lines[i].c);
            if (path) {
                plotData.appendChild(path);
            }
            for (var j = 0; j < lines[i].p.length; j++) {
                plotData.appendChild(CreateSVGCircle(lines[i].p[j].x, lines[i].p[j].y, lines[i].c));
            }
        }

        return plotData;
    };

    var CreateSVGLine = function(x1, y1, x2, y2) {
        var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", getRealX(x1));
        line.setAttribute("y1", getRealY(y1));
        line.setAttribute("x2", getRealX(x2));
        line.setAttribute("y2", getRealY(y2));
        line.setAttribute("stroke", "black");

        return line;
    };

    var CreateSVGPath = function(points, color) {
        if (points.length < 2) {
            return;
        }

        var d = "M " + getRealX(points[0].x) + " " + getRealY(points[0].y);
        for (var i = 1; i < points.length; i++) {
            d += " L " + getRealX(points[i].x) + " " + getRealY(points[i].y);
        }

        var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", d);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", color);

        return path;
    };

    var CreateSVGCircle = function(cx, cy, color) {
        var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", getRealX(cx));
        circle.setAttribute("cy", getRealY(cy));
        circle.setAttribute("r", 3);
        circle.setAttribute("stroke", color);
        circle.setAttribute("fill", color);

        return circle;
    };

    this.Clear = function() {
        var xAxis = { min: 0, max: 0, width: width };
        var yAxis = { min: 0, max: 0, height: height };

        var lines = [];

        var origin = { x: 0, y: 0 };
    };

    this.AddLine = function(points, color) {
        for (var i = 0; i < points.length; i++) {
            if (points[i].x < xAxis.min) {
                xAxis.min = points[i].x;
            }
            if (points[i].x > xAxis.max) {
                xAxis.max = points[i].x;
            }
            if (points[i].y < yAxis.min) {
                yAxis.min = points[i].y;
            }
            if (points[i].y > yAxis.max) {
                yAxis.max = points[i].y;
            }
        }

        lines.push({ p: points, c: (color || defaultColors[lines.length]) });
    };

    this.CreateSVG = function() {
        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

        ComputeOrigin();

        svg.appendChild(CreateAxis());

        svg.appendChild(CreatePlotData());

        svg.setAttribute("width", xAxis.width + padding.left + padding.right);
        svg.setAttribute("height", yAxis.height + padding.top + padding.bottom);
        svg.setAttribute("style", "border: 1px solid black");

        return svg;
    };
}
