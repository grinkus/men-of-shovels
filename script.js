window.addEventListener('load', function () {
	'use strict';

	var canvas = document.getElementsByTagName('canvas')[0],
		Controls,
		controls,
		Stage,
		stage,
		Man,
		player,
		sprite;

	Controls = (function () {

		var Controls = function () {
			this.actions = {};
			this.pressed = [];
		};

		Controls.prototype.addAction = function ( key, action ) {
			this.actions[ key ] = this.actions[ key ] || [];
			this.actions[ key ].push( action );
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
					if ( this.pressed.indexOf( parseInt( key ) ) >= 0 ) {
						for ( i = this.actions[ key ].length - 1; i >= 0; i-- ) {
							this.actions[ key ][ i ]();
						}
					}
				}
			}

		};

		Controls.prototype.release = function ( value ) {
			if ( this.pressed.indexOf( value ) >= 0 )
				this.pressed.splice( this.pressed.indexOf( value ), 1 );
		};

		return Controls;

	})();

	Man = (function () {

		var Man = function ( sprite ) {

			this.sprite = sprite;
			this.tileIndex = 0;
			this.x = 0;
			this.y = 0;
			this.width = 18;
			this.height = 32;

		};

		Man.prototype.drawTile = function ( index, x, y, width, height ) {
			stage.context.drawImage( this.sprite, 18 * index, 0, 18, 32, this.getX(), this.getY(), this.getWidth(), this.getHeight() );
		};

		Man.prototype.render = function () {
			this.drawTile( this.tileIndex, this.getX(), this.getY(), 18, 32 );
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
		};

		Man.prototype.setY = function ( value ) {
			this.y = value;
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

		Stage.prototype.render = function () {

			var i;

			this.context.clearRect( 0, 0, this.width, this.height );

			for ( i = this.children.length - 1; i >= 0; i-- ) {
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

		return Stage;

	})();

	stage = new Stage( canvas );
	controls = new Controls();

	sprite = new Image();
	sprite.src = 'sprite.png';

	player = new Man( sprite );
	player.setX( 400 );
	player.setY( 380 );

	controls.addAction( 37, function () {
		player.setX( player.x - 2 );
	});

	controls.addAction( 39, function () {
		player.setX( player.x + 2 );
	});

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

	setInterval( controls.react.bind( controls ), 50 );

}, false);
