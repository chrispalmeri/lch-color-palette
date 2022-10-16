// import './vendor/chroma.js';

let myWorker, colorArray;

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
	styleSheet.insertRule(':root {}'); // seems to work with empty properties

	for(let i = 0; i < colorArray.length; i++) {
		let finalColor = colorArray[i].hex;
		let levelIndex = i % document.getElementById('num_l').value;
		let colorIndex = Math.floor(i / document.getElementById('num_l').value);

		styleSheet.cssRules[0].style.setProperty(`--color${colorIndex}-${100 * (levelIndex + 1)}`, finalColor);
	}

	let cssText = styleSheet.cssRules[0].cssText;
	let cssFormatted = cssText.replace(/([;{])\s?/g, '$1\n\t').replace('\t}', '}\n');

	let link = document.createElement("a");
	link.setAttribute("href", "data:text/css;charset=utf-8," + encodeURIComponent(cssFormatted));
	link.setAttribute("download", "colors.css");
	link.click();
}

function showColors() {
	let swatches = document.getElementById('swatches');
	swatches.innerHTML = '';

	for(let i = 0; i < colorArray.length; i++) {
		let finalColor = colorArray[i].hex;
		let levelIndex = i % document.getElementById('num_l').value;
		let colorIndex = Math.floor(i / document.getElementById('num_l').value);

		var swatch = document.createElement('div');
		swatch.style.background = finalColor;
		swatch.title = finalColor;
		swatch.addEventListener('click', () => {
			navigator.clipboard.writeText(finalColor);
		});
		swatch.style.gridRow = levelIndex + 1;
		swatch.style.gridColumn = colorIndex + 1;
		swatches.appendChild(swatch);
	}
}

function startWorker() {
	if(typeof(myWorker) === "undefined") {
		myWorker = new Worker("worker.js");

		myWorker.onmessage = function(event) {
			colorArray = event.data.calc;
			showColors();
		};
	}

	myWorker.postMessage({
		colors: document.getElementById('num_h').value,
		shades: document.getElementById('num_l').value,
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
