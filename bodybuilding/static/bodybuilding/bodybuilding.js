var dates;
var sets;
var cardio;
var weightExercises;
var cardioExercises;
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

class FilterManager {
    static Initialize() {
        // TODO: change the purpose of these to filters, rather than selections
        this.selectedWeightExercises = [];
        this.selectedCardioExercises = [];
        this.selectedComboExercises = [];

        this.maxNumExercisesSelected = 3;

        var workoutDataNav = document.getElementById("workoutDataNav");
        var weightExercisesNav = document.getElementById("weightExercisesNav");
        for (var i = 0; i < weightExercises.length; i++) {
            var exerciseSpan = document.createElement("span");
            exerciseSpan.innerText = weightExercises[i];
            exerciseSpan.onclick = function () { FilterManager.ExerciseButtonOnClick(this, "bodybuilding") };
            weightExercisesNav.appendChild(exerciseSpan);
        }

        var cardioExercisesNav = document.getElementById("cardioExercisesNav");
        for (var i = 0; i < cardioExercises.length; i++) {
            var exerciseSpan = document.createElement("span");
            exerciseSpan.innerText = cardioExercises[i];
            exerciseSpan.onclick = function () { FilterManager.ExerciseButtonOnClick(this, "cardio") };
            cardioExercisesNav.appendChild(exerciseSpan);
        }

        var comboExercisesNav = document.getElementById("comboExercisesNav");
        var comboExerciseSpan = document.createElement("span");
        comboExerciseSpan.innerText = "All";
        comboExerciseSpan.onclick = function() {
            if (this.className.indexOf("selected") >= 0) {
                return;
            }

            FilterManager.ClearExercises();

            // TODO: add logic to clear everything else when all is selected
            var index = FilterManager.selectedComboExercises.indexOf(this.innerText);
            if (index === -1) {
                FilterManager.selectedComboExercises.push(this.innerText);
            } else {
                FilterManager.selectedComboExercises.splice(index, 1);
            }

            $(this).toggleClass("selected");

            RenderData();
        };
        comboExercisesNav.appendChild(comboExerciseSpan);

        // default to all
        comboExerciseSpan.onclick.apply(comboExerciseSpan);
    }

    static GetFilteredPlotData() {
        // determine the max amount of sets in the data
        maxSet = 0;
        for (var i = 0; i < sets.length; i++) {
            if (sets[i].set > maxSet) {
                maxSet = sets[i].set;
            }
        }

        var lines = [];
        var labels;

        if (FilterManager.selectedComboExercises.length > 0) {
            // return all exercises
            var weightTrainingLine = [];

            var currentDate = sets[0].date;
            var currentDateIndex = 0;
            var amountLifted = 0;
            for (var i = 0; i < sets.length; i++) {
                if (sets[i].date === currentDate) {
                    amountLifted += sets[i].weight * sets[i].reps;
                } else {
                    weightTrainingLine.push({ x: currentDateIndex, xText: sets[i].date, y: amountLifted });

                    currentDate = sets[i].date;
                    currentDateIndex++;
                    amountLifted = (sets[i].weight * sets[i].reps);
                }
            }

            lines.push(weightTrainingLine);
            labels = { title: "All", xAxis: "Date", yAxis: "Weight Lifted (lbs)" };
        } else if (FilterManager.selectedWeightExercises.length > 0 && FilterManager.selectedCardioExercises.length > 0) {
            console.log("both weight + cardio");
        } else if (FilterManager.selectedWeightExercises.length > 0) {
            // if there's only one exercise selected create lines for every set
            if (FilterManager.selectedWeightExercises.length === 1) {
                var exerciseName = FilterManager.selectedWeightExercises[0];

                lines = new Array(maxSet);

                var currentDate = sets[0].date;
                var currentDateIndex = 0;
                for (var i = 0; i < sets.length; i++) {
                    if (sets[i].name != exerciseName) {
                        continue;
                    }

                    if (lines[sets[i].set - 1] === undefined) {
                        lines[sets[i].set - 1] = [];
                    }

                    if (sets[i].date != currentDate) {
                        currentDate = sets[i].date;
                        currentDateIndex++;
                    }

                    lines[sets[i].set - 1].push({ x: currentDateIndex, xText: currentDate, y: sets[i].reps * sets[i].weight });
                }
            } else {
                lines = new Array(FilterManager.selectedWeightExercises.length);

                var datesSeen = [];
                for (var i = 0; i < sets.length; i++) {
                    var index = FilterManager.selectedWeightExercises.indexOf(sets[i].name);
                    if (index === -1) {
                        continue;
                    }

                    if (lines[index] === undefined) {
                        lines[index] = [];
                    }

                    var currentExerciseName = sets[i].name;
                    var currentDate = sets[i].date;
                    if (datesSeen.indexOf(currentDate) == -1) {
                        datesSeen.push(currentDate);
                    }
                    var weightLifted = 0;
                    while (i < sets.length && sets[i].name == currentExerciseName && sets[i].date == currentDate) {
                        weightLifted += sets[i].weight * sets[i].reps;
                        i++;
                    }

                    i--;
                    lines[index].push({ x: 0, xText: sets[i].date, y: weightLifted });
                }

                // fill in .x values
                for (var i = 0; i < lines.length; i++) {
                    for (var j = 0; j < lines[i].length; j++) {
                        lines[i][j].x = datesSeen.indexOf(lines[i][j].xText);
                    }
                }
            }

            labels = { title: "All", xAxis: "Date", yAxis: "Weight Lifted (lbs)" };
        } else if (FilterManager.selectedCardioExercises.length > 0) {
            console.log("cardio");
        } else {
            console.log("nothing");
        }

        return { lines: lines, labels: labels };
    }

    static ExerciseButtonOnClick(that, type) {
        if (type === "bodybuilding") {
            var selectedExercises = FilterManager.selectedWeightExercises;
            var exerciseNav = "weightExercisesNav";
        } else if (type === "cardio") {
            var selectedExercises = FilterManager.selectedCardioExercises;
            var exerciseNav = "cardioExercisesNav";
        }

        if (FilterManager.selectedComboExercises.length > 0) {
            FilterManager.selectedComboExercises = [];

            var buttons = document.getElementById("comboExercisesNav").children;
            for (var i = 0; i < buttons.length; i++) {
                buttons[i].className = "";
            }
        }

        // If we can no longer select any more exercises, we must make sure that the exercise clicked was already selected.
        // If so then we can mark the rest to be enabled.
        if (selectedExercises.length === FilterManager.maxNumExercisesSelected) {
            if (that.className.indexOf("selected") >= 0) {
                var buttons = document.getElementById(exerciseNav).children;
                for (var j = 0; j < buttons.length; j++) {
                    if (buttons[j].className.indexOf("disabled") >= 0) {
                        $(buttons[j]).toggleClass("disabled");
                    }
                }
            } else {
                return;
            }
        }

        var index = selectedExercises.indexOf(that.innerText);
        if (index === -1) {
            selectedExercises.push(that.innerText);
        } else {
            selectedExercises.splice(index, 1);
        }

        $(that).toggleClass("selected");

        // disable the other buttons if max num has been reached
        if (selectedExercises.length === FilterManager.maxNumExercisesSelected) {

            buttons = document.getElementById(exerciseNav).children;
            for (var j = 0; j < buttons.length; j++) {
                if (buttons[j].className.indexOf("selected") >= 0) {
                    continue;
                }

                $(buttons[j]).toggleClass("disabled");
            }
        }

        RenderData();
    }

    static ClearExercises() {
        var buttons = document.getElementById("weightExercisesNav").children;
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].className = "";
        }

        buttons = document.getElementById("cardioExercisesNav").children;
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].className = "";
        }

         FilterManager.selectedWeightExercises = [];
         FilterManager.selectedCardioExercises = [];
    }
}

function RenderData() {
    var data = FilterManager.GetFilteredPlotData();

    var pointOnClick = function (x, y, date) {
            CreateDayTable(date);
    };
    var plotGraph = new PlotGraph(document.getElementById("workoutDataGraph"), 1000, 600, { title: data.labels.title, xAxis: data.labels.xAxis, yAxis: data.labels.yAxis }, pointOnClick);
    for (var i = 0; i < data.lines.length; i++) {
        plotGraph.AddLine(data.lines[i]);
        plotGraph.Render();
    }
/*
    var lines = [];

    if (FilterManager.selectedComboExercises.length > 0) {
        console.log("render all");

        var weightTrainingLine = [];

        var currentDate = sets[0].date;
        var currentDateIndex = 0;
        var amountLifted = 0;
        for (var i = 0; i < sets.length; i++) {
            if (sets[i].date === currentDate) {
                amountLifted += sets[i].weight * sets[i].reps;
            } else {
                weightTrainingLine.push({ x: currentDateIndex, xText: sets[i].date, y: amountLifted });

                currentDate = sets[i].date;
                currentDateIndex++;
                amountLifted = (sets[i].weight * sets[i].reps);
            }
        }

        var pointOnClick = function (x, y, date) {
            CreateDayTable(date);
        };
        var plotGraph = new PlotGraph(document.getElementById("workoutDataGraph"), 1000, 600, { title: "All", xAxis: "Date", yAxis: "Weight Lifted (lbs)" }, pointOnClick);
        plotGraph.AddLine(weightTrainingLine);
        plotGraph.Render();
    } else if (FilterManager.selectedWeightExercises.length > 0 && FilterManager.selectedCardioExercises.length > 0) {
        console.log("both weight + cardio");
    } else if (FilterManager.selectedWeightExercises.length > 0) {
        // if there's only one exercise selected create lines for every set
        if (FilterManager.selectedWeightExercises.length === 1) {
            var exerciseName = FilterManager.selectedWeightExercises[0];

            lines = new Array(maxSet);

            var currentDate = sets[0].date;
            var currentDateIndex = 0;
            for (var i = 0; i < sets.length; i++) {
                if (sets[i].name != exerciseName) {
                    continue;
                }

                if (lines[sets[i].set - 1] === undefined) {
                    lines[sets[i].set - 1] = [];
                }

                if (sets[i].date != currentDate) {
                    currentDate = sets[i].date;
                    currentDateIndex++;
                }

                lines[sets[i].set - 1].push({ x: currentDateIndex, xText: currentDate, y: sets[i].reps * sets[i].weight });
            }
        } else {
            lines = new Array(FilterManager.selectedWeightExercises.length);

            var currentDate = sets[0].date;
            var currentExerciseName = sets[0].name;
            var currentDateIndex = 0;
            var weightLifted = 0;
            for (var i = 0; i < sets.length; i++) {
                var index = FilterManager.selectedWeightExercises.indexOf(sets[i].name);
                if (index === -1) {
                    continue;
                }

                if (lines[index] === undefined) {
                    lines[index] = [];
                }

                if (sets[i].date !== currentDate) {
                    currentDate = sets[i].date;
                    currentDateIndex++;
                }

                if (sets[i].name === currentExerciseName) {
                    weightLifted += sets[i].weight * sets[i].reps;
                } else {
                    lines[index].push({ x: currentDateIndex, xText: currentDate, y: weightLifted });
                    weightLifted = 0;
                    currentExerciseName = sets[i].name;
                }
            }
        }

        var plotGraph = new PlotGraph(document.getElementById("workoutDataGraph"), 1000, 600, { title: "All", xAxis: "Date", yAxis: "Weight Lifted (lbs)" }, pointOnClick);
        for (var i = 0; i < lines.length; i++) {
            plotGraph.AddLine(lines[i]);
            plotGraph.Render();
        }

        console.log("weight");
    } else if (FilterManager.selectedCardioExercises.length > 0) {
        console.log("cardio");
    } else {
        console.log("nothing");
    }
*/
}

//   +----------+---------------+---------------+     +---------------+
// 1 |<exercise>|      Set 1    |      Set 2    |.....|      Set n    |
//   +----------+--------+------+--------+------+     +--------+------+
// 2 |  <date>  | Weight | Reps | Weight | Reps |.....| Weight | Reps |
//   +----------+--------+------+--------+------+     +--------+------+
function CreateDayTable(date) {
    // Clear the existing table.
    workoutLogDiv = document.getElementById("workoutDataTable");
    while (workoutLogDiv.firstChild) {
        workoutLogDiv.removeChild(workoutLogDiv.firstChild);
    }

    var h1 = document.createElement("h1");
    h1.innerText = date;
    workoutLogDiv.appendChild(h1);

    CreateWeightTrainingTable(date);
    CreateCardioTable(date);

    var randomColors = false;
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
/*
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
*/
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