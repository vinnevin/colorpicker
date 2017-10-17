class ColorPicker {

	constructor ( options ) {
		this.el = options.el;
		this.colorWheel = this.createColorWheel(options.radius);
		this.slider = this.createSlider();
	}

	createColorWheel (radius) {
		const el = document.createElement('div');
		el.classList.add('colorWheel');
		this.el.append(el);
		return new ColorWheel({
			el,
			radius
		});
	}

	createSlider () {
		const el = document.createElement('div');
		this.el.append(el);
		el.classList.add('slider');
		return new Slider({
			el
		});
	}

	render () {
		this.colorWheel.render();
		//this.slider.render();
	}

	addColorWheelDiv ( divId ) {
		const div = document.createElement('div');
		div.id = divId;
		this.el.append(div);
		return div;
	}

}
