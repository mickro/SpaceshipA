var load_state = {
  preload: function () {
    game.stage.backgroundColor = '#113';
    game.load.spritesheet('ship', 'assets/ship_sheet.png', 31, 15);
    game.load.image('pipe', 'assets/pipe.png');
    game.load.image('star', 'assets/star.png');
    game.load.spritesheet('flame', 'assets/flame_sheet.png', 15, 15);
  },

  create: function() {
    game.state.start('play');
  }
}