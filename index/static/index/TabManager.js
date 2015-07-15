function TabManager(tabsDiv) {
    var getChildElementByNodeName = function(element, nodeName) {
        for (var i = 0; i < element.childNodes.length; i++) {
            if (element.childNodes[i].nodeName == nodeName) {
                return element.childNodes[i];
            }
        }
    };

    var showTab = function() {
        for (var link in tabElements) {
            if (link === this.href) {
                tabElements[link].tabLink.className = "selected";
                tabElements[link].tabContent.style.display = "";

//                if (link.indexOf(".html", link.length - 5) !== -1) {
//                    $(tabElements[link].tabContent).load("blog.html");
//                }
//
//                if (link.indexOf(".php", link.length - 4) !== -1) {
//                    $(tabElements[link].tabContent).load("bodybuilding/index.php");
//                }
            } else {
                tabElements[link].tabLink.className = "";
                tabElements[link].tabContent.style.display = "none";
            }
        }

        return false;
    }

    // Init code
    var tabElements = {};

    var tabItems = document.getElementById(tabsDiv).childNodes;
    for (var i = 0; i < tabItems.length; i++) {
        if (tabItems[i].nodeName != "LI") {
            continue;
        }

        var tabLink = getChildElementByNodeName(tabItems[i], "A");

        // TODO: auto generate the div if it's dynamic content
        // Build the tab content div name
        var splitText = tabLink.text.split(" ");
        var tabContentName = splitText[0].charAt(0).toLowerCase() + splitText[0].slice(1);
        for (var j = 1; j < splitText.length; j++) {
            tabContentName += splitText[j].charAt(0).toUpperCase() + splitText[j].slice(1);
        }
        
        tabContentName += "Tab";

        tabElements[tabLink.href] = { tabLink: tabLink, tabContent: document.getElementById(tabContentName)};

        var defaultTab = 0;

        var linkId = 0;
        for (var link in tabElements) {
            tabElements[link].tabLink.onclick = showTab;
            tabElements[link].tabContent.style.display = "none";

            if (linkId === defaultTab) {
                tabElements[link].tabLink.onclick.apply(tabElements[link].tabLink);
            }

            linkId++;
        }
    }
}