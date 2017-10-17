class ColorWheel {

	constructor ( options ) {
		this.contrastTreshold = 4.0;
		this.el = options.el;
		this.radius = options.radius;
		this.initCanvas();
	}

	initCanvas () {
		this.canvas = document.createElement('canvas');
		this.context = this.canvas.getContext ('2d');
		this.canvas.width = this.radius*2;
		this.canvas.height = this.radius*2;
		this.context.translate(this.radius, this.radius);
	}

	render () {
		this.el.append(this.canvas);
		this.drawColorWheel();
	}

	drawColorWheel ( compareColor, L ) {
		for ( let angle of Array(360).keys() ) {
			
			const startAngle = (angle-2) * Math.PI / 180;
			const endAngle = angle * Math.PI / 180;

			this.context.beginPath ();
			this.context.moveTo(0, 0);
			this.context.arc(0, 0, this.radius, startAngle, endAngle, false);
			this.context.closePath();

			const edgeCoordinates = this.calculateCoordinates(angle, this.radius);
			const gradient = this.context.createLinearGradient(0, 0, edgeCoordinates.x, edgeCoordinates.y);

			gradient.addColorStop(0, 'hsl(' + angle + ', 0%, 50%)');
			gradient.addColorStop(1, 'hsl(' + angle + ', 100%, 50%)');

			this.context.fillStyle = gradient;
			this.context.fill();
		}
	}

	calculateCoordinates ( angle, r ) {
		const radians = angle * Math.PI/180;
		const x = Math.round( (r * Math.cos(radians)) );
		const y = Math.round( (r * Math.sin(radians)) );
		return { x, y };
	}
}
