var load_state = {
    preload: function () {
    this.game.stage.backgroundColor = '#113';
    this.game.load.spritesheet('ship', 'assets/ship_sheet.png', 31, 15);
    this.game.load.image('pipe', 'assets/pipe.png');
    this.game.load.image('star', 'assets/star.png');
    this.game.load.spritesheet('flame', 'assets/flame_sheet.png', 15, 15); 
  },

  create: function() {
    this.game.state.start('play');
  }
}