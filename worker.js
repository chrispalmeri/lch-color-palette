importScripts('vendor/chroma.js'); // FF has no 'import' still

function maxChroma(lightness, hue, min, max) {
	let unclipped = min || 0;
	let clipped = max || 100;
	let options = clipped - unclipped;

	if (options > 1) {
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
// also skip initializing levels if level slider didn't change
// etc
// maybe make config global for comparison

function run(config) {
	let levelStep = 100 / config.levels;
	let colorsStep = 360 / config.colors;

	let shift = Math.round((config.offset / 10) * (colorsStep / 2));

	let palette = [];
	let even = [];

	let levels = [];
	for (let i = 0; i < config.levels; i++) {
		let invert = config.levels - 1 - i;
		levels[invert] = Math.round(i * levelStep + levelStep / 2);
		even[invert] = 100;
	}

	let colors = [];
	for (let i = 0; i < config.colors; i++) {
		colors[i] = Math.round(i * colorsStep + colorsStep / 2 + shift);
	}

	for (let h = 0; h < config.colors; h++) {
		for (let l = 0; l < config.levels; l++) {
			let max = maxChroma(levels[l], colors[h]);
			if (max < even[l]) {
				even[l] = max;
			}
			palette.push({
				l: levels[l],
				c: max,
				h: colors[h],
				li: l
			});
		}
	}

	// should you curve light colors down toward overall average chroma?
	// could over chroma bias to bumping dark colors?
	// or can chroma be bumped more evenly, ignoring clipping?

	// apply the even chroma
	for (let i = 0; i < palette.length; i++) {
		let item = palette[i];
		let maxData = even[item.li];
		let adjustedChroma = maxData + (item.c - maxData) * (config.chroma / 10);

		palette[i].hex = chroma.lch(item.l, adjustedChroma, item.h).hex();
	}

	// add gray at the front
	for (let l = config.levels - 1; l >= 0; l--) {
		palette.unshift({
			l: levels[l],
			c: 0,
			h: 0,
			li: l,
			hex: chroma.lch(levels[l], 0, 0).hex() // could make it slightly blue
		});
	}

	return palette;
}

self.addEventListener('message', function (e) {
	let calc = run(e.data);

	postMessage({
		colors: calc,
		config: e.data
	});
});
