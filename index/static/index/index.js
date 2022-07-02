let loadedAssets = [];
let loadedPages = [];
let currentContentDiv;

function isAssetLoaded(asset) {
    return loadedAssets.indexOf(asset) >= 0;
}

function isPageLoaded(url) {
    return loadedPages.indexOf(url) >= 0;
}

function getContentTag(url) {
    return url.replace(/[/?=]/g, "") + "-content";
}

function loadAssets(dom, isInitialLoad) {
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

$(document).ready(function() {
    $(document).on('click', 'a', function(e) {
        if (!this.rel.startsWith("/")) return true;

        e.preventDefault();
        fetch(this.href)
        .then(response => response.text())
        .then(text => {
            let dom = new DOMParser().parseFromString(text, 'text/html');
            loadAssets(dom, false);
        });
        history.replaceState(null, null, this.rel);
    });

    loadAssets(document, true);

    Banner.getInstance().draw();
});
