var blessed = require('blessed');

// Create a screen object.
var screen = blessed.screen({
  smartCSR: true
});

screen.title = 'ScotlandJS Demo';

// Create a box perfectly centered horizontally and vertically.
var box = blessed.box({
  top: 'center',
  left: 'center',
  width: '50%',
  height: '50%',
  content: 'Hello {bold}ScotlandJS{/bold}! Why don\'t you give this box a click?',
  tags: true,
  border: {
    type: 'line'
  }
});

// Append our box to the screen.
screen.append(box);

// If our box is clicked, change the content.
box.on('click', function(data) {
  box.setContent('{center}This is so {red-fg}cool{/red-fg} amirite?! How about pressing the enter button and see what happens?{/center}');
  screen.render();
});

// If box is focused, handle `enter`/`return` and hides the box.
box.key('enter', function(ch, key) {
  box.hide();
  screen.render();
});

// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

// Focus our element.
box.focus();

// Render the screen.
screen.render();