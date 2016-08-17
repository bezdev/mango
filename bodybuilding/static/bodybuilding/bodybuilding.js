var dates ;
var sets;
var cardio;
var maxSet;
var datesList = [];

Array.prototype.peek = function() {
    return this[this.length - 1];
};

$(document).ready(function() {
    Initialize();
});

function RenderData() {
    // populate the dates list
    for (var i = 0; i < dates.length; i++) {
        datesList.push(dates[i].date);
    }

    // determine the max amount of sets in the data
    maxSet = 0;
    for (var i = 0; i < sets.length; i++) {
        if (sets[i].set > maxSet) {
            maxSet = sets[i].set;
        }
    }

    CreateWorkoutLogNavigation();
    CreateWorkoutLog(datesList.peek());

    /*
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
    */
}

function CreateWorkoutLogNavigation()
{
    // create header
    for (var i = 0; i < datesList.length; i++) {
        var option = document.createElement("option");
        option.text = datesList[datesList.length - i - 1];
        $('#datesSelect').append(option);
    }

    $('#datesSelect').change(function() {
        var date = $("#datesSelect option:selected").val();
        CreateWorkoutLog(date);
    });
}

function CreateWorkoutLog(date) {
    var table = document.createElement("table");
    var tbody = undefined;
    var tr;
    var td;

    // add weight training
    var currentName = undefined;
    var numSetsLeft = maxSet;
    for (var i = 0; i < sets.length; i++) {
        // Only display data for the current day
        if (sets[i].date !== date) {
            continue;
        }

        if (sets[i].name !== currentName) {
            // Initialize the header if necessary
            if (currentName === undefined) {
                // | Weight Training | Set 1 | Set 2 | ... | Set 3 |
                if (tbody === undefined) {
                    tbody = document.createElement("tbody");
                }
                tr = document.createElement("tr");
                td = document.createElement("td");
                tr.className = "headerData";
                td.appendChild(document.createTextNode("Weight Training"));
                tr.appendChild(td);
                for (var j = 1; j <= maxSet; j++) {
                    td = document.createElement("td");
                    td.colSpan = "2";
                    td.appendChild(document.createTextNode("Set " + j));
                    tr.appendChild(td);
                }
                tbody.appendChild(tr);

                // | Exercise | Weight | Reps | ...
                tr = document.createElement("tr");
                tr.className = "headerData";
                td = document.createElement("td");
                td.className = "exerciseColumn";
                td.appendChild(document.createTextNode("Exercise"));
                tr.appendChild(td);
                for (var j = 1; j <= maxSet; j++) {
                    AddSetTD(tr, "Weight", "Reps");
                }
                tbody.appendChild(tr);
            } else {
                // Finish the previous row
                for (var j = 0; j < numSetsLeft; j++) {
                    AddSetTD(tr, " ", " ");
                }
                tbody.appendChild(tr);
            }

            numSetsLeft = maxSet;
            currentName = sets[i].name;

            tr = document.createElement("tr");
            td = document.createElement("td");
            td.className = "exerciseColumn";
            td.appendChild(document.createTextNode(currentName));
            tr.appendChild(td);
        }

        AddSetTD(tr, sets[i].weight, sets[i].reps)
        numSetsLeft--;
    }
    if (tbody !== undefined) {
        // Finish the previous row
        for (var j = 0; j < numSetsLeft; j++) {
            AddSetTD(tr, " ", " ");
        }
        tbody.appendChild(tr);
    }

    // add cardio

    currentName = undefined;
    var notesSpan;
    for (var i = 0; i < cardio.length; i++) {
        // Only display data for the current day
        if (cardio[i].date !== date) {
            continue;
        }

        if (cardio[i].name !== currentName) {
            // Initialize the header if necessary
            if (currentName === undefined) {
                if (tbody === undefined) {
                    tbody = document.createElement("tbody");
                    notesSpan = 1;
                } else {
                    notesSpan = (maxSet * 2) - 2;
                }
                tr = document.createElement("tr");
                tr.className = "headerData";
                td = document.createElement("td");
                td.appendChild(document.createTextNode("Cardio"));
                tr.appendChild(td);
                td = document.createElement("td");
                td.appendChild(document.createTextNode("Time"));
                tr.appendChild(td);
                td = document.createElement("td");
                td.appendChild(document.createTextNode("Distance"));
                tr.appendChild(td);
                td = document.createElement("td");
                td.colSpan = notesSpan.toString()
                td.appendChild(document.createTextNode("Notes"));
                tr.appendChild(td);
                tbody.appendChild(tr);
            } else {
                // Close the previous row off
                tbody.appendChild(tr);
            }

            currentName = cardio[i].name;

            tr = document.createElement("tr");
        }

        AddCardioRow(tr, currentName, cardio[i].time, cardio[i].distance, " ", notesSpan);
    }
    if (tbody !== undefined) {
        tr.className += " bottomRow";
        tbody.appendChild(tr);
    }

    table.appendChild(tbody);

    var workoutlogDiv = document.getElementById("workoutlog");
    while (workoutlogDiv.firstChild) {
        workoutlogDiv.removeChild(workoutlogDiv.firstChild);
    }
    workoutlogDiv.appendChild(table);
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
    td.className = "weightColumn";
    td.appendChild(document.createTextNode(weight));
    row.appendChild(td);
    td = document.createElement("td");
    td.appendChild(document.createTextNode(reps));
    td.className = "repsColumn";
    row.appendChild(td);
}

function AddCardioRow(row, name, time, distance, notes, notesSpan) {
    row.className = "cardioRow";
    var td = document.createElement("td");
    td.appendChild(document.createTextNode(name));
    row.appendChild(td);
    td = document.createElement("td");
    td.style.textAlign = "right";
    td.appendChild(document.createTextNode(time));
    row.appendChild(td);
    td = document.createElement("td");
    td.style.textAlign = "right";
    td.appendChild(document.createTextNode(distance.toString()));
    row.appendChild(td);
    td = document.createElement("td");
    td.colSpan = notesSpan.toString();
    td.appendChild(document.createTextNode(notes));
    row.appendChild(td);
}