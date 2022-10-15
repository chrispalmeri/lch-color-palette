importScripts('https://cdnjs.cloudflare.com/ajax/libs/chroma-js/2.0.3/chroma.min.js'); // FF has no 'import' still

function maxChroma(lightness, hue, min, max) {
	let unclipped = min || 0;
	let clipped = max || 100;
	let options = clipped - unclipped;

	if(options > 1) {
		let testChroma = Math.round((clipped + unclipped) / 2);
		let color = chroma.lch(99-lightness, testChroma, hue); // invert lightness

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

function run() {
	let progress = 0;

	let palette = [];
	let even = [];
	let shades = Array.from({length: 100}, (v, i) => i);
	let colors = Array.from({length: 360}, (v, i) => i);

	for (let l = 0; l < shades.length; l++) {
		even[l] = 100;

		for (let h = 0; h < colors.length; h++) {
			let max =  maxChroma(l, h);
			if(max < even[l]) {
				even[l] = max;
			}
			palette.push({
				l: l,
				c: max,
				h: h,
			});
		}

		progress = progress + 1;
		postMessage(progress / 100);
		//console.log(progress / 100);
	}

	return { palette: palette, even: even};
}

// return a table of actual colors

let out = run();

for (let i = 0; i < out.palette.length; i++) {
	// use the average chroma instead
	// or increase percentage
	out.palette[i].hex = chroma.lch(99-out.palette[i].l, out.even[out.palette[i].l], out.palette[i].h).hex();
}

postMessage({
	success: true,
	data: out
});
