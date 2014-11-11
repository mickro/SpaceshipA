var play_state = {
  preload: function() {
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.setShowAll();
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVeritcally = true;
    game.scale.refresh();
  },

  create: function() { 
    game.physics.startSystem(Phaser.Physics.ARCADE);
    
    this.stars = game.add.group();
    this.stars.enableBody = true;
    this.stars.createMultiple(20, 'star');
    this.timerStars = game.time.events.loop(500, this.addStar, this);
    
    this.pipes = game.add.group();
    this.pipes.enableBody = true;
    this.pipes.createMultiple(20, 'pipe');
    
    this.flame = game.add.sprite(SHIP_X, SHIP_Y -8, 'flame');
    this.flame.animations.add('flame_burn', [0, 1, 2, 1]);
    this.flame.animations.add('flame_stop', [0, 1, 2, 2]);
    this.flame.animations.play('flame_burn', 10, true);

    this.ship = game.add.sprite(SHIP_X, SHIP_Y, 'ship');
    this.ship.animations.add('ship_boom', [0, 1, 2, 3]);
    game.physics.arcade.enable(this.ship);

    this.touch = game.add.sprite(-100, -100, 'touch');
    this.touch.animations.add('touch_start', [0, 1, 2, 3, 4, 0]);

   
    this.ship.body.gravity.y = 0;
    this.ship.anchor.setTo(-0.2, 0.5);
    this.ship.body.tilePadding.x = 10;
    this.ship.body.tilePadding.y = 10;

    // init keyboard
    var upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
    upKey.onDown.add(this.goUp, this);

    var downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
    downKey.onDown.add(this.goDown, this);

    var spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    spaceKey.onDown.add(this.skipTuto, this);

    // init touch screen
    game.input.onDown.add(this.onDownInput, this);
    game.input.onUp.add(this.onUpInput, this);

    this.autopilot = false; // on touch usage only

    // init text
    score = 0;

    in_tuto = true;

    var x_centred = game.world.width/2, y = game.world.height/2;

    this.labelTitle = game.add.text( x_centred, 50, "SpaceShip A", { font: "20px over_there", fill: "#FFF" });
    this.labelTitle.anchor.setTo(0.5, 0.5);

    this.labelScore = game.add.text( 20, 20, "", { font: "30px Arial", fill: "#ffffff" });

    this.labelTuto = game.add.text( x_centred, 150, label_tuto_text, { font: "30px Arial", fill: "#FF8080" } )
    this.labelTuto.anchor.setTo(0.5, 0.5);

    this.labelStart = game.add.text( x_centred, 450, label_start_text, { font: "30px Arial", fill: "#80FF80" } )
    this.labelStart.anchor.setTo(0.5, 0.5);

    best_score = window.localStorage.getItem('best_score') || 0;

    if (best_score > 0 ) {
      this.labelBestScore = game.add.text( x_centred, 410, "BEST SCORE: " + best_score, { font: "20px Arial", fill: "gold", align: "center"} );
      this.labelBestScore.anchor.setTo(0.5, 0.5);
    }
  },

  onDownInput: function() {
    this.on_down_x = game.input.activePointer.worldX;
    this.on_down_y = game.input.activePointer.worldY;
  },

  onUpInput: function() {
    this.on_up_x = game.input.activePointer.worldX;
    this.on_up_y = game.input.activePointer.worldY;

    this.checkTouch();
  },

  resetTouch: function() {
    this.on_up_x = undefined;
    this.on_down_x = undefined;
    this.on_up_y = undefined;
    this.on_down_y = undefined;
  },

  checkTouch: function () {
    // test move on X
    if (this.on_up_x && this.on_down_x && this.on_up_y && this.on_down_y) {
      var delta_y =  this.on_up_y - this.on_down_y;
      var delta_x =  this.on_up_x - this.on_down_x;
      if ((Math.abs(delta_y) < MAX_TOUCH_DELTA ) && (delta_x > MAX_TOUCH_DELTA)) {
        this.skipTuto();
      } else if ( (Math.abs(delta_y) < MAX_TOUCH_DELTA) && (Math.abs(delta_x) < MAX_TOUCH_DELTA)) {
        this.touch.x = this.on_up_x - 32;
        this.touch.y = this.on_up_y - 32;

        this.autopilot_to_y = this.on_up_y;
        this.autopilot = true;

        this.touch.animations.play('touch_start', 15, false);

        if (this.on_up_y > this.ship.y + 8)
        {
          this.goDown();
        }
          else
        {
          this.goUp();
        }
      }
    }
    this.resetTouch();
  },

  skipTuto: function() {
    if (in_tuto) {
      in_tuto = false;
      this.labelTuto.text = "";
      this.labelStart.text = "";
      if (this.labelBestScore) this.labelBestScore.text = "";
      game.add.tween(this.labelTitle).to( { x: -460 }, 2000, Phaser.Easing.Bounce.Out, true, 2250);
      this.startPipes();
    }
  },
  

  startPipes: function() {
    this.timer = game.time.events.loop(2500, this.addRowOfPipes, this);
  },

  update: function() {
    if (this.ship.inWorld === false)
      this.restartGame();

    if (this.ship.alive) { 
      game.physics.arcade.overlap(this.ship, this.pipes, this.hitPipe, null, this);

      if (this.ship.angle < 0)
        this.ship.angle += 1;

      if (this.ship.angle > 0) {
        this.ship.angle -= 1;
      }

      if (this.autopilot) {
        if ( (
            (this.ship.body.y > this.autopilot_to_y) && (this.ship.body.velocity.y > 0)
          ) || (
            (this.ship.body.y < this.autopilot_to_y) && (this.ship.body.velocity.y < 0)
          ) ) {
          this.autopilot = false;
          this.ship.body.velocity.y = 0;
        }
      }

      if (pipe_to_score === true) {
        if ( (this.current_pipe.x + this.current_pipe.width) < this.ship.x) {
          pipe_to_score = false;
          score += 1;
          this.labelScore.text = score;
        } 
      }
    }

    this.flame.x = this.ship.x;
    this.flame.y = this.ship.y -8;
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
    game.state.start('play');
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
    return pipe;
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

    if (best_score < score) {
      best_score = score;
      window.localStorage.setItem('best_score', best_score);
    }

    pipe_to_score = false;
  },

  addRowOfPipes: function() {
    var hole = Math.floor(Math.random()*5)+1;

    for (var i = 0; i < 8; i++)
      if (i != hole && i != hole +1) {
        this.current_pipe = this.addOnePipe(400, i*60+10);
      }

    pipe_to_score = true;

     game.stage.backgroundColor = '#111';
     setTimeout(function(){game.stage.backgroundColor = '#113';}, 150);
  },
}