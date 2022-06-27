function PlotGraph(parentDiv, width, height, labels, onPointClick) {
    var m_graphDiv = parentDiv;
    var m_onPointClick = onPointClick;
    var m_labels = labels;
    var m_hasY2 = (m_labels.yAxis2 !== undefined);

    var m_padding = { left: 100, top: 100, right: 100, bottom: 150 };

    var m_axisColor = "#000000";
    var m_labelColor = "#000000";
    var m_tickColor = "#999999";
    var m_tickLength = 500;

    var m_xAxis = { min: 0, max: 0, width: width - m_padding.left - m_padding.right };
    var m_yAxis = { min: 0, max: 0, height: height - m_padding.top - m_padding.bottom };
    var m_yAxis2 = { min: 0, max: 0 };

    var m_lines = [];

    var m_origin = { x: 0, y: 0 };

    var getRealX = function(x) {
        return m_padding.left + m_origin.x + (x / (m_xAxis.max - m_xAxis.min) * m_xAxis.width);
    };

    var getRealY = function(y) {
        return m_padding.top + m_yAxis.height - m_origin.y - (y / (m_yAxis.max - m_yAxis.min) * m_yAxis.height);
    };

    var getRealY2 = function(y) {
        return m_padding.top + m_yAxis.height - m_origin.y - (y / (m_yAxis2.max - m_yAxis2.min) * m_yAxis.height);
    };

    var getMultipleOfDiff = function(diff) {
        // Compute the nearest multiple
        var multiple = 10;
        if (diff > 10 && diff < 100) {
            multiple = 50;
        } else if (diff >= 100) {
            var digits = diff.toString().length;
            for (var i = 0; i < (digits - 3); i++, multiple *= 10);
            multiple *= 5;
        }

        return multiple;
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
        var multiple = getMultipleOfDiff(yDiff);
        m_yAxis.max = RoundToNearestMultipleOf(m_yAxis.max, multiple);
        m_yAxis.min = RoundToNearestMultipleOf(m_yAxis.min, multiple);

        if (m_hasY2) {
            var y2Diff = m_yAxis2.max - m_yAxis2.min;
            multiple = getMultipleOfDiff(y2Diff);
            m_yAxis2.max = RoundToNearestMultipleOf(m_yAxis2.max, multiple);
            m_yAxis2.min = 0;  // always 0
        }
    };

    var CreateLabels = function() {
        var labelGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");

        var titleSize = 30;
        labelGroup.appendChild(CreateSVGText(width / 2, m_padding.top / 2, m_labels.title, titleSize, 0, m_labelColor));

        var labelSize = 18;
        labelGroup.appendChild(CreateSVGText(getRealX((m_xAxis.max - m_xAxis.min) / 2), height - 10, m_labels.xAxis, labelSize, 0, m_labelColor));
        labelGroup.appendChild(CreateSVGText(20, getRealY((m_yAxis.max - m_yAxis.min) / 2), m_labels.yAxis, labelSize, -90, m_labelColor));

        if (m_hasY2) {
            labelGroup.appendChild(CreateSVGText(width - 20, getRealY((m_yAxis.max - m_yAxis.min) / 2), m_labels.yAxis2, labelSize, 90, m_labelColor));
        }

        return labelGroup;
    };

    var CreateAxis = function() {
        var axisGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");

        axisGroup.appendChild(CreatePlotLine(m_xAxis.min, 0, m_xAxis.max, 0, m_axisColor));
        axisGroup.appendChild(CreatePlotLine(0, m_yAxis.min, 0, m_yAxis.max, m_axisColor));

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
                    if (m_lines[i].p[j].x !== m_origin.x) {
                        // no need to draw ticks for the y-axis
                        ticksGroup.appendChild(CreatePlotLine(m_lines[i].p[j].x, m_yAxis.min, m_lines[i].p[j].x, m_yAxis.max, m_tickColor));
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
            if (currentY !== m_origin.y) {
                ticksGroup.appendChild(CreatePlotLine(m_xAxis.min, currentY, m_xAxis.max, currentY, m_tickColor));
            }

            ticksGroup.appendChild(CreateSVGText(getRealX(m_xAxis.min) - 25, getRealY(currentY) + tickLabelsize / 3, currentY, tickLabelsize, 0, m_labelColor));

            currentY += step;
        }

        if (m_hasY2) {
            // y-axis2 ticks
            var currentY2 = m_yAxis2.min;
            var step = (m_yAxis2.max - m_yAxis2.min) / 10;
            for (var i = 0; i < 11; i++) {
                ticksGroup.appendChild(CreateSVGText(getRealX(m_xAxis.max) + 25, getRealY2(currentY2) + tickLabelsize / 3, currentY2, tickLabelsize, 0, m_labelColor));
                currentY2 += step;
            }
        }

        return ticksGroup;
    };

    var CreatePlotData = function() {
        var plotDataGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");

        var plotLinesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        var plotPointsGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        plotPointsGroup.id = "dataPoints";

        for (var i = 0; i < m_lines.length; i++) {
            var path = CreatePlotPath(m_lines[i].p, m_lines[i].c, m_lines[i].isY2);
            if (path) {
                plotLinesGroup.appendChild(path);
            }
            for (var j = 0; j < m_lines[i].p.length; j++) {
                var pointData = { x: m_lines[i].p[j].x, y:  m_lines[i].p[j].y, xText: m_lines[i].p[j].xText };
                var cx = getRealX(m_lines[i].p[j].x);
                var cy = (m_lines[i].isY2 ? getRealY2(m_lines[i].p[j].y) : getRealY(m_lines[i].p[j].y));
                plotPointsGroup.appendChild(CreateSVGCircle(cx, cy, m_lines[i].c, pointData));
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

    var CreatePlotLine = function(x1, y1, x2, y2, color, isY2) {
        return CreateSVGLine(getRealX(x1), isY2 ? getRealY2(y1) : getRealY(y1), getRealX(x2), isY2 ? getRealY2(y2) : getRealY(y2), color);
    };

    var CreateSVGLine = function(x1, y1, x2, y2, color) {
        var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        line.setAttribute("stroke", color);

        return line;
    };

    var CreatePlotPath = function(points, color, isY2) {
        if (points.length < 2) {
            return;
        }

        var d = "M " + getRealX(points[0].x) + " " + (isY2 ? getRealY2(points[0].y) : getRealY(points[0].y));
        for (var i = 1; i < points.length; i++) {
            d += " L " + getRealX(points[i].x) + " " + (isY2 ? getRealY2(points[i].y) : getRealY(points[i].y));
        }

        return CreateSVGPath(d, color);
    };

    var CreateSVGPath = function(d, color) {
        var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", d);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", color);

        return path;
    };

    var CreateSVGCircle = function(cx, cy, color, pointData) {
        var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", cx);
        circle.setAttribute("cy", cy);
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
            m_onPointClick(x, y, xText);

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

    this.AddLine = function(points, color, isY2) {
        if (isY2 === undefined) { isY2 = false; }

        // Don't bother adding this line to the set if the plot isn't Y2 supported.
        if (isY2 && !m_hasY2) {
            debugger;
            return;
        }

        var yAxis = isY2 ? m_yAxis2 : m_yAxis;

        for (var i = 0; i < points.length; i++) {
            if (points[i].x < m_xAxis.min) {
                m_xAxis.min = points[i].x;
            }
            if (points[i].x > m_xAxis.max) {
                m_xAxis.max = points[i].x;
            }
            if (points[i].y < yAxis.min) {
                yAxis.min = points[i].y;
            }
            if (points[i].y > yAxis.max) {
                yAxis.max = points[i].y;
            }
        }

        // Disable Y2 line if the min values aren't positive.
        if (isY2 && (m_xAxis.min < 0 || m_yAxis.min < 0 || m_yAxis2.min < 0)) {
            m_hasY2 = false;
        }

        m_lines.push({ p: points, c: color , isY2: m_hasY2 && isY2 });
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