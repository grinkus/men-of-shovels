window.addEventListener('load', function () {

	var canvas = document.getElementsByTagName('canvas')[0],
		Stage,
		stage;

	Stage = (function () {

		var Stage = function ( canvas ) {

			this.canvas = canvas;

		};

		Stage.prototype.resize = function () {

			this.width = document.body.offsetWidth;

			if ( this.width > 1280 )
				this.width = 1280;

			this.height = this.width / 16 * 9;

			this.canvas.width = this.width;
			this.canvas.height = this.height;

		};

		return Stage;

	})();

	stage = new Stage( canvas );

	stage.resize();

	window.addEventListener('resize', function () {
		stage.resize();
	}, false);

}, false);
