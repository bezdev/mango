function createNote(lines) {
    let notes = document.getElementById("note");

    let inList = false;

    lines.forEach((element) => {
        if (match = element.match(/<h1>(.*)<\/h1>/i)) {
            let h1 = document.createElement("h1");
            h1.className = "note-h1";
            h1.innerText = match[1];
            notes.appendChild(h1);
        } else if (match = element.match(/<list>/i)) {
            inList = document.createElement("ol");
            inList.className = "note-ol";
        } else if (match = element.match(/<\/list>/i)) {
            notes.appendChild(inList);
            inList = false;
        } else {
            
            let span = document.createElement("span");
            span.innerText = element;
            span.onclick = (event) => {
                copyToClipboard(event.target.innerText);
            };

            if (inList)  {
                span.className = "note-list-item";
                let li = document.createElement("li");
                li.appendChild(span);
                inList.appendChild(li);
            } else {
                span.className = "note-item";

                notes.appendChild(span);
            }
        }
    });
}

$(document).ready(function() {
    Initialize();
});