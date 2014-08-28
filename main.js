var game = new Phaser.Game(400, 490, Phaser.AUTO, 'gameDiv');
const PIPE_VELOCITY = -200;

var in_tuto = true;
var best_score;

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

    var spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    spaceKey.onDown.add(this.skipTuto, this);

    // init text
    this.score = 0;

    this.in_tuto = true;
    this.labelTitle = this.game.add.text( 60, 50, "SpaceShip A", { font: "20px over_there", fill: "#FFF" });
    this.labelScore = this.game.add.text( 20, 20, "", { font: "30px Arial", fill: "#ffffff" });
    this.labelTuto = this.game.add.text( 20, 150, "use UP and DOWN to pilot", { font: "30px Arial", fill: "#FF8080" } )
    this.labelStart = this.game.add.text( 60, 450, "press SPACE to start", { font: "30px Arial", fill: "#80FF80" } )

    this.best_score = window.localStorage.getItem('best_score') || 0;

    if (this.best_score > 0 )
      this.labelBestScore = this.game.add.text( 130, 410, "BEST SCORE: " + this.best_score, { font: "20px Arial", fill: "gold" } );
  },

  skipTuto: function() {
    if (this.in_tuto) {
      this.in_tuto = false;
      this.labelTuto.text = "";
      this.labelStart.text = "";
      this.labelBestScore.text = "";
      this.game.add.tween(this.labelTitle).to( { x: -460 }, 2000, Phaser.Easing.Bounce.Out, true, 2250);
      this.startPipes();
    }
  },
  

  startPipes: function() {
    this.timer = this.game.time.events.loop(2500, this.addRowOfPipes, this);
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
    var animation = game.add.tween(this.ship);
    animation.to({angle: -20}, 100);
    animation.start();
  },
  
  goDown: function() {
    if (this.ship.alive == false) return;
    
    this.ship.body.velocity.y += 50;
    if (this.ship.body.velocity.y > 250) this.ship.body.velocity.y = 250;
    var animation = game.add.tween(this.ship);
    animation.to({angle: 20}, 100);
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
    var hole = Math.floor( Math.random() * 5 ) + 1;

    pipe.reset(x, y);
    pipe.body.velocity.x = PIPE_VELOCITY;     
    pipe.checkWorldBounds = true;
    pipe.outOfBoundsKill = true;
  },

  hitPipe: function() {  
    if (this.ship.alive == false) return;

    this.ship.alive = false;
    this.ship.body.gravity.y = 0;
    this.ship.body.velocity.y = 0;
    game.time.events.remove(this.timer);
    game.time.events.remove(this.timerStars);

    this.ship.body.velocity.x = PIPE_VELOCITY;
    this.ship.animations.play('ship_boom', 4, false);
    this.flame.animations.play('flame_stop', 4, false);

    if (this.best_score < this.score) {
      this.best_score = this.score;
      window.localStorage.setItem('best_score', this.best_score);
    }
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