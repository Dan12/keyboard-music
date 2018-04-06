/**
 * a ripple function for a JQW.
 * TODO add functions to jquery wrapper 
 */
function rippleElement(element: JQW) {
  let parent = element.getJQ();
  if (parent.find('.ink').length === 0) {
    parent.prepend('<span class="ink"></span>');
  }

  let ink = parent.find('.ink');
	// incase of quick double clicks stop the previous animation
  ink.removeClass('animate');

	// set size of .ink
  if (!ink.height() && !ink.width()) {
		// use parent's width or height whichever is larger for the diameter to make a circle which can cover the entire element.
    let d = Math.max(parent.outerWidth(), parent.outerHeight());
    ink.css({height: d, width: d});
  }

	// set the position and add class .animate
  ink.css({top: '-1px', left: '-1px'}).addClass('animate');
}
