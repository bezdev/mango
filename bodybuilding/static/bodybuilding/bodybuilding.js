var dates ;
var sets;
var cardio;
var maxSet;
var datesList = [];
var currDateIndex;

var workoutLogDiv;

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

    CreateWorkoutLogNavigation();
    CreateWorkoutTable(datesList.peek());

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

    currDateIndex = dates.length - 1;

    $('#datesSelect').change(function() {
        var date = $("#datesSelect option:selected").val();
        currDateIndex = $("#datesSelect").prop('selectedIndex')
        //var date = dates[dates.length - currDateIndex - 1];
        CreateWorkoutTable(date);
    });

    $('#navLeft').click(function() {
        currDateIndex = (currDateIndex == 0) ? dates.length - 1 : --currDateIndex;
        var date = dates[currDateIndex].date;
        $("#datesSelect").val(date);
        CreateWorkoutTable(date);
    });

    $('#navRight').click(function() {
        currDateIndex = (currDateIndex == dates.length - 1) ? 0 : ++currDateIndex;
        var date = dates[currDateIndex].date;
        $("#datesSelect").val(date);
        CreateWorkoutTable(date);
    });
}

var randomColors = false;
function CreateWorkoutTable(date) {
    // Clear the existing table.
    workoutLogDiv = document.getElementById("workoutlog");
    while (workoutLogDiv.firstChild) {
        workoutLogDiv.removeChild(workoutLogDiv.firstChild);
    }

    CreateWeightTrainingTable(date);
    CreateCardioTable(date);

    if (randomColors)
    {
        var randomHeaderColor = randomColor();
        var randomDataAColor = randomColor();
        var randomDataBColor = randomColor();
        var elements = document.getElementsByClassName("headerData");
        for (var i = 0; i < elements.length; i++) {
            elements[i].style.backgroundColor = randomHeaderColor;
        }

        var elements = document.getElementsByClassName("dataA");
        for (var i = 0; i < elements.length; i++) {
            elements[i].style.backgroundColor = randomDataAColor;
        }

        var elements = document.getElementsByClassName("dataB");
        for (var i = 0; i < elements.length; i++) {
            elements[i].style.backgroundColor = randomDataBColor;
        }

        var elements = document.getElementsByClassName("cardioData");
        for (var i = 0; i < elements.length; i++) {
            elements[i].style.backgroundColor = randomDataAColor;
        }
    }
}

function CreateWeightTrainingTable(date) {
    var table = document.createElement("table");
    var thead;
    var tbody;
    var tr;
    var td;

    // Determine the max amount of sets in the data for this data
    maxSet = 0;
    for (var i = 0; i < sets.length; i++) {
        if (sets[i].date !== date) {
            continue;
        }

        if (sets[i].set > maxSet) {
            maxSet = sets[i].set;
        }
    }
    var numSetsLeft = maxSet;
    var currentExerciseName;

    // Iterate through all the sets and fill in the table
    for (var i = 0; i < sets.length; i++) {
        // Only display data for the current day
        if (sets[i].date !== date) {
            continue;
        }

        // Initialize the header if necessary
        if (thead === undefined) {
            thead = document.createElement("thead");
            tr = document.createElement("tr");
            tr.className = "headerData";
            td = document.createElement("td");
            td.appendChild(document.createTextNode("Weight Training"));
            tr.appendChild(td);
            for (var j = 1; j <= maxSet; j++) {
                td = document.createElement("td");
                td.colSpan = "2";
                td.appendChild(document.createTextNode("Set " + j));
                tr.appendChild(td);
            }
            thead.appendChild(tr);

            // | Exercise | Weight | Reps | ...
            tr = document.createElement("tr");
            tr.className = "headerData";
            td = document.createElement("td");
            td.appendChild(document.createTextNode("Exercise"));
            tr.appendChild(td);
            for (var j = 1; j <= maxSet; j++) {
                td = document.createElement("td");
                td.appendChild(document.createTextNode("Weight"));
                tr.appendChild(td);
                td = document.createElement("td");
                td.appendChild(document.createTextNode("Reps"));
                tr.appendChild(td);
            }
            thead.appendChild(tr);

            table.appendChild(thead);

            tbody = document.createElement("tbody")
        }

        // See if we need to start a new row.
        if (sets[i].name !== currentExerciseName) {
            // Finish the previous row if needed.
            if (currentExerciseName !== undefined) {
                for (var j = 0; j < numSetsLeft; j++) {
                    AddSetTD(tr, " ", " ");
                }
                tbody.appendChild(tr);
            }

            numSetsLeft = maxSet;
            currentExerciseName = sets[i].name;

            // Get started on the next row, start with the exercise column.
            tr = document.createElement("tr");
            td = document.createElement("td");
            td.className = "dataA";
            td.className += " exerciseColumn";
            isDataA = true;
            td.appendChild(document.createTextNode(currentExerciseName));
            tr.appendChild(td);
        }

        // Add the current set
        AddSetTD(tr, sets[i].weight, sets[i].reps)
        numSetsLeft--;
    }
    if (tbody !== undefined) {
        // Finish the previous row
        for (var j = 0; j < numSetsLeft; j++) {
            AddSetTD(tr, " ", " ");
        }
        tbody.appendChild(tr);
        table.appendChild(tbody);
    }
    workoutLogDiv.appendChild(table);
}

function CreateCardioTable(date) {
    var table = document.createElement("table");
    var thead;
    var tbody;
    var tr;
    var td;

    var currentExerciseName;
    for (var i = 0; i < cardio.length; i++) {
        // Only display data for the current day
        if (cardio[i].date !== date) {
            continue;
        }

        // Initialize the header if necessary
        if (thead === undefined) {
            thead = document.createElement("thead");
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
            td.appendChild(document.createTextNode("Notes"));
            tr.appendChild(td);
            thead.appendChild(tr);

            table.appendChild(thead);

            tbody = document.createElement("tbody")
        }

        if (cardio[i].name !== currentExerciseName) {
            // Initialize the header if necessary
            if (currentExerciseName !== undefined) {
                // Close the previous row off
                tbody.appendChild(tr);
            }

            currentExerciseName = cardio[i].name;

            tr = document.createElement("tr");
        }

        AddCardioRow(tr, currentExerciseName, cardio[i].time, cardio[i].distance, " ");
    }
    if (tbody !== undefined) {
        tbody.appendChild(tr);
        table.appendChild(tbody);
    }
    workoutLogDiv.appendChild(table);
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

var isDataA = true;
function AddSetTD(row, weight, reps) {
    var className = (isDataA = !isDataA) ? "dataA" : "dataB";
    
    var td = document.createElement("td");
    td.className = className;
    td.appendChild(document.createTextNode(weight));
    row.appendChild(td);
    td = document.createElement("td");
    td.appendChild(document.createTextNode(reps));
    td.className = className;
    row.appendChild(td);
}

function AddCardioRow(row, name, time, distance, notes) {
    var td = document.createElement("td");
    td.className = "cardioData";
    td.className += " exerciseColumn";
    td.appendChild(document.createTextNode(name));
    row.appendChild(td);
    td = document.createElement("td");
    td.className = "cardioData";
    td.style.textAlign = "right";
    td.appendChild(document.createTextNode(time));
    row.appendChild(td);
    td = document.createElement("td");
    td.className = "cardioData";
    td.style.textAlign = "right";
    td.appendChild(document.createTextNode(distance.toString()));
    row.appendChild(td);
    td = document.createElement("td");
    td.className = "cardioData";
    td.appendChild(document.createTextNode(notes));
    row.appendChild(td);
}