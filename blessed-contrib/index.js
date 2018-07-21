var blessed = require('blessed')
  , contrib = require('blessed-contrib')

var screen = blessed.screen();

var grid = new contrib.grid({rows: 12, cols: 12, screen: screen});

// grid.set(row, col, rowSpan, colSpan, obj, opts)
var map = grid.set(0, 0, 4, 4, contrib.map, {label: 'Fancy World Map'});
var box = grid.set(4, 4, 4, 4, blessed.box, {label: 'Some Box', content: 'Hi ScotlandJS!'});

screen.render();
