var game = new Phaser.Game(400, 490, Phaser.AUTO, 'gameDiv');
const PIPE_VELOCITY = -200;

var mainState = {

  preload: function () {
    game.stage.backgroundColor = '#113';

    game.load.spritesheet('ship', 'assets/ship_sheet.png', 31, 15);
    game.load.image('pipe', 'assets/pipe.png');
    game.load.image('star', 'assets/star.png');
    
    game.load.spritesheet('flame', 'assets/flame_sheet.png', 15, 15);
  },

  create: function() { 
    game.physics.startSystem(Phaser.Physics.ARCADE);
    
    this.stars = game.add.group();
    this.stars.enableBody = true;
    this.stars.createMultiple(20, 'star');
    this.timerStars = this.game.time.events.loop(500, this.addStar, this);
    
    this.pipes = game.add.group();
    this.pipes.enableBody = true;
    this.pipes.createMultiple(20, 'pipe');
    this.timer = this.game.time.events.loop(2500, this.addRowOfPipes, this);
    
    var ship_x = 100;
    var ship_y = 245;
    this.flame = this.game.add.sprite(ship_x, ship_y -8, 'flame');
    this.flame.animations.add('flame_burn', [0, 1, 2, 1]);
    this.flame.animations.add('flame_stop', [0, 1, 2, 2]);
    this.flame.animations.play('flame_burn', 10, true);

    this.ship = this.game.add.sprite(ship_x, ship_y, 'ship');
    this.ship.animations.add('ship_boom', [0, 1, 2, 3]);
    game.physics.arcade.enable(this.ship);
   

    this.ship.body.gravity.y = 0;
    this.ship.anchor.setTo(-0.2, 0.5);
    this.ship.body.tilePadding.x = 10;
    this.ship.body.tilePadding.y = 10;

    // init keyboard
    var upKey = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
    upKey.onDown.add(this.goUp, this);

    var downKey = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
    downKey.onDown.add(this.goDown, this);

    this.score = 0;
    this.labelScore = this.game.add.text(20, 20, "0", { font: "30px Arial", fill: "#ffffff" });
  },

  update: function() {
    if (this.ship.inWorld === false)
      this.restartGame();

    if (this.ship.alive) { 
      game.physics.arcade.overlap(this.ship, this.pipes, this.hitPipe, null, this);

      if (this.ship.angle < 0)
        this.ship.angle += 1;

      if (this.ship.angle > 0)
        this.ship.angle -= 1;
    }

    this.flame.x =this.ship.x;
    this.flame.y =this.ship.y -8;
  },

  goUp: function() {
    if (this.ship.alive == false) return;
    
    this.ship.body.velocity.y -= 50;

    if (this.ship.body.velocity.y < -250) this.ship.body.velocity.y = -150;
      
    // Create an animation on the ship
    var animation = game.add.tween(this.ship);

    // Set the animation to change the angle of the sprite to -20° in 100 milliseconds
    animation.to({angle: -20}, 100);

    // And start the animation
    animation.start();
  },
  
  goDown: function() {
    if (this.ship.alive == false) return;
    
    this.ship.body.velocity.y += 50;
    
    if (this.ship.body.velocity.y > 250) this.ship.body.velocity.y = 250;

    // Create an animation on the ship
    var animation = game.add.tween(this.ship);

    // Set the animation to change the angle of the sprite to -20° in 100 milliseconds
    animation.to({angle: 20}, 100);

    // And start the animation
    animation.start();
  },

  restartGame: function() {
    game.state.start('main');
  },
  
  addStar: function() {
    var star = this.stars.getFirstDead();
    var r = Math.random();
    star.reset(400, Math.floor(r * 360 ) + 20);
    
    vx = -100;
    if ((r < 0.3) || (r > 0.7)) 
      vx = -120;
    else if ((r > 0.45) && (r < 0.55))
      vx = -80;
    
    star.body.velocity.x = vx;
    star.checkWorldBounds = true;
    star.outOfBoundsKill = true;
  },

  addOnePipe: function(x, y) {
    var pipe = this.pipes.getFirstDead();
  
    var hole = Math.floor(Math.random()*5)+1;

    pipe.reset(x, y);
    pipe.body.velocity.x = PIPE_VELOCITY;     
    pipe.checkWorldBounds = true;
    pipe.outOfBoundsKill = true;
  },

  hitPipe: function() {  
    // If the ship has already hit a pipe, we have nothing to do
    if (this.ship.alive == false) return;

    // Set the alive property of the ship to false
    this.ship.alive = false;
    
    this.ship.body.gravity.y = 0;
    this.ship.body.velocity.y = 0;

    // Prevent new pipes from appearing
    game.time.events.remove(this.timer);
    game.time.events.remove(this.timerStars);

    // kick out the ship
    this.ship.body.velocity.x = PIPE_VELOCITY;
    this.ship.animations.play('ship_boom', 4, false);
    this.flame.animations.play('flame_stop', 4, false);
  },

  addRowOfPipes: function() {
    var hole = Math.floor(Math.random()*5)+1;

    for (var i = 0; i < 8; i++)
      if (i != hole && i != hole +1) 
        this.addOnePipe(400, i*60+10);   

    this.score += 1;
    this.labelScore.text = this.score;

     game.stage.backgroundColor = '#111';
     setTimeout(function(){game.stage.backgroundColor = '#113';}, 150);
  },

};

game.state.add('main', mainState);  
game.state.start('main'); 