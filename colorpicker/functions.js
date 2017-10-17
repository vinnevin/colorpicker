function getDistanceFromCenter ( x, y ) {
	return Math.sqrt( Math.pow(x, 2) + Math.pow(y, 2) );
}

function calculateCoordinates ( angle, r ) {
	const radians = angle * Math.PI/180;
	return {
		x: Math.round( (r * Math.cos(radians)) ),
		y: Math.round( (r * Math.sin(radians)) )
	};
}

function hslToRgb ( h, s, l ) {
	let r, g, b;
	
	const h = Math.round(h/3.6) / 100;
	const s = s / 100;
	const l = l / 100;
	
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
	return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];

	return {
		r,
		g,
		b
	}
}

function rgbToHsl ( r, g, b ) {
	r /= 255;
	g /= 255;
	b /= 255;

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
	return { h, s, l };
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
}

class HSL {

	constructor ( h, s, l ) {
		this.H = h;
		this.S = s;
		this.L = l;
	}

	toRGB () {
		let r, g, b;
		
		const h = Math.round(h/3.6) / 100;
		const s = s / 100;
		const l = l / 100;
		
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

}

class Circle {

	constructor () {

	}

	getDistanceFromCenter ( x, y ) {
		return Math.sqrt( Math.pow(x, 2) + Math.pow(y, 2) );
	}

	calculateCoordinates ( angle, r ) {
		const radians = angle * Math.PI/180;
		const x = Math.round( (r * Math.cos(radians)) );
		const y = Math.round( (r * Math.sin(radians)) );
		return new Coordinates ( x, y );
	}

}

class Coordinates {

	constructor ( x, y ) {
		this.x = x;
		this.y = y;
	}
	
}

function calculateContrastRatio ( lum1, lum2 ) {
	return ( lum1 > lum2 )? (lum1 + 0.05)/(lum2 + 0.05) : (lum2 + 0.05)/(lum1 + 0.05);
}

function calculateLuminance ( HSL ) {
	var RGB = hslToRgb ( HSL );
	var a = RGB.map ( function ( v ) {
		v /= 255;
		return ( v <= 0.03928 ) ? v / 12.92 : Math.pow( ((v+0.055)/1.055), 2.4 );
	});
	return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function findUpperLuminanceTreshold ( HSL, angle, contrastTreshold ) {
	var luminance = calculateLuminance ( HSL );

	var H = angle;
	var S = HSL.S;
	var L = 0;

	for ( L = 0; L <= 100; L++ ) {
		var luminance2 = calculateLuminance ( { H: angle, S: S, L: L} );
		var contrastRatio = calculateContrastRatio(luminance, luminance2);
		if ( contrastRatio > contrastTreshold ) {
			return L;
		}
	}
	if ( L > 100 ) L = 100;
	return L;
}

function findLowerLuminanceTreshold ( HSL, angle, contrastTreshold ) {
	var luminance = calculateLuminance ( HSL );

	var H = angle;
	var S = HSL.S;
	var L = 100;

	for ( L = 100; L >= 0; L-- ) {
		var luminance2 = calculateLuminance ( { H: angle, S: S , L: L} );
		var contrastRatio = calculateContrastRatio(luminance, luminance2);
		if ( contrastRatio > contrastTreshold ) {
			return L;
		}
	}
	if ( L < 0 ) L = 0;
	return L;
}

function getMousePosition ( canvas, event, radius ) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: event.clientX - rect.left - radius,
		y: event.clientY - rect.top - radius
	};
}