var game = new Phaser.Game(400, 490, Phaser.AUTO, 'gameDiv');
const PIPE_VELOCITY = -200;

var in_tuto = true;
var best_score;
var pipe_to_score = false;

game.state.add('load', load_state);
game.state.add('play', play_state);  
game.state.start('load'); 