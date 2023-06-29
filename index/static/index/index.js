let HEADER_DIV;
let SEARCH_RESULTS_DIV;
let BODY_DIV;
let NAVBAR_DIV;
let LOGIN_DIV;
let LOGIN_FORM;
let BACK_TO_TOP_DIV;

let loadedAssets = [];
let loadedPages = [];
let currentNavBarButtons = {};
let currentContentDiv;

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
        return;
    }

    var textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand('copy');
    } catch (err) {
    }

    document.body.removeChild(textArea);
}

function debounce(callback, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => { callback.apply(this, args)}, delay);
    };
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
const csrftoken = getCookie('csrftoken');

function isAssetLoaded(asset) {
    return loadedAssets.indexOf(asset) >= 0;
}

function isPageLoaded(url) {
    return loadedPages.indexOf(url) >= 0;
}

function getContentTag(url) {
    return url.replace(/[/?=]/g, "") + "-content";
}

function loadPage(dom, url, isInitialLoad) {
    if (!dom.getElementById("content")) throw 'page not found';

    history.replaceState(null, null, window.location.origin + url);
    let contentId = getContentTag(url);

    if (!isPageLoaded(url)) {
        let innerHTML = dom.getElementById("content").innerHTML;

        if (isInitialLoad) {
            dom.getElementById("content").innerHTML = "";
        }

        var contentDiv = document.createElement("div");
        contentDiv.id = contentId;
        contentDiv.innerHTML = innerHTML;
        document.querySelector('#content').appendChild(contentDiv);
    } else {
        contentDiv = document.getElementById(contentId);
    }

    let scripts = dom.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
        if (scripts[i].hasAttribute('bez-base')) continue;
        if (scripts[i].src === '' && !scripts[i].hasAttribute('bez-on-load')) continue;
        if (isAssetLoaded(scripts[i].src)) continue;
        if (isPageLoaded(url)) continue;

        if (scripts[i].hasAttribute('bez-on-load')) {
            let scriptEl = Components.SCRIPT();
            let scriptCode = scripts[i].innerHTML;
            try {
                scriptEl.appendChild(document.createTextNode(scriptCode));
            } catch (e) {
                scriptEl.text = scriptCode;
            }
            document.head.appendChild(scriptEl);
        } else {
            loadedAssets.push(scripts[i].src);
            if (!isInitialLoad) {
                $.ajax({
                    async: false,
                    url: scripts[i].src,
                    dataType: "script"
                });
            }
        }
    }

    let css = dom.getElementsByTagName("link");
    for (var i = 0; i < css.length; i++) {
        let cssLink = css[i].href;
        if (css[i].hasAttribute("bez-base")) continue;
        if (cssLink === '') continue;
        if (isAssetLoaded(cssLink)) continue;

        loadedAssets.push(cssLink);

        if (!isInitialLoad) {
            css = document.createElement("link");
            css.rel = "stylesheet";
            css.href = cssLink;
            document.getElementsByTagName("head")[0].appendChild(css);
        }
    }

    if (!isInitialLoad) {
        currentContentDiv.style.display = "none";
    }

    for (let i = NAVBAR_DIV.children.length - 2; i > 0; i--) {
        NAVBAR_DIV.removeChild(NAVBAR_DIV.children[i]);
    }
    if (url in currentNavBarButtons) {
        currentNavBarButtons[url].forEach(function(v) {
            NAVBAR_DIV.insertBefore(v, NAVBAR_DIV.lastElementChild);
        });
    }

    currentContentDiv = contentDiv;
    currentContentDiv.style.display = "block";
    loadedPages.push(url);
}

function loadUrl(url) {
    fetch(url)
        .then(response => response.text())
        .then(text => {
            let dom = new DOMParser().parseFromString(text, 'text/html');
            loadPage(dom, url, false);
        });
}

function loadSVGs(svgs) {
    svgs.forEach(function(v) {
        fetch(v[0])
            .then(response => response.text())
            .then(svgData => {
                let el = Components.DIV();
                el.innerHTML = svgData;
                el.querySelectorAll("path").forEach(function(path) {
                    path.style.stroke = "";
                    path.setAttribute("class", "icon-svg");
                });
                el.querySelectorAll("circle").forEach(function(path) {
                    path.style.stroke = "";
                    path.setAttribute("class", "icon-svg");
                });
                v[1]().appendChild(el);
            })
            .catch(error => console.log("svg load error: " + error));
    });
}
let isSearchExecuted = false;
let isSearchQueued = false;
let searchQuery;
let searchResults;
let selectedSearchResultIndex = 0;

function executeSearch() {
    isSearchExecuted = false;
    isSearchQueued = false;
    loadUrl(searchResults[selectedSearchResultIndex].url);
    selectedSearchResultIndex = 0;
    clearSearchResults();
    document.getElementById("search").value = "";
}

function clearSearchResults() {
    SEARCH_RESULTS_DIV.innerHTML = "";
    SEARCH_RESULTS_DIV.style.visibility = "hidden";
    searchResults = [];
}

function selectSearchResult(index) {
    if (searchResults.length === 0) return;
    if (index < 0) index = searchResults.length - 1;
    if (index >= searchResults.length) index = 0;

    SEARCH_RESULTS_DIV.children[selectedSearchResultIndex].style.backgroundColor = "#f9f9f9"
    selectedSearchResultIndex = index;
    SEARCH_RESULTS_DIV.children[selectedSearchResultIndex].style.backgroundColor = "#dadadd"
}

function loadSearchResults(results) {
    isSearchQueued = false;

    if (results === undefined || results.length === 0) {
        clearSearchResults();
        return;
    }

    // order results
    results.sort((a, b) => {
        let aContainsSearchQuery = a.text.indexOf(searchQuery) >= 0;
        let bContainsSearchQuery = b.text.indexOf(searchQuery) >= 0;
        if (aContainsSearchQuery && !bContainsSearchQuery) return -1
        else if (!aContainsSearchQuery && bContainsSearchQuery) return 1;

        if (a.text < b.text) return -1;
        else if (a.text > b.text) return 1;
        else return 0;
    });

    searchResults = results;
    SEARCH_RESULTS_DIV.style.visibility = "visible";
    SEARCH_RESULTS_DIV.innerHTML = "";

    for (let i = 0; i < searchResults.length; i++) {
        let spanDiv = document.createElement("span");
        spanDiv.innerText = searchResults[i].text;
        SEARCH_RESULTS_DIV.appendChild(spanDiv);
        if (i === 0) selectSearchResult(0);
    }

    if (isSearchExecuted) {
        executeSearch();
    }
}

function NavBarButton(label, link) {
    let div = Components.DIV();
    let span = Components.SPAN({ "class": "icon-label" });
    span.innerText = label;
    div.addEventListener('click', () => {
        window.open(link, '_blank');
    });

    return Components.AddChild(div, span);
}

$(document).ready(function() {
    HEADER_DIV = document.getElementById("header");
    SEARCH_RESULTS_DIV = document.getElementById("search-results");
    BODY_DIV = document.getElementById("body");
    NAVBAR_DIV = document.getElementById("navbar");
    LOGIN_DIV = document.getElementById("login");
    LOGIN_FORM = document.getElementById("login-form");
    BACK_TO_TOP_DIV = document.getElementById('back-to-top');

    $(document).on("click", "a", function(e) {
        if (!this.rel.startsWith("/")) return true;

        e.preventDefault();
        loadUrl(this.rel);
    });

    var searchFunc = function(query) {
        if (query === undefined || query === '') {
            clearSearchResults();
            return;
        }

        searchQuery = query;
        fetch(`/search?query=${query}&context=${window.location.pathname}`)
        .then(response => { return response.json() })
        .then(json => {
            loadSearchResults(json["results"]);
        });
    };
    var searchDebounceFunc = undefined;
    document.getElementById("search").addEventListener("input", function(e) {
        if (searchDebounceFunc === undefined) searchDebounceFunc = debounce(searchFunc, 169);
        isSearchQueued = true;
        searchDebounceFunc(this.value);
    });

    document.getElementById("search").addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
            isSearchExecuted = true;
            if (!isSearchQueued) {
                if (searchResults && searchResults.length > 0) {
                    executeSearch();
                } else {
                    this.value = "";
                    isSearchExecuted = false;
                }
            }
        } else if (e.key === "ArrowUp") {
            selectSearchResult(selectedSearchResultIndex - 1);
        } else if (e.key === "ArrowDown") {
            selectSearchResult(selectedSearchResultIndex + 1);
        } else if (e.key === "Tab") {
            e.preventDefault();
            selectSearchResult(selectedSearchResultIndex + 1);
        }
    });

    Banner.getInstance().draw();

    const headerHeight = HEADER_DIV.offsetHeight;
    let backToTopTimeout;
    BODY_DIV.addEventListener('scroll', function(e) {
        clearSearchResults();

        let newHeight = headerHeight - BODY_DIV.scrollTop;
        if (newHeight < 0) newHeight = 0;
        HEADER_DIV.style.height = newHeight > 0 ? newHeight + "px" : "0";
        BODY_DIV.style.height = `calc(100vh - ${(newHeight + 75)}px)`;
        if (newHeight > 0) {
            Components.Show(HEADER_DIV);
        } else {
            Components.Hide(HEADER_DIV);
        }
        Components.Hide(LOGIN_DIV);
        BACK_TO_TOP_DIV.style.transition = "none";
        BACK_TO_TOP_DIV.style.opacity = 1;


        backToTopTimeout = setTimeout(() => {
            BACK_TO_TOP_DIV.style.transition = "opacity 5s";
            BACK_TO_TOP_DIV.style.opacity = 0;
        }, 2000);
    });

    document.getElementById("search-button").addEventListener('click', function(event) {
        SmoothScroll(0, 250);
        setTimeout(() => { document.getElementById("search").focus(); }, 500);
    });

    let loginButton = document.getElementById("login-button");
    if (loginButton) {
        loginButton.addEventListener('click', function(event) {
            let rect = loginButton.getBoundingClientRect();
            Components.Show(LOGIN_DIV);
            LOGIN_DIV.style.left = (rect.right - LOGIN_DIV.offsetWidth + 3) + "px";
            LOGIN_DIV.style.top = rect.bottom + "px";
            LOGIN_DIV.children[0].children[0].focus();
        });
        LOGIN_FORM.addEventListener("submit", function(event) {
            event.preventDefault();

            const username = LOGIN_FORM.children[0].value;
            const password = LOGIN_FORM.children[1].value;

            fetch("/api/v1/login", {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-CSRFToken": csrftoken },
                body: JSON.stringify({ "username": username, "password": password })
            })
            .then(response => {
                window.location.reload();
            })
            .catch(error => {
                window.location.reload();
            });
        });


        document.addEventListener('click', function(event) {
            var target = event.target;
            if (!loginButton.contains(target) && !LOGIN_DIV.contains(target)) {
                Components.Hide(LOGIN_DIV);
            }
        });
    }

    BACK_TO_TOP_DIV.addEventListener('click', function(event) {
        SmoothScroll(0, 250);
    });

    loadPage(document, window.location.pathname, true);
});
