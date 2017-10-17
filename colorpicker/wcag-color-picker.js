class WCAGColorPicker {

	constructor ( options ) {
		this.el = options.el;
		this.backgroundColorPicker = this.createColorPicker(options.radius);
	}

	createColorPicker (radius) {
		const el = document.createElement('div');
		el.classList.add('colorPicker');
		this.el.append(el);
		return new ColorPicker({
			el,
			radius
		});
	}

	render () {
		this.backgroundColorPicker.render();

	}

}