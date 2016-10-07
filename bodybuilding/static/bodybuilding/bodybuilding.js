var dates;
var sets;
var cardio;
var weightExercises;
var cardioExercises;
var datesList = [];
var currDateIndex;

var workoutLogDiv;

$(document).ready(function() {
    Initialize();

    FilterManager.Initialize();
});

class FilterManager {
    static Initialize() {
        this.selectedWeightExercises = [];
        this.selectedCardioExercises = [];

        this.filterColors = [ { color: "red", used: false }, { color: "blue", used: false }, { color: "green", used: false }, { color: "pink", used: false }, { color: "slateblue", used: false }, { color: "khaki", used: false } ];

        this.selectedExercisesCount = 0;
        this.maxExercisesSelectedCount = 5;

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

        FilterManager.SelectAllExercises();

        RenderData();
    }

    static GetFilteredPlotData() {
        var lines = [];
        var labels;

        if (FilterManager.selectedExercisesCount === (weightExercises.length + cardioExercises.length)) {
            // Return all exercises.
            var weightTrainingLinePoints = [];

            var currentDate = sets[0].date;
            var currentDateIndex = 0;
            var amountLifted = 0;
            for (var i = 0; i < sets.length; i++) {
                if (sets[i].date === currentDate) {
                    amountLifted += sets[i].weight * sets[i].reps;
                } else {
                    weightTrainingLinePoints.push({ x: currentDateIndex, xText: sets[i].date, y: amountLifted });

                    currentDate = sets[i].date;
                    currentDateIndex++;
                    amountLifted = (sets[i].weight * sets[i].reps);
                }
            }

            lines.push({ points: weightTrainingLinePoints, color: FilterManager.filterColors[0].color });
            labels = { title: "All", xAxis: "Date", yAxis: "Weight Lifted (lbs)" };
        } else if (FilterManager.selectedWeightExercises.length > 0 && FilterManager.selectedCardioExercises.length > 0) {
            console.log("both weight + cardio");
        } else if (FilterManager.selectedWeightExercises.length > 0) {
            // If there's only one exercise selected create lines for every set.
            // Otherwise create a line for each exercise in the selection.
            if (FilterManager.selectedWeightExercises.length === 1) {
                var exerciseName = FilterManager.selectedWeightExercises[0].name;

                // Determine the max amount of sets in the data.
                var maxSet = 0;
                for (var i = 0; i < sets.length; i++) {
                    if (sets[i].name != exerciseName) {
                        continue;
                    }

                    if (sets[i].set > maxSet) {
                        maxSet = sets[i].set;
                    }
                }

                lines = new Array(maxSet);

                var currentDate = sets[0].date;
                var currentDateIndex = 0;
                for (var i = 0; i < sets.length; i++) {
                    if (sets[i].name != exerciseName) {
                        continue;
                    }

                    // Initialize the array of points if not yet defined for this set.
                    if (lines[sets[i].set - 1] === undefined) {
                        lines[sets[i].set - 1] = { points: [], color: FilterManager.filterColors[sets[i].set - 1].color };
                    }

                    if (sets[i].date != currentDate) {
                        currentDate = sets[i].date;
                        currentDateIndex++;
                    }

                    lines[sets[i].set - 1].points.push({ x: currentDateIndex, xText: currentDate, y: sets[i].reps * sets[i].weight });
                }
            } else {
                lines = new Array(FilterManager.selectedWeightExercises.length);

                var datesSeen = [];
                for (var i = 0; i < sets.length; i++) {
                    var index = FilterManager.GetSelectedExerciseIndex(sets[i].name);
                    if (index === -1) {
                        continue;
                    }

                    // initialize the array of points if not yet defined for this exercise
                    if (lines[index] === undefined) {
                        lines[index] = { points: [], color: FilterManager.GetSelectedExerciseColor(sets[i].name) };
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
                    lines[index].points.push({ x: 0, xText: sets[i].date, y: weightLifted });
                }

                // fill in .x values
                for (var i = 0; i < lines.length; i++) {
                    for (var j = 0; j < lines[i].points.length; j++) {
                        lines[i].points[j].x = datesSeen.indexOf(lines[i].points[j].xText);
                    }
                }
            }

            labels = { title: "Weightlifting", xAxis: "Date", yAxis: "Weight Lifted (lbs)" };
        } else if (FilterManager.selectedCardioExercises.length > 0) {
            console.log("cardio");
        }

        return { lines: lines, labels: labels };
    }

    static ExerciseButtonOnClick(that, type) {
        // If all filters are selected we need to clear them first
        if (FilterManager.selectedExercisesCount === (weightExercises.length + cardioExercises.length)) {
            FilterManager.ClearFilters();
        }

        // If we can no longer select any more exercises, we must make sure that the exercise clicked was already selected.
        // If so then we can mark the rest to be enabled.
        if (FilterManager.selectedExercisesCount === FilterManager.maxExercisesSelectedCount) {
            if ($(that).hasClass("selected")) {
                var buttons = document.getElementById("weightExercisesNav").children;
                for (var j = 0; j < buttons.length; j++) {  
                    if ($(buttons[j]).hasClass("disabled")) {
                        $(buttons[j]).removeClass("disabled");
                    }
                }

                buttons = document.getElementById("cardioExercisesNav").children;
                for (var j = 0; j < buttons.length; j++) {  
                    if ($(buttons[j]).hasClass("disabled")) {
                        $(buttons[j]).removeClass("disabled");
                    }
                }
            } else {
                return;
            }
        }

        var selectedExercises;
        if (type === "bodybuilding") {
            selectedExercises = FilterManager.selectedWeightExercises;
        } else if (type === "cardio") {
            selectedExercises = FilterManager.selectedCardioExercises;
        }

        // If the exercise can't be found, add it, otherwise remove it.
        var index = FilterManager.GetSelectedExerciseIndex(that.innerText);
        if (index === -1) {
            // Find a color that isn't being used.
            var color;
            var colorIndex;
            for (var i = 0; i < FilterManager.filterColors.length; i++) {
                if (!FilterManager.filterColors[i].used) {
                    color = FilterManager.filterColors[i].color;
                    FilterManager.filterColors[i].used = true;
                    colorIndex = i;
                    break;
                }
            }

            selectedExercises.push({ name: that.innerText, colorIndex: colorIndex});
            FilterManager.selectedExercisesCount++;
            $(that).addClass("selected");

            $(that).css("background-color", color);

            // Disable the other buttons if max num has been reached.
            if (FilterManager.selectedExercisesCount === FilterManager.maxExercisesSelectedCount) {

                var buttons = document.getElementById("weightExercisesNav").children;
                for (var j = 0; j < buttons.length; j++) {
                    if ($(buttons[j]).hasClass("selected")) {
                        continue;
                    }

                    $(buttons[j]).toggleClass("disabled");
                }

                buttons = document.getElementById("cardioExercisesNav").children;
                for (var j = 0; j < buttons.length; j++) {
                    if ($(buttons[j]).hasClass("selected")) {
                        continue;
                    }

                    $(buttons[j]).toggleClass("disabled");
                }
            }
        } else {
            var colorIndex = selectedExercises[index].colorIndex;
            selectedExercises.splice(index, 1);
            FilterManager.selectedExercisesCount--;

            // If the last filter was removed, then select all filters.
            if (FilterManager.selectedExercisesCount === 0) {
                FilterManager.SelectAllExercises();
            } else {
                $(that).removeClass("selected");
                $(that).css("background-color", "");
                FilterManager.filterColors[colorIndex].used = false;
            }
        }

        RenderData();
    }

    static GetSelectedExerciseIndex(name) {
        for (var i = 0; i < FilterManager.selectedWeightExercises.length; i++) {
            if (FilterManager.selectedWeightExercises[i].name == name) {
                return i;
            }
        }

        for (var i = 0; i < FilterManager.selectedCardioExercises.length; i++) {
            if (FilterManager.selectedCardioExercises[i].name == name) {
                return i;
            }
        }

        return -1;
    }

    static GetSelectedExerciseColor(name) {
        for (var i = 0; i < FilterManager.selectedWeightExercises.length; i++) {
            if (FilterManager.selectedWeightExercises[i].name == name) {
                return FilterManager.filterColors[FilterManager.selectedWeightExercises[i].colorIndex].color;
            }
        }

        for (var i = 0; i < FilterManager.selectedCardioExercises.length; i++) {
            if (FilterManager.selectedCardioExercises[i].name == name) {
                return FilterManager.filterColors[FilterManager.selectedCardioExercises[i].colorIndex].color;
            }
        }
    }

    static SelectAllExercises() {
        FilterManager.ClearFilters();

        var buttons = document.getElementById("weightExercisesNav").children;
        for (var i = 0; i < buttons.length; i++) {
            $(buttons[i]).addClass("selected");
            $(buttons[i]).css("background-color", FilterManager.filterColors[0].color);
            FilterManager.filterColors[0].used = true;
        }

        buttons = document.getElementById("cardioExercisesNav").children;
        for (var i = 0; i < buttons.length; i++) {
            $(buttons[i]).addClass("selected");
            $(buttons[i]).css("background-color", FilterManager.filterColors[1].color);
            FilterManager.filterColors[1].used = true;
        }

        for (var i = 0; i < weightExercises.length; i++) {
            FilterManager.selectedWeightExercises.push({ name: weightExercises[i], color: FilterManager.filterColors[0].color });
            FilterManager.selectedExercisesCount++;
        }

        for (var i = 0; i < cardioExercises.length; i++) {
            FilterManager.selectedCardioExercises.push({ name: cardioExercises[i], color: FilterManager.filterColors[1].color });
            FilterManager.selectedExercisesCount++;
        }
    }

    static ClearFilters() {
        var buttons = document.getElementById("weightExercisesNav").children;
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].className = "";
            buttons[i].colorIndex = -1;
            $(buttons[i]).css("background-color", "");
        }

        buttons = document.getElementById("cardioExercisesNav").children;
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].className = "";
            buttons[i].colorIndex = -1;
            $(buttons[i]).css("background-color", "");
        }

        FilterManager.selectedWeightExercises = [];
        FilterManager.selectedCardioExercises = [];

        FilterManager.selectedExercisesCount = 0;

        for (var i = 0; i < FilterManager.filterColors.length; i++) {
            FilterManager.filterColors[i].used = false;
        }
    }
}

function RenderData() {
    var data = FilterManager.GetFilteredPlotData();

    var pointOnClick = function (x, y, date) {
            CreateDayTable(date);
    };
    var plotGraph = new PlotGraph(document.getElementById("workoutDataGraph"), 1000, 600, { title: data.labels.title, xAxis: data.labels.xAxis, yAxis: data.labels.yAxis }, pointOnClick);
    for (var i = 0; i < data.lines.length; i++) {
        plotGraph.AddLine(data.lines[i].points, data.lines[i].color);
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
    var maxSet = 0;
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