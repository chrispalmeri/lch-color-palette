importScripts('https://cdnjs.cloudflare.com/ajax/libs/chroma-js/2.0.3/chroma.min.js'); // FF has no 'import' still

function maxChroma(lightness, hue, min, max) {
	let unclipped = min || 0;
	let clipped = max || 100;
	let options = clipped - unclipped;

	if(options > 1) {
		let testChroma = Math.round((clipped + unclipped) / 2);
		let color = chroma.lch(lightness, testChroma, hue);

		if (color.clipped()) {
			clipped = testChroma;
		} else {
			unclipped = testChroma;
		}

		return maxChroma(lightness, hue, unclipped, clipped);
	} else {
		return unclipped;
	}
}

// should skip to the chroma step if only the chroma slider changes
// also skip initializing shades if level slider didn't change
// etc

function run(config) {
	let shadeStep = 100 / config.shades;
	let colorsStep = 360 / config.colors;

	let shift = Math.round((config.offset / 10) * (colorsStep / 2));

	let palette = [];
	let even = [];

	let shades = [];
	for (let i = 0; i < config.shades; i++) {
		let invert = (config.shades - 1) - i;
		shades[invert] = Math.round(i * shadeStep + shadeStep / 2);
		even[invert] = 100;
	}

	let colors = [];
	for (let i = 0; i < config.colors; i++) {
		colors[i] = Math.round(i * colorsStep + colorsStep / 2 + shift);
	}

	for (let h = 0; h < config.colors; h++) {
		for (let l = 0; l < config.shades; l++) {
			let max = maxChroma(shades[l], colors[h]);
			if(max < even[l]) {
				even[l] = max;
			}
			palette.push({
				l: shades[l],
				c: max,
				h: colors[h],
				li: l
			});
		}
	}

	// apply the even chroma
	for (let i = 0; i < palette.length; i++) {
		let item = palette[i];
		let maxData = even[item.li];
		let adjustedChroma = maxData + (item.c - maxData) * (config.chroma / 10);

		palette[i].hex = chroma.lch(item.l, adjustedChroma, item.h).hex();
	}
	
	// add gray at the front
	for (let l = config.shades - 1; l >= 0; l--) {
		palette.unshift({
			l: shades[l],
			c: 0,
			h: 0,
			li: l,
			hex: chroma.lch(shades[l], 0, 0).hex() // could make it slightly blue
		});
	}

	return palette;
}

self.addEventListener("message", function(e) {
	let calc = run(e.data);

	postMessage({
		calc: calc,
		config: e.data // not used yet but could be instead of ducument values
	});
});
