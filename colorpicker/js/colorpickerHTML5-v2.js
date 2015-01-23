var WCAGColorPicker = function ( options ) {
	
	var settings = {
		id: 'wcag-color-picker',
		foregroundColorPicker: {
			id: 'foreground-color-picker'
		},
		backgroundColorPicker: {
			id: 'background-color-picker'
		}
	}
	
	this.construct = function ( options ) {
		$.extend(settings, options);

		this.container = $(settings.container);
		
		this.backgroundPicker = new ColorPicker(settings.colorPicker, 'backgroundPicker', this);
		this.backgroundPicker.container.appendTo(this.container);
		
		this.foregroundPicker = new ColorPicker(settings.colorPicker, 'foregroundPicker', this);
		this.foregroundPicker.container.appendTo(this.container);
		
		this.colorDisplayContainer = $('<div>').addClass('colorDisplayContainer').html('<p>Text</p>');
		this.colorDisplayContainer.appendTo(this.container);
	}
	
	this.init = function () {
		this.backgroundPicker.init();
		this.foregroundPicker.init();
	}
/*
	this.saturationChanged = function ( value, pickerId ) {
		if ( pickerId == 'backgroundPicker' ) {
			this.foregroundPicker.siblingSaturationChanged(value)
		} else {
			this.backgroundPicker.siblingSaturationChanged(value)
		}
	}
*/
	this.getSiblingColorValues = function ( pickerId ) {
		if ( pickerId == 'backgroundPicker' ) {
			return this.foregroundPicker.colorValues;
		} else {
			return this.backgroundPicker.colorValues;
		}
	}

	this.colorChanged = function ( pickerId, colorValues ) {
		if ( pickerId == 'backgroundPicker' ) {
			return this.foregroundPicker.siblingColorChanged(colorValues);
		} else {
			return this.backgroundPicker.siblingColorChanged(colorValues);
		}
	}
	
	this.construct(options);
	this.init();

};

var ColorPicker = function ( options, id, parent ) {
	
	var settings = {
		
	}

	this.colorValues = {
		H: 100,
		S: 100,
		L: 50
	}
	
	this.construct = function ( options, id, parent ) {
		$.extend(settings, options);

		this.id = id;
		this.root = parent;

		if ( options.color ) {
			this.colorValues = options.color;
		}
		
		this.container = $('<div>').addClass('colorPickerContainer').addClass('clearfix');
		this.colorWheel = new ColorWheel(settings.colorWheel, this);
		this.colorWheel.container.appendTo(this.container);
		
		this.saturationSlider = new SaturationSlider({}, this);
		this.saturationSlider.container.appendTo(this.container);
		
		this.colorInfoContainer = $('<div>').addClass('colorInfoContainer');
		this.rgbValueTag = $('<p>').text('RGB: rgb(0,0,0)');
		this.hslValueTag = $('<p>').text('HSL: hsl(0,0,0)');
		this.colorInfoContainer.append(this.rgbValueTag);
		this.colorInfoContainer.append(this.hslValueTag);

		this.colorInfoContainer.appendTo(this.container);
	}
	
	this.init = function () {
		this.colorWheel.init();
		this.saturationSlider.init();
	}
	
	this.saturationChanged = function ( saturation ) {
		this.colorValues.S = saturation;
		var siblingColorValues = this.root.getSiblingColorValues(this.id);
		this.colorWheel.drawRestricted(siblingColorValues);
		this.updateColorInfo();
		this.root.colorChanged(this.id, this.colorValues);
	}

	this.hueAndLuminanceChanged = function ( hue, luminance ) {
		this.colorValues.H = hue;
		this.colorValues.L = luminance;
		this.updateColorInfo();
		this.root.colorChanged(this.id, this.colorValues);
	}

	this.updateColorInfo = function () {
		this.hslValueTag.text('H:'+this.colorValues.H+' S:'+this.colorValues.S+' L:'+this.colorValues.L);
	}

	this.siblingColorChanged = function ( colorValues ) {
		this.colorWheel.drawRestricted(colorValues);
	}

	this.getSiblingColorValues = function () {
		return this.root.getSiblingColorValues(this.id);
	}

	this.construct(options, id, parent);
};

var SaturationSlider = function ( options, colorPicker ) {
	
	var settings = {
		
	}
	
	this.construct = function ( options, colorPicker ) {
		$.extend(settings, options);
		
		this.colorPicker = colorPicker;

		this.container = $('<div>').addClass('saturationSliderContainer');
		this.valueDisplay = $('<div>').addClass('saturationValue').text('100');
		this.valueDisplay.appendTo(this.container);
		this.slider = $('<div>').addClass('saturationSlider');
		this.slider.appendTo(this.container);
				
		var _that = this;
		
		this.slider.slider({
			orientation: 'vertical',
			range: 'min',
			min: 0,
			max: 100,
			value: this.colorPicker.colorValues.S,
			slide: function( event, ui ) {
				_that.updateValue(ui.value);
			}
		});
	}
	
	this.init = function () {
		this.container.height(this.container.parent().innerHeight() + 'px');
	}
	
	this.updateValue = function ( value ) {
		this.valueDisplay.text(value);
		this.colorPicker.saturationChanged(value);
	}
	
	this.construct(options, colorPicker);
}

var ColorWheel = function ( options, colorPicker ) {
	
	var settings = {
		radius: 250,
		outline: {
			width: 1,
			color: 'black'
		},
		contrastTreshold: 4.0
	};

	this.construct = function ( options, colorPicker ) {
		$.extend(settings, options);
		this.colorPicker = colorPicker;

		this.container = $('<div>').addClass('colorWheelContainer');
		this.addMarker();
		this.canvas = $('<canvas>');
		this.canvas.appendTo(this.container);
		this.context = this.canvas[0].getContext ('2d');
		this.initCanvas();
		this.drawOutline();
	}

	this.init = function () {
		this.drawRestricted(this.colorPicker.getSiblingColorValues());
	}

	this.addMarker = function () {
		this.marker = $('<div>').addClass('marker');
		this.marker.appendTo(this.container);
		this.marker.css({top: settings.radius, left: settings.radius});
		var _that = this;
		this.marker.draggable({
			drag: function ( event, ui ) {
				var radius = settings.radius;

				var left = parseInt(_that.marker.css('left'));
				var top = parseInt(_that.marker.css('top'));

				var x = left - radius;
				var y = top - radius;

				var maxX = Math.round(Math.sqrt((radius*radius)-(y*y)));
				var maxY = Math.round(Math.sqrt((radius*radius)-(x*x)));

				if ( ui.position.left > maxX+radius ) {
					ui.position.left = maxX+radius;
				}
				if ( ui.position.top > maxY+radius ) {
					ui.position.top = maxY+radius;
				}
				if ( ui.position.left < (0-maxX+radius) ) {
					ui.position.left = 0-maxX+radius;
				}
				if ( ui.position.top < (0-maxY+radius) ) {
					ui.position.top = 0-maxY+radius;
				}

				var H = Math.round((Math.atan2(y,x)*360)/(2*Math.PI));
				if ( H < 0 ) {
					H += 360;
				}
				var L = Math.round((distanceFromCenter(x,y,radius)/radius)*100);

				_that.colorPicker.hueAndLuminanceChanged(H,L);
			}
		});
	}
	this.initCanvas = function () {
		var radius = settings.radius;
		this.canvas[0].width = radius*2;
		this.canvas[0].height = radius*2;
		this.context.translate ( radius, radius );
	}

	this.drawOutline = function () {
		this.context.arc ( 0, 0, settings.radius, 0, 360, false );
		this.context.lineWidth = settings.outline.width;
		this.context.strokeStyle = settings.outline.color;
		this.context.stroke();
	}

	this.drawRestricted = function ( HSL ) {
		for ( var angle = 0; angle <= 360; angle++ ) {
			var startAngle = (angle-2) * Math.PI / 180;
			var endAngle = angle * Math.PI / 180;

			this.context.beginPath ();
			this.context.moveTo ( 0, 0 );
			this.context.arc ( 0, 0, settings.radius, startAngle, endAngle, false );
			this.context.closePath ();

			var edgeCoordinates = calculateCoordinates ( angle, settings.radius );
			var gradient = this.context.createLinearGradient ( 0, 0, edgeCoordinates.x, edgeCoordinates.y );

			// Find minimum L
			var minL = findLowerLuminanceTreshold ( HSL, angle, settings.contrastTreshold );

			// Set start gradient color and position
			if ( minL > 0 ) {
				gradient.addColorStop ( 0, 'hsl(0, 100%, 100%)' );
				if ( minL > 1 )
					gradient.addColorStop ( (minL/100), 'hsl(0, 100%, 100%)' );
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


			this.context.fillStyle = gradient;
			this.context.fill();
		}
	}

	this.calculateCoordinates = function ( angle, distanceFromCenter ) {
		angle = angle * Math.PI/180;
		x = Math.round( (distanceFromCenter * Math.cos(angle)) );
		y = Math.round( (distanceFromCenter * Math.sin(angle)) );
		return {'x': x, 'y': y, 'distance': distanceFromCenter};
	}

	this.construct(options, colorPicker);
};

/////////////////  Math functions and such TODO: move


function distanceFromCenter ( x, y, radius ) {
	x -= radius;
	y -= radius;
	return Math.sqrt((x*x) + (y*y))
}

function hslToRgb ( HSL ) {
	var r, g, b;
	var h = Math.round(HSL.H/3.6) / 100;
	var s = HSL.S / 100;
	var l = HSL.L / 100;
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
}

function calculateLuminance ( HSL ) {
	var RGB = hslToRgb ( HSL );
	var a = RGB.map ( function ( v ) {
		v /= 255;
		return ( v <= 0.03928 ) ? v / 12.92 : Math.pow( ((v+0.055)/1.055), 2.4 );
	});
	return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function calculateContrastRatio ( lum1, lum2 ) {
	return ( lum1 > lum2 )? (lum1 + 0.05)/(lum2 + 0.05) : (lum2 + 0.05)/(lum1 + 0.05);
}

function calculateCoordinates ( angle, distanceFromCenter ) {
	angle = angle * Math.PI/180;
	x = Math.round( (distanceFromCenter * Math.cos(angle)) );
	y = Math.round( (distanceFromCenter * Math.sin(angle)) );
	return {'x': x, 'y': y, 'distance': distanceFromCenter};
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
