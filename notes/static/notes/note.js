class Note {
    static createTOC(noteID) {
        let toc = document.getElementById(noteID);
        if (!toc) return;
        toc = $(toc).find(".toc")[0]

        let previous_level = 0;
        let node_stack = [toc];
        $(`#${noteID} :header`).slice(1).each(function(index) {
            let note_child = $(this)[0];

            // Create TOC element
            let header_id = `${noteID}-${Slugify(note_child.innerText)}`;
            let link_element = Components.A({ 'class': 'toc-link', 'href': `#${header_id}` });
            link_element.innerText = note_child.innerText;
            let h_element = note_child.cloneNode(true);
            h_element.innerHTML = link_element.outerHTML;
            let il_element = Components.AddChild(Components.LI(), h_element);
            il_element.innerHTML = link_element.outerHTML;
            note_child.setAttribute('id', header_id);
    
            let level = parseInt(note_child.tagName.match(/\d+$/)[0], 10);
            if (level === previous_level) {
                node_stack[node_stack.length - 1].appendChild(il_element);
            } else if (level > previous_level) {
                for (let i = previous_level; i < level; i++) {
                    let ul_element = Components.UL();
                    ul_element.appendChild(il_element);
                    let last_li_element = node_stack[node_stack.length - 1].lastElementChild;
                    if (last_li_element) {
                        last_li_element.appendChild(ul_element);
                    } else {
                        node_stack[node_stack.length - 1].appendChild(ul_element);
                    }
                        node_stack.push(ul_element);
                }
            } else {
                while (level < node_stack.length - 1) {
                    node_stack.pop();
                }

                node_stack[node_stack.length - 1].appendChild(il_element);
            }

            previous_level = level;
        });

        toc.addEventListener('click', function(event) {
            if (event.target.matches('.toc-link')) {
                event.preventDefault();
                SmoothScroll(event.target.hash.substring(1), 250);
            }
        });
    }

    static createNote(lines) {
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
}
