$(document).ready(function() {
    Initialize();
});

function RenderData(exercise, url, exerciseText) {
    $.ajax({
        url: url,
        type: "POST",
        data: {
            'exercise' : exercise,
            'csrfmiddlewaretoken' : $("input[name=csrfmiddlewaretoken]").val()
        },
        error: function() {
            document.getElementById("debug").style.backgroundColor = 'red';
            document.getElementById("output").innerText = "yikes";
            history.replaceState(null, null, url);
        },
        success: function(data) {
            // Schema: jsonData[i]["fields|model|pk"]
            //         jsonData[i]["fields"]["date|reps|set|weight"]
            var jsonData = JSON.parse(data);

            document.getElementById("debug").style.backgroundColor = 'green';
            history.replaceState(null, null, url);
            CreateGraph(exerciseText, jsonData);
            CreateTable(exerciseText, jsonData);
        },
        dataType: 'json'
    });
}

function CreateGraph(exercise, data) {
    if (data.length == 0)
    {
        return;
    }

    // determine the max amount of sets in the data
    var maxSet = 0;
    for (var i = 0; i < data.length; i++) {
        var set = data[i]["fields"]["set"];
        if (set > maxSet) {
            maxSet = set;
        }
    }

    var lines = new Array(maxSet);

    // Schema: jsonData[i]["fields|model|pk"]
    //         jsonData[i]["fields"]["date|reps|set|weight"]
    var currentDate = data[0]["fields"]["date"];
    var currentDateIndex = 0;
    for (var i = 0; i < data.length; i++) {
        // create the set line if we have to
        if (lines[data[i]["fields"]["set"] - 1] === undefined) {
            lines[data[i]["fields"]["set"] - 1] = [];
        }

        if (currentDate != data[i]["fields"]["date"]) {
            currentDateIndex++;
            currentDate = data[i]["fields"]["date"];
        }

        lines[data[i]["fields"]["set"] - 1].push({ x: currentDateIndex, xText: data[i]["fields"]["date"], y: data[i]["fields"]["reps"] * data[i]["fields"]["weight"] });
    }

    var plotGraph = new PlotGraph(1000, 500, { title: exercise, xaxis: "Date", yaxis: "Weight x Reps" });

    for (var i = 0; i < lines.length; i++) {
        plotGraph.AddLine(lines[i]);
    }

    var graphDiv = document.getElementById("graph");
    while (graphDiv.firstChild) {
        graphDiv.removeChild(graphDiv.firstChild);
    }
    graphDiv.appendChild(plotGraph.CreateSVG());
}

//   +----------+---------------+---------------+     +---------------+
// 1 |<exercise>|      Set 1    |      Set 2    |.....|      Set n    |
//   +----------+--------+------+--------+------+     +--------+------+
// 2 |  <date>  | Weight | Reps | Weight | Reps |.....| Weight | Reps |
//   +----------+--------+------+--------+------+     +--------+------+
function CreateTable(exercise, data) {
    document.getElementById("graph").innerHtml = "";

    if (data.length == 0)
    {
        return;
    }

    // determine the max amount of sets in the data
    var maxSet = 0;
    for (var i = 0; i < data.length; i++) {
        var set = data[i]["fields"]["set"];
        if (set > maxSet) {
            maxSet = set;
        }
    }

    // create head row 1
    var table = document.createElement("table");
    var thead = document.createElement("thead");
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    td.appendChild(document.createTextNode(exercise));
    tr.appendChild(td);
    for (var i = 1; i <= maxSet; i++) {
        td = document.createElement("td");
        td.colSpan = "2";
        td.style.textAlign = "center";
        td.appendChild(document.createTextNode("Set " + i));
        tr.appendChild(td);
    }
    thead.appendChild(tr);

    // create head row 2
    tr = document.createElement("tr");
    td = document.createElement("td");
    td.appendChild(document.createTextNode("Date"));
    tr.appendChild(td);
    for (var i = 1; i <= maxSet; i++) {
        AddSetTD(tr, "Weight", "Reps");
    }
    thead.appendChild(tr);
    table.appendChild(thead);

    var tbody = document.createElement("tbody");
    var currentDate = data[0]["fields"]["date"];
    var currentSet = 1;
    tr = document.createElement("tr");
    td = document.createElement("td");
    td.appendChild(document.createTextNode(currentDate));
    tr.appendChild(td);
    for (var i = 0; i <= data.length; i++) {
        if (i < data.length && data[i]["fields"]["date"] == currentDate) {
            AddSetTD(tr, data[i]["fields"]["weight"], data[i]["fields"]["reps"]);
            currentSet++;
        } else {
            // finish off the row if needed and add it
            for (; currentSet <= maxSet; currentSet++) {
                AddSetTD(tr, "", "");
            }
            tbody.appendChild(tr);

            // get ready for next row if needed
            if (i < data.length) {
                var currentDate = data[i]["fields"]["date"];
                tr = document.createElement("tr");
                td = document.createElement("td");
                td.appendChild(document.createTextNode(currentDate));
                tr.appendChild(td);
                AddSetTD(tr, data[i]["fields"]["weight"], data[i]["fields"]["reps"]);
                var currentSet = 2;
            }
        }
    }
    table.appendChild(tbody);

    var tableDiv = document.getElementById("table");
    while (tableDiv.firstChild) {
        tableDiv.removeChild(tableDiv.firstChild);
    }
    tableDiv.appendChild(table);
}

function AddSetTD(row, weight, reps) {
    var td = document.createElement("td");
    td.appendChild(document.createTextNode(weight));
    row.appendChild(td);
    td = document.createElement("td");
    td.appendChild(document.createTextNode(reps));
    row.appendChild(td);
}