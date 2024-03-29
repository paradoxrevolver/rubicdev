$(function () {
    var $allFrames = $(".art-gallery .frame");

    $allFrames.each((i, el) => {
        var $frame = $(el);
        $frame.on("click", () => {
            if ($frame.hasClass("focus")) {
                $frame.removeClass("focus");
            } else {
                // remove focus class only from frames in THIS art gallery
                $frame
                    .closest(".art-gallery")
                    .children(".frame")
                    .removeClass("focus");
                $frame.addClass("focus");
            }
        });
    });
});
