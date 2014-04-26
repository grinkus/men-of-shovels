window.addEventListener('load', function () {
	'use strict';

	var Controls,
		Grave,
		Man,
		Rectangle,
		Stage,
		Victim,
		canvas = document.getElementsByTagName('canvas')[0],
		cliff,
		controls,
		graves = [],
		graveWidth = 18,
		ground,
		maxGraveStage = 32,
		player,
		sprite,
		stage,
		victims = [];

	Controls = (function () {

		var Controls = function () {
			this.actions = {};
			this.killed = [];
			this.pressed = [];
		};

		Controls.prototype.addAction = function ( key, action ) {

			var i;

			if ( Array.isArray( key ) ) {
				for ( i = key.length - 1; i >= 0; i-- ) {
					this.actions[ key[ i ] ] = this.actions[ key ] || [];
					this.actions[ key[ i ] ].push( action );
				}
			} else {
					this.actions[ key ] = this.actions[ key ] || [];
					this.actions[ key ].push( action );
			}

		};

		Controls.prototype.press = function ( value ) {
			if ( this.pressed.indexOf( value ) === -1 )
				this.pressed.push( value );
		};

		Controls.prototype.react = function () {

			var key,
				i;

			for ( key in this.actions ) {
				if ( Object.prototype.hasOwnProperty.call( this.actions, key ) ) {
					if ( this.pressed.indexOf( parseInt( key ) ) !== -1 ) {
						if ( this.killed.indexOf( parseInt( key ) ) === -1 ) {
							for ( i = this.actions[ key ].length - 1; i >= 0; i-- ) {
								this.actions[ key ][ i ]();
							}
							if ( parseInt( key ) === 32 )
								this.killed.push( 32 );
						}
					}
				}
			}

		};

		Controls.prototype.release = function ( value ) {

			if ( this.pressed.indexOf( value ) >= 0 )
				this.pressed.splice( this.pressed.indexOf( value ), 1 );

			if ( this.killed.indexOf( value ) >= 0 )
				this.killed.splice( this.killed.indexOf( value ), 1 );

		};

		return Controls;

	})();

	Grave = (function () {

		var Grave = function ( x ) {

			this.x = x;
			this.stage = 1;
			this.timeout = undefined;
			this.width = graveWidth;

			this.decay();

			graves.push( this );
			stage.addChild( this );

		};

		Grave.prototype.checkStage = function () {
			if ( this.stage === 0 ) {
				clearTimeout( this.timeout );
				this.timeout = undefined;
				stage.removeChild( this );
				graves.splice( graves.indexOf( this ), 1 );
			} else {
				this.stage -= 1;
				this.decay();
			}
		};

		Grave.prototype.decay = function () {
			if ( ! this.timeout ) {
				this.timeout = setTimeout(function () {
					this.timeout = undefined;
					this.checkStage();
				}.bind( this ), 500 );
			}
		};

		Grave.prototype.dig = function () {
			this.stage += this.stage;
			if ( this.stage > maxGraveStage )
				this.stage = maxGraveStage;
		};

		Grave.prototype.getX = function () {
			return Math.round( this.x * stage.coef );
		};

		Grave.prototype.getWidth = function () {
			return Math.round( this.width * stage.coef );
		};

		Grave.prototype.render = function () {
			//stage.context.clearRect( this.x, ground.y, 10, 1 );
			stage.context.beginPath();
			stage.context.rect(this.getX() - this.getWidth() / maxGraveStage / 2 * this.stage, 412 * stage.coef, this.getWidth() / maxGraveStage * this.stage, 2 * stage.coef);
			stage.context.fillStyle = '#fff782';
			stage.context.fill();
			stage.context.closePath();
		};

		return Grave;

	})();

	Man = (function () {

		var Man = function ( sprite ) {

			this.sprite = sprite;
			this.tileIndex = 0;
			this.x = 0;
			this.y = 0;
			this.width = 18;
			this.height = 32;
			this.speed = 0;

		};

		Man.prototype.dig = function () {

			var grave = false,
				i;

			for ( i = graves.length - 1; i >= 0; i-- ) {
				if ( Math.round( graves[ i ].x - graveWidth ) < Math.round( this.x ) && Math.round( graves[ i ].x + graveWidth ) > Math.round( this.x ) )
					grave = i;
			}

			if ( grave === false )
				new Grave( this.x );
			else
				graves[ grave ].dig();

		};

		Man.prototype.drawTile = function ( index, x, y, width, height ) {
			stage.context.drawImage( this.sprite, 18 * index, 0, 18, 32, x, y, this.getWidth(), this.getHeight() );
		};

		Man.prototype.render = function () {
			if ( this.speed < 0 ) {
				stage.context.save();
				stage.context.translate(stage.width, 0);
				stage.context.scale( -1, 1 );
				this.drawTile( this.tileIndex, stage.width - this.getX() - 10 * stage.coef,  this.getY(), 18, 32 );
				stage.context.restore();
			} else {
				this.drawTile( this.tileIndex, this.getX() - 10 * stage.coef, this.getY(), 18, 32 );
			}
		};

		Man.prototype.getX = function () {
			return Math.round( this.x * stage.coef );
		};

		Man.prototype.getY = function () {
			return Math.round( this.y * stage.coef );
		};

		Man.prototype.getWidth = function () {
			return Math.round( this.width * stage.coef );
		};

		Man.prototype.getHeight = function () {
			return Math.round( this.height * stage.coef );
		};

		Man.prototype.setX = function ( value ) {

			this.x = value;

			if ( this.x > stage.defaultWidth - this.width / 2 )
				this.x = stage.defaultWidth - this.width / 2;

			if ( this.x < 42 )
				this.x = 42;

		};

		Man.prototype.setY = function ( value ) {
			this.y = value;
		};

		Man.prototype.update = function () {

			var friction = 0.15;

			if ( this.speed > 0 )
				this.speed -= friction;

			else if ( this.speed < 0 )
				this.speed += friction;

			if ( this.speed > 0 && this.speed - friction < 0 )
				this.speed = 0;

			else if ( this.speed < 0 && this.speed + friction > 0 )
				this.speed = 0;

			if ( this.speed == 0 )
				this.tileIndex = 0;

			this.setX( this.x - this.speed );

		};

		Man.prototype.influenceSpeed = function ( value ) {

			var max_speed = 4,
				min_speed = -4;

			this.speed += value;

			if ( this.speed > max_speed )
				this.speed = max_speed;

			if ( this.speed < min_speed )
				this.speed = min_speed;

		};

		return Man;

	})();

	Stage = (function () {

		var Stage = function ( canvas ) {

			this.canvas = canvas;
			this.context = this.canvas.getContext('2d');
			this.context.webkitImageSmoothingEnabled = false;
			this.context.mozImageSmoothingEnabled = false;
			this.context.imageSmoothingEnabled = false;
			this.children = [];
			this.defaultWidth = 800;

		};

		Stage.prototype.addChild = function ( child ) {
			this.children.push( child );
		};

		Stage.prototype.removeChild = function ( child ) {
			if ( this.children.indexOf( child ) !== -1 )
				this.children.splice( this.children.indexOf( child ), 1 );
		};

		Stage.prototype.render = function () {

			var i;

			this.context.clearRect( 0, 0, this.width, this.height );

			for ( i = 0; i < this.children.length; i++ ) {
				this.children[ i ].render();
			}

			requestAnimationFrame( stage.render.bind(this) );

		};

		Stage.prototype.resize = function () {

			this.width = document.body.offsetWidth;

			if ( this.width > 1280 )
				this.width = 1280;

			this.height = this.width / 16 * 9;

			this.canvas.width = this.width;
			this.canvas.height = this.height;
			this.coef = this.width / this.defaultWidth;

		};

		Stage.prototype.update = function () {

			var i;

			for ( i = this.children.length - 1; i >= 0; i-- ) {
				if ( this.children[ i ].update )
					this.children[ i ].update();
			}

		};

		return Stage;

	})();

	Rectangle = (function () {

		var Rectangle = function ( x, y, width, height ) {

			this.x = x;
			this.y = y;
			this.width = width;
			this.height = height;

		};

		Rectangle.prototype.getX = function () {
			return Math.round( this.x * stage.coef );
		};

		Rectangle.prototype.getY = function () {
			return Math.round( this.y * stage.coef );
		};

		Rectangle.prototype.getWidth = function () {
			return Math.round( this.width * stage.coef );
		};

		Rectangle.prototype.getHeight = function () {
			return Math.round( this.height * stage.coef );
		};

		Rectangle.prototype.render = function () {
			stage.context.beginPath();
			stage.context.rect( this.getX(), this.getY(), this.getWidth(), this.getHeight() );
			stage.context.fillStyle = '#1F0D0D';
			stage.context.fill();
			stage.context.closePath();
		};

		return Rectangle;

	})();

	Victim = (function () {

		var Victim = function ( power ) {

			this.arc = 0.0001;
			this.power = power;
			this.x = 0;
			this.y = 22;

			stage.addChild( this );
			victims.push( this );

			function walkingTimeout() {
				this.x += 1;
				if ( this.x > 21 ) {
					clearTimeout( this.timeout );
					this.aiming = true;
					this.timeout = setInterval(aimingTimeout.bind( this ), 100);
				}
			}

			function aimingTimeout() {
				console.log( this.arc, this.power );
				this.arc += 0.01;
				if ( this.arc > this.power ) {
					clearTimeout( this.timeout );
					this.aiming = false;
					this.fall();
				}
			}

			this.timeout = setInterval(walkingTimeout.bind( this ), 100);

		};

		Victim.prototype.getX = function () {
			return Math.round( this.x * stage.coef );
		};

		Victim.prototype.getY = function () {
			return Math.round( this.y * stage.coef );
		};

		Victim.prototype.fall = function () {
			console.log( 'fall' );
		};

		Victim.prototype.render = function () {
			stage.context.beginPath();
			stage.context.rect( this.getX(), this.getY(), 18, 32 );
			stage.context.fillStyle = 'red';
			stage.context.fill();
			stage.context.closePath();
			if ( this.aiming ) {
				stage.context.beginPath();
				stage.context.moveTo( this.getX(), this.getY() );
				stage.context.lineTo( stage.width * this.arc, 400 * stage.coef );
				stage.context.stroke();
				stage.context.closePath();
			}
		};

		return Victim;

	})();

	stage = new Stage( canvas );
	controls = new Controls();

	sprite = new Image();
	sprite.src = 'sprite.png';

	player = new Man( sprite );
	player.setX( 400 );
	player.setY( 380 );

	cliff = new Rectangle( 0, 40, 40, 400 );

	cliff.render = function () {

		var prev = 1,
			last = 10,
			i;

		stage.context.beginPath();
		stage.context.rect( this.getX(), this.getY(), this.getWidth(), this.getHeight() );
		stage.context.fillStyle = '#1F0D0D';
		stage.context.fill();
		stage.context.closePath();

		for ( i = 10; i >= 0; i-- ) {
			stage.context.clearRect( this.getX() + this.getWidth() - ( 11 - i ) * 2, this.getY() + prev, 2, stage.height );
			stage.context.clearRect( this.getX() + this.getWidth() - ( 11 - i ) * 2, this.getY() + last, 2, stage.height );
			prev = prev + last;
			last = prev + last;
		}
	};

	ground = new Rectangle( 0, 411, stage.defaultWidth, 39 );

	controls.addAction( 32, function () {
		player.dig();
	});

	controls.addAction( [ 37, 65 ], function () {
		player.influenceSpeed( 1 );
	});

	controls.addAction( [ 39, 68 ], function () {
		player.influenceSpeed( -1 );
	});

	stage.addChild( cliff );
	stage.addChild( ground );
	stage.addChild( player );

	stage.resize();

	function render () {
		stage.render();
	}

	sprite.addEventListener('load', render, false);

	window.addEventListener('resize', function () {
		stage.resize();
	}, false);

	document.addEventListener('keydown', function ( e ) {
		controls.press( e.which );
	}, false);

	document.addEventListener('keyup', function ( e ) {
		controls.release( e.which );
	}, false);

	setInterval(function () {
		if ( player.speed !== 0 ) {
			player.tileIndex += 1;
			if ( player.tileIndex > 6 )
				player.tileIndex = 1;
		}
	}, 100);

	setInterval( controls.react.bind( controls ), 50 );
	setInterval( stage.update.bind( stage ), 10 );
	new Victim( Math.random() );
//	setInterval(function () {
//		new Victim( Math.random() )
//	}, 3000 );

}, false);
