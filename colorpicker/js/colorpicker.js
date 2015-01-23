//var Byte = Byte || {};

var ColorContrastPicker = Class.extend({
	init: function ( options, element ) {
		this.backgroundColorPicker = null;
		this.textColorPicker = null;
	},

	calculateContrast: function () {
		
	}
});

var ColorPicker = Class.extend({
	init: function( options, element ){
		this.options = $.extend(this.options, options);
		this.container = $(element);
		this.colorWheel = $(this.container.find('.colorWheel:first'));
		this.satSlider = $(this.container.find('.saturationSlider .slider:first'));
		this.sliderWidth = $(this.container.find('.saturationSlider:first')).width() - this.satSlider.width();
		this.radius = (this.colorWheel.width()-(this.colorWheel.find('.cross:first').width()/2))/2;
		this.target = $(this.container.attr('data-target'));
		this.targetAdjust = this.container.attr('data-target-adjust');
		this.hInput = $(this.container.find('input[name=h]:first'));
		this.sInput = $(this.container.find('input[name=s]:first'));
		this.lInput = $(this.container.find('input[name=l]:first'));
		_this = this;
		$(this.colorWheel).find('.cross:first').draggable({
			drag: $.proxy(_this, 'dragCross')
		});
		this.satSlider.draggable({
			containment: 'parent',
			axis: 'x',
			drag: $.proxy(_this, 'dragSlider')
		});
		this.updateTarget();
	},
	
	dragCross: function ( event, ui ) {
		var result = this.limit(ui.position.left, ui.position.top, this.radius, this.radius);
		if ( result.limit ) {
			ui.position.top = result.x + "px";
			ui.position.left = result.y + "px";
		} else {
			var deg = this.positionToDegrees(result.x, result.y);
			var dis = this.distanceFromCenter(result.x, result.y);
			var h = Math.round(deg/3.6)/100;
			var l = 1 - Math.round(((dis)*100)/this.radius)/100;
			this.hInput.val(h);
			this.lInput.val(l);
			this.updateTarget();
		}
	},
	
	dragSlider: function ( event, ui ) {
		var s = Math.round((ui.position.left*100)/(this.sliderWidth))/100;
		this.sInput.val(s);
		this.updateTarget();
	},
	
	limit: function ( x, y, x1, y1 ) {
		var dist = this.distance([x, y], [x1, y1]);
		if ( dist <= this.radius ) {
			return {x: x, y: y};
		} else {
			return {limit: true, x: x, y: y};
		}
	},
	
	distance: function ( dot1, dot2 ) {
		var	x1 = dot1[0], y1 = dot1[1], x2 = dot2[0], y2 = dot2[1];
		return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
	},
	
	hslToRgb: function ( h, s, l ) {
		var r, g, b;
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
			r = hue2rgb(p, q, h + 1/3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1/3);
		}
		return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	},
	
	positionToDegrees: function ( x, y ) {
		x -= this.radius; y -= this.radius;
		var theta = Math.atan2(-y, x);
		if ( theta < 0 ) theta += 2 * Math.PI;
		return Math.round(theta * (180 / Math.PI));
	},

	distanceFromCenter: function ( x, y ) {
		x -= this.radius;
		y -= this.radius;
		return Math.sqrt((x*x) + (y*y))
	},

	luminance: function () {
		var h = parseFloat(this.hInput.val());
		var s = parseFloat(this.sInput.val());
		var l = parseFloat(this.lInput.val());
		var rgb = this.hslToRgb(h,s,l);
		var a = rgb.map(function(v) {
			v /= 255;
			return (v <= 0.03928) ? v / 12.92 : Math.pow( ((v+0.055)/1.055), 2.4 );
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
	},

	updateTarget: function () {
		var h = parseFloat(this.hInput.val());
		var s = parseFloat(this.sInput.val());
		var l = parseFloat(this.lInput.val());
		var rgb = this.hslToRgb(h,s,l);
		$(this.target).css(this.targetAdjust, 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')');
	}
});

$.plugin('colorpicker', ColorPicker);

$('.colorpicker').colorpicker();
