// import './vendor/chroma.js';

let myWorker, workerData;

// some function to retrieve closest names based on hue
// and maybe combine them for in between
// you should make a longer list, these are the main six
/*let names = [
	'red',
	'yellow',
	'green',
	'cyan',
	'blue',
	'magenta'
];*/

function downloadCss(e) {
	e.preventDefault();

	let styleSheet = new CSSStyleSheet();
	styleSheet.insertRule(':root {}');

	for (let i = 0; i < workerData.colors.length; i++) {
		let finalColor = workerData.colors[i].hex;
		let levelIndex = i % workerData.config.levels;
		let colorIndex = Math.floor(i / workerData.config.levels);

		styleSheet.cssRules[0].style.setProperty(`--color${colorIndex}-${100 * (levelIndex + 1)}`, finalColor);
	}

	let cssText = styleSheet.cssRules[0].cssText;
	let cssFormatted = cssText.replace(/([;{])\s?/g, '$1\n\t').replace('\t}', '}\n');

	let comment = '/**\n * https://chrispalmeri.github.io/lch-color-palette/\n *\n';
	comment += ' * colors: ' + workerData.config.colors + '\n';
	comment += ' * levels: ' + workerData.config.levels + '\n';
	comment += ' * chroma: ' + workerData.config.chroma + '\n';
	comment += ' * offset: ' + workerData.config.offset + '\n';
	comment += ' */\n\n';

	let link = document.createElement('a');
	link.setAttribute('href', 'data:text/css;charset=utf-8,' + encodeURIComponent(comment + cssFormatted));
	link.setAttribute('download', 'colors.css');
	link.click();
}

function showColors() {
	let swatches = document.getElementById('swatches');
	swatches.innerHTML = '';

	// intentionally skips gray to be consistent with slider
	// gray still included in css though
	for (let i = workerData.config.levels; i < workerData.colors.length; i++) {
		let finalColor = workerData.colors[i].hex;
		let levelIndex = i % workerData.config.levels;
		let colorIndex = Math.floor(i / workerData.config.levels);

		let swatch = document.createElement('div');
		swatch.style.background = finalColor;
		swatch.title = finalColor;
		swatch.addEventListener('click', () => {
			navigator.clipboard.writeText(finalColor);
		});
		swatch.style.gridRow = levelIndex + 1;
		swatch.style.gridColumn = colorIndex;
		swatches.appendChild(swatch);
	}
}

function startWorker() {
	if (typeof myWorker === 'undefined') {
		myWorker = new Worker('worker.js');

		myWorker.addEventListener('message', function (event) {
			workerData = event.data;
			showColors();
		});
	}

	myWorker.postMessage({
		colors: document.getElementById('num_h').value,
		levels: document.getElementById('num_l').value,
		chroma: document.getElementById('num_c').value,
		offset: document.getElementById('off_x').value
	});
}

startWorker();

document.getElementById('num_h').addEventListener('change', startWorker);
document.getElementById('num_l').addEventListener('change', startWorker);
document.getElementById('num_c').addEventListener('change', startWorker);
document.getElementById('off_x').addEventListener('change', startWorker);
document.getElementById('download').addEventListener('click', downloadCss);
