var $artGallery = $('#art-gallery');
var $frames = $artGallery.children('.frame');

[...$frames].forEach((frame) => {
  var $frame = $(frame);
  $frame.on('click', () => {
    if($frame.hasClass('focus')) $frame.removeClass('focus');
    else {
      $frames.removeClass('focus');
      $frame.addClass('focus');
    }
  });
});