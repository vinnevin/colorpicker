class ColorPicker {

	constructor ( options ) {
		this.el = (options.el) ? options.el : document.querySelector(options.selector);
		this.backgroundColorWheel = new ColorWheel(this.addColorWheelDiv('background-color-wheel'), options.radius);
		this.textColorWheel = new ColorWheel(this.addColorWheelDiv('text-color-wheel'), options.radius);
	}

	render () {
		this.backgroundColorWheel.render();
		this.textColorWheel.render();
	}

	addColorWheelDiv ( divId ) {
		const div = document.createElement('div');
		div.id = divId;
		this.el.append(div);
		return div;
	}

}

class ColorWheel {

	constructor ( el, radius ) {
		this.contrastTreshold = 4.0;
		this.el = el;
		this.radius = radius;
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
		this.el.appendChild(this.canvas);
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

			if (!compareColor || !L) {
				gradient.addColorStop(0, Color.fromHSL(angle, 0, 50).RGB.toString());
				gradient.addColorStop(1, Color.fromHSL(angle, 100, 50).RGB.toString());
			} else {
				const maxS = this.calculateUpperSaturationTreshold(angle, L, compareColor);



				// Find minimum S
				const minS = this.calculateLowerSaturationTreshold(angle, L, compareColor);

				// Set start gradient color and position
				if ( minS > 0 ) {
					gradient.addColorStop ( 0, 'hsl(0, 100%, 100%)' );
					if ( minS > 1 )
						gradient.addColorStop ( (minS/100), 'hsl(0, 100%, 100%)' );
					gradient.addColorStop ( (minL/100), 'hsl('+angle+', '+this.colorPicker.colorValues.S+'%, ' + minL + '%)' );
				} else {
					gradient.addColorStop ( 0, 'hsl('+angle+', '+this.colorPicker.colorValues.S+'%, 0%)' );
				}

				// Find max L
				var maxL = findUpperLuminanceTreshold ( HSL, angle, settings.contrastTreshold );

				// Set stop gradient color and position
				gradient.addColorStop ( (maxL/100), 'hsl('+angle+', '+this.colorPicker.colorValues.S+'%, ' + maxL + '%)' );
				if ( maxL < 100 ) {
					if ( maxL < 99 )
						gradient.addColorStop ( (maxL/100), 'hsl(0, 100%, 100%)' );
					gradient.addColorStop ( 1, 'hsl(0, 100%, 100%)' );
				}





			}

			this.context.fillStyle = gradient;
			this.context.fill();
		}
	}

	calculateLowerSaturationTreshold ( H, L, compareColor ) {
		const compareLum = compareColor.calculateLuminance();
		for ( S = 0; S <= 100; S++ ) {
			const lum = Color.fromHSL(H, S, L).calculateLuminance();
			const contrastRatio = this.calculateContrastRatio(lum1, compareLum);
			if ( contrastRatio >= this.contrastTreshold ) {
				return S;
			}
		}

	}

	calculateUpperSaturationTreshold ( H, L, compareColor ) {
		const compareLum = compareColor.calculateLuminance();
		for ( S = 100; S >= 0; S-- ) {
			const lum = Color.fromHSL(H, S, L).calculateLuminance();
			const contrastRatio = this.calculateContrastRatio(lum1, compareLum);
			if ( contrastRatio <= this.contrastTreshold ) {
				return S;
			}
		}

	}

	calculateContrastRatio ( lum1, lum2 ) {
		return ( lum1 > lum2 )? (lum1 + 0.05)/(lum2 + 0.05) : (lum2 + 0.05)/(lum1 + 0.05);
	}

	calculateCoordinates ( angle, r ) {
		const radians = angle * Math.PI/180;
		const x = Math.round( (r * Math.cos(radians)) );
		const y = Math.round( (r * Math.sin(radians)) );
		return { x, y };
	}

	getDistanceFromCenter ( x, y ) {
		return Math.sqrt( Math.pow(x, 2) + Math.pow(y, 2) );
	}

}

class Color {
	static fromRGB ( r, g, b ) {
		this.RGB = new RGB(r, g, b);
		this.HSL = this.RGB.toHSL();
		return this;
	}

	static fromHSL ( h, s, l ) {
		this.HSL = new HSL(h, s, l);
		this.RGB = this.HSL.toRGB();
		return this;
	}

	calculateLuminance () {
		const a = [this.RGB.R, this.RGB.G, this.RGB.B].map (( v ) => {
			v /= 255;
			return ( v <= 0.03928 ) ? v / 12.92 : Math.pow( ((v+0.055)/1.055), 2.4 );
		});
		return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
	}
}

class RGB {
	
	constructor ( r, g, b ) {
		this.R = r;
		this.G = g;
		this.B = b;
	}

	toHSL () {
		const r = this.R / 255;
		const g = this.G / 255;
		const b = this.B / 255;

		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);

		let h, s, l = (max + min) / 2;

		if ( max === min ) {
			h = s = 0; // achromatic
		} else {
			let d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch (max) {
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h /= 6;
		}
		
		return new HSL ( h, s, l );
	}
	
	calculateLuminance () {
		const a = [this.R, this.G, this.B].map (( v ) => {
			v /= 255;
			return ( v <= 0.03928 ) ? v / 12.92 : Math.pow( ((v+0.055)/1.055), 2.4 );
		});
		return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
	}

	toString () {
		return `rgb(${this.R}, ${this.G}, ${this.B})`;
	}

	toArray () {
		return [this.R, this.G, this.B];
	}
}

class HSL {

	constructor ( h, s, l ) {
		this.H = h;
		this.S = s;
		this.L = l;
	}

	toRGB () {
		let r, g, b;
		
		const h = Math.round(this.H/3.6) / 100;
		const s = this.S / 100;
		const l = this.L / 100;
		
		if ( s == 0 ) {
			r = g = b = l; // achromatic
		} else {
			function hue2rgb ( p, q, t ) {
				if ( t < 0 ) t += 1;
				if ( t > 1 ) t -= 1;
				if ( t < 1/6 ) return p + (q - p) * 6 * t;
				if ( t < 1/2 ) return q;
				if ( t < 2/3 ) return p + (q - p) * (2/3 - t) * 6;
				return p;
			}
			var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			var p = 2 * l - q;
			r = hue2rgb ( p, q, h + 1/3 );
			g = hue2rgb ( p, q, h );
			b = hue2rgb ( p, q, h - 1/3 );
		}
		return new RGB ( Math.round(r * 255), Math.round(g * 255), Math.round(b * 255) );
	}

	toString () {
		return `hsl(${this.H}, ${this.S}%, ${this.L}%)`;
	}

	toArray () {
		return [this.H, this.S, this.L];
	}

}

class Coordinates {

	constructor ( x = 0, y = 0 ) {
		this.x = x;
		this.y = y;
	}

	calculateCoordinates ( angle, r ) {
		const radians = angle * Math.PI/180;
		this.x = Math.round( (r * Math.cos(radians)) );
		this.y = Math.round( (r * Math.sin(radians)) );
	}

	getDistanceFromCenter () {
		return Math.sqrt( Math.pow(this.x, 2) + Math.pow(this.y, 2) );
	}

}
