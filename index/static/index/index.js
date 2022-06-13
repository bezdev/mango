$(document).ready(function() {
    // set to true so we can load scripts without warning
    $.ajaxPrefilter(function(options, originalOptions, jqXHR) {
        options.async = true;
    });

    var banner = new Banner("banner");
});

// TODO: don't make this so generic
$(document).on("click", "a", function(e) {
    e.preventDefault();
    $("#content").load(this.href, function() {
    });
    history.replaceState(null, null, this.rel);
});