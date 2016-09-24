function PlotGraph(parentDiv, width, height, labels, clientOnPointClick) {
    var m_graphDiv = parentDiv;
    var m_clientOnPointClick = clientOnPointClick;
    var m_labels = labels;

    var m_padding = { left: 100, top: 100, right: 100, bottom: 150 };

    var m_defaultColors = [ "#FF0000", "#008000", "#0000FF", "#FFA500", "#FFFF00", "#4B0082", "#EE82EE" ]; // ROYGBIV
    var m_axisColor = "#000000";
    var m_labelColor = "#000000";
    var m_tickColor = "#999999";
    var m_tickLength = 500;

    var m_xAxis = { min: 0, max: 0, width: width - m_padding.left - m_padding.right };
    var m_yAxis = { min: 0, max: 0, height: height - m_padding.top - m_padding.bottom };

    var m_lines = [];

    var m_origin = { x: 0, y: 0 };

    var getRealX = function(x) {
        return m_padding.left + m_origin.x + (x / (m_xAxis.max - m_xAxis.min) * m_xAxis.width);
    };

    var getRealY = function(y) {
        return m_padding.top + m_yAxis.height - m_origin.y - (y / (m_yAxis.max - m_yAxis.min) * m_yAxis.height);
    };

    // Compute the origin coordinates based on the min/max values of the plot
    var ComputeOrigin = function() {
        // min/max are on the same side of the y-axis
        if (m_xAxis.min * m_xAxis.max >= 0) {
            // max is on the right side of the y-axis
            if (m_xAxis.max > 0) {
                m_origin.x = 0;
            // max is on the left side of the y-axis
            } else {
                m_origin.x = m_xAxis.width;
            }
        // min/max are on opposite sides of the y-axis
        } else {
            m_origin.x = (Math.abs(m_xAxis.min) / (m_xAxis.max - m_xAxis.min)) * m_xAxis.width;
        }

        // min/max are on the same side of the x-axis
        if (m_yAxis.min * m_yAxis.max >= 0) {
            // max is on the right side of the x-axis
            if (m_yAxis.max > 0) {
                m_origin.y = 0;
            // max is on the left side of the x-axis
            } else {
                m_origin.y = m_yAxis.height;
            }
        // min/max are on opposite sides of the x-axis
        } else {
            m_origin.y = (Math.abs(m_yAxis.min) / (m_yAxis.max - m_yAxis.min)) * m_yAxis.height;
        }
    };

    var ComputeAxisMinMax = function() {
        var yDiff = m_yAxis.max - m_yAxis.min;

        // Compute the nearest multiple
        var multiple = 10;
        if (yDiff > 10 && yDiff < 100) {
            multiple = 50;
        } else {
            var digits = yDiff.toString().length;
            for (var i = 0; i < (digits - 3); i++, multiple *= 10);
            multiple *= 5;
        }

        m_yAxis.max = RoundToNearestMultipleOf(m_yAxis.max, multiple);
        m_yAxis.min = RoundToNearestMultipleOf(m_yAxis.min, multiple);
    };

    var CreateLabels = function() {
        var labelGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");

        var titleSize = 30;
        labelGroup.appendChild(CreateSVGText(width / 2, m_padding.top / 2, m_labels.title, titleSize, 0, m_labelColor));

        var labelSize = 18;
        labelGroup.appendChild(CreateSVGText(getRealX((m_xAxis.max - m_xAxis.min) / 2), height - 10, m_labels.xAxis, labelSize, 0, m_labelColor));
        labelGroup.appendChild(CreateSVGText(20, getRealY((m_yAxis.max - m_yAxis.min) / 2), m_labels.yAxis, labelSize, -90, m_labelColor));

        return labelGroup;
    };

    var CreateAxis = function() {
        var axisGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");

        axisGroup.appendChild(CreateSVGLine(m_xAxis.min, 0, m_xAxis.max, 0, m_axisColor));
        axisGroup.appendChild(CreateSVGLine(0, m_yAxis.min, 0, m_yAxis.max, m_axisColor));

        return axisGroup;
    };

    var CreateTicks = function() {
        var ticksGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");

        var tickLabelsize = 14;

        // x-axis ticks
        var drawn = [];

        for (var i = 0; i < m_lines.length; i++) {
            for (var j = 0; j < m_lines[i].p.length; j++)
            {
                if (drawn.indexOf(m_lines[i].p[j].x) == -1)
                {
                    if (m_lines[i].p[j].x !== 0) {
                        // no need to draw ticks for the y-axis
                        ticksGroup.appendChild(CreateSVGLine(m_lines[i].p[j].x, m_yAxis.min, m_lines[i].p[j].x, m_yAxis.max, m_tickColor));
                    }

                    ticksGroup.appendChild(CreateSVGText(getRealX(m_lines[i].p[j].x) + tickLabelsize / 3, getRealY(m_yAxis.min) + 50, m_lines[i].p[j].xText, tickLabelsize, -90, m_labelColor));

                    drawn.push(m_lines[i].p[j].x);
                }
            }
        }

        // y-axis ticks
        var currentY = m_yAxis.min;
        var step = (m_yAxis.max - m_yAxis.min) / 10;

        for (var i = 0; i < 11; i++) {
            // no need to draw ticks for x-axis
            if (currentY !== 0) {
                ticksGroup.appendChild(CreateSVGLine(m_xAxis.min, currentY, m_xAxis.max, currentY, m_tickColor));
            }

            ticksGroup.appendChild(CreateSVGText(getRealX(m_xAxis.min) - 25, getRealY(currentY) + tickLabelsize / 3, currentY, tickLabelsize, 0, m_labelColor));

            currentY += step;
        }

        return ticksGroup;
    };

    var CreatePlotData = function() {
        var plotDataGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");

        var plotLinesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        var plotPointsGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        plotPointsGroup.id = "dataPoints";

        for (var i = 0; i < m_lines.length; i++) {
            var path = CreateSVGPath(m_lines[i].p, m_lines[i].c);
            if (path) {
                plotLinesGroup.appendChild(path);
            }
            for (var j = 0; j < m_lines[i].p.length; j++) {
                var pointData = { x: m_lines[i].p[j].x, y:  m_lines[i].p[j].y, xText: m_lines[i].p[j].xText };
                plotPointsGroup.appendChild(CreateSVGCircle(m_lines[i].p[j].x, m_lines[i].p[j].y, m_lines[i].c, pointData));
            }
        }

        plotDataGroup.appendChild(plotLinesGroup);
        plotDataGroup.appendChild(plotPointsGroup);

        return plotDataGroup;
    };

    var CreateSVGText = function(x, y, text, size, rotate, color) {
        var svgtext = document.createElementNS("http://www.w3.org/2000/svg", "text");
        svgtext.setAttribute("text-anchor", "middle");
        svgtext.setAttribute("x", x);
        svgtext.setAttribute("y", y);
        svgtext.setAttribute("font-size", size);
        svgtext.setAttribute("transform", "rotate(" + rotate + " " + x + " " + y + ")");
        svgtext.setAttribute("fill", color);

        var textNode = document.createTextNode(text);
        svgtext.appendChild(textNode);

        return svgtext;
    };

    var CreateSVGLine = function(x1, y1, x2, y2, color) {
        var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", getRealX(x1));
        line.setAttribute("y1", getRealY(y1));
        line.setAttribute("x2", getRealX(x2));
        line.setAttribute("y2", getRealY(y2));
        line.setAttribute("stroke", color);

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

    var CreateSVGCircle = function(cx, cy, color, pointData) {
        var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", getRealX(cx));
        circle.setAttribute("cy", getRealY(cy));
        circle.setAttribute("r", 3);
        circle.setAttribute("stroke", color);
        circle.setAttribute("fill", color);
        circle.onmousemove = function() { 
            this.setAttribute("r", 5)
            var pointDataDiv = document.getElementById("pointDataDiv");
            pointDataDiv.style.visibility = 'visible';
            var pos = getPositionOfElement(m_graphDiv)

            pointDataDiv.innerHTML = "x: " + pointData.xText + "<br />" + "y: " + pointData.y;
            pointDataDiv.style.left = pos.x + this.cx.baseVal.value + "px";
            pointDataDiv.style.top = pos.y + this.cy.baseVal.value + "px";

        };
        circle.onmouseout = function() {
            this.setAttribute("r", 3)
            pointDataDiv.style.visibility = 'hidden';
        };
        circle.onclick = function() {
            var x = pointData.x;
            var y = pointData.y;
            var xText = pointData.xText;
            m_clientOnPointClick(x, y, xText);

            var currentSelectedPoints = document.getElementById("dataPoints").getElementsByClassName("selected");
            if (currentSelectedPoints.length > 0) {
                currentSelectedPoints[0].removeAttribute("class");
            }
            this.setAttribute("class", "selected");
        };

        return circle;
    };

    this.Clear = function() {
        m_xAxis = { min: 0, max: 0, width: width - m_padding.left - m_padding.right };
        m_yAxis = { min: 0, max: 0, height: height - m_padding.top - m_padding.bottom };

        m_lines = [];

        m_origin = { x: 0, y: 0 };
    };

    this.AddLine = function(points, color) {
        for (var i = 0; i < points.length; i++) {
            if (points[i].x < m_xAxis.min) {
                m_xAxis.min = points[i].x;
            }
            if (points[i].x > m_xAxis.max) {
                m_xAxis.max = points[i].x;
            }
            if (points[i].y < m_yAxis.min) {
                m_yAxis.min = points[i].y;
            }
            if (points[i].y > m_yAxis.max) {
                m_yAxis.max = points[i].y;
            }
        }

        m_lines.push({ p: points, c: (color || m_defaultColors[m_lines.length]) });
    };

    this.Render = function() {
        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

        ComputeOrigin();
        ComputeAxisMinMax();

        svg.appendChild(CreateAxis());
        svg.appendChild(CreateTicks());
        svg.appendChild(CreateLabels());
        svg.appendChild(CreatePlotData());

        svg.setAttribute("width", width);
        svg.setAttribute("height", height);
        // svg.setAttribute("style", "border: 1px solid white");

        while (m_graphDiv.firstChild) {
            m_graphDiv.removeChild(m_graphDiv.firstChild);
        }
        m_graphDiv.appendChild(svg);

        var pointDataDiv = document.createElement("div");
        pointDataDiv.id = "pointDataDiv";
        pointDataDiv.style.background = "yellow";
        pointDataDiv.style.position = "absolute";
        pointDataDiv.style.visibility = 'hidden';

        m_graphDiv.appendChild(pointDataDiv);
    };
}