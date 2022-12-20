let loadedAssets = [];
let loadedPages = [];
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

    let contentId = getContentTag(url);

    if (!isPageLoaded(url)) {
        loadedPages.push(url);
        let innerHTML = dom.getElementById("content").innerHTML;

        if (isInitialLoad) {
            dom.getElementById("content").innerHTML = "";
        }

        var contentDiv = document.createElement("div");
        contentDiv.id = contentId;
        contentDiv.innerHTML = innerHTML;
        document.querySelector('#content').appendChild(contentDiv);

        // Run on-load scripts
        if (dom.scripts) {
            for (let i = 0; i < dom.scripts.length; i++) {
                let script = dom.scripts[i];
                if (!script.hasAttribute('bez-on-load')) continue;

                let scriptEl = document.createElement("script");
                Array.from(script.attributes).forEach(attr => {
                    scriptEl.setAttribute(attr.name, attr.value) 
                });

                let scriptCode = script.innerHTML;
                try {
                    scriptEl.appendChild(document.createTextNode(scriptCode));
                    document.head.appendChild(scriptEl);
                } catch (e) {
                    scriptEl.text = scriptCode;
                    document.head.appendChild(scriptEl);
                }

                break;
            }
        }
    } else {
        contentDiv = document.getElementById(contentId);
    }

    let scripts = dom.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
        if (scripts[i].hasAttribute('bez-base')) continue;
        if (scripts[i].src === '') continue;
        if (isAssetLoaded(scripts[i].src)) continue;

        loadedAssets.push(scripts[i].src);

        if (!isInitialLoad) $.getScript(scripts[i].src);
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

    currentContentDiv = contentDiv;
    currentContentDiv.style.display = "block";
}

function loadUrl(url) {
    fetch(url)
        .then(response => response.text())
        .then(text => {
            let dom = new DOMParser().parseFromString(text, 'text/html');
            loadPage(dom, url, false);
            history.replaceState(null, null, window.location.origin + url);
        });
}

let isSearchExecuted = false;
let isSearchQueued = false;
let searchQuery;
let searchResults;
let searchResultsDiv;
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
    searchResultsDiv.innerHTML = "";
    searchResultsDiv.style.visibility = "hidden";
    searchResults = [];
}

function selectSearchResult(index) {
    if (searchResults.length === 0) return;
    if (index < 0) index = searchResults.length - 1;
    if (index >= searchResults.length) index = 0;

    searchResultsDiv.children[selectedSearchResultIndex].style.backgroundColor = "#f9f9f9"
    selectedSearchResultIndex = index;
    searchResultsDiv.children[selectedSearchResultIndex].style.backgroundColor = "#dadadd"
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
    searchResultsDiv.style.visibility = "visible";
    searchResultsDiv.innerHTML = "";

    for (let i = 0; i < searchResults.length; i++) {
        let spanDiv = document.createElement("span");
        spanDiv.innerText = searchResults[i].text;
        searchResultsDiv.appendChild(spanDiv);
        if (i === 0) selectSearchResult(0);
    }

    if (isSearchExecuted) {
        executeSearch();
    }
}

$(document).ready(function() {
    searchResultsDiv = document.getElementById("searchResults");

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

    loadPage(document, window.location.pathname, true);

    Banner.getInstance().draw();
});
