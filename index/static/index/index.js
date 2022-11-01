let loadedAssets = [];
let loadedPages = [];
let currentContentDiv;

function debounce(callback, delay) {
    let timeout;
    return function() {
        clearTimeout(timeout);
        timeout = setTimeout(callback, delay);
    }
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

function loadDom(dom, isInitialLoad) {
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

    let url = window.location.pathname;
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
    } else {
        contentDiv = document.getElementById(contentId);
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
            loadDom(dom, false);
        });
    history.replaceState(null, null, window.location.origin + url);
}

$(document).ready(function() {
    $(document).on('click', 'a', function(e) {
        if (!this.rel.startsWith("/")) return true;

        e.preventDefault();
        loadUrl(this.rel);
    });

    var searchDebounceFunc = undefined;
    document.getElementById('search').addEventListener('input', function(e) {
        var searchFunc = function() {
            // console.log('e');
        };
        if (searchDebounceFunc === undefined) searchDebounceFunc = debounce(searchFunc, 300);
        searchDebounceFunc();
    });

    document.getElementById('search').addEventListener('keydown', function(e) {
        var that = this;
        if (e.key === 'Enter') {
            fetch('/search?q=' + this.value)
            .then(response => response.json())
            .then(json => {
                if (json['actions'].length > 0) {
                }
                if (json['sites'].length > 0) {
                    loadUrl(json['sites'][0]);
                }
                that.value = '';
            });
        }
    });

    loadDom(document, true);

    Banner.getInstance().draw();
});
