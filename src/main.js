 var isMobileDevice = navigator.userAgent.match(/iPad|iPhone|iPod|Android/i) != null 
      || screen.width <= 480;
const PIPE_VELOCITY = -200;
const MAX_TOUCH_DELTA = 15;

const SHIP_X = 100;
const SHIP_Y = 245;

var in_tuto = true;
var best_score;
var pipe_to_score = false;
var score;

var label_tuto_text = isMobileDevice? "TAP to pilot" : "use UP and DOWN to pilot";
var label_start_text = isMobileDevice? ">>>> >  >  to start" : "press SPACE to start";
var game;

  game = new Phaser.Game(400, 490, Phaser.AUTO, 'gameDiv');

  
  game.state.add('load', load_state);
  game.state.add('play', play_state);
  game.state.start('load');
