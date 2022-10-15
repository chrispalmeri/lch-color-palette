var myWorker;

let colorArray = [];

function downloadCss(e) {
	e.preventDefault();

	let styleSheet = new CSSStyleSheet();

	styleSheet.insertRule(':root { --black: #000; }');
	styleSheet.cssRules[0].style.setProperty('--white', '#fff');

	// would like to rearrange this and group by color

	for(let levelIndex = 0; levelIndex < colorArray.length; levelIndex++) {
		for(let colorIndex = 0; colorIndex < colorArray[levelIndex].length; colorIndex++) {
			let finalColor = colorArray[levelIndex][colorIndex];

			styleSheet.cssRules[0].style.setProperty(`--level${levelIndex}-color${colorIndex}`, finalColor);
		}
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

	for(let levelIndex = 0; levelIndex < colorArray.length; levelIndex++) {
		for(let colorIndex = 0; colorIndex < colorArray[levelIndex].length; colorIndex++) {
			let finalColor = colorArray[levelIndex][colorIndex];

			var swatch = document.createElement('div');
			swatch.style.background = finalColor;
			swatch.title = finalColor;
			swatch.addEventListener('click', () => {
				navigator.clipboard.writeText(finalColor);
			});
			swatch.style.gridRow = levelIndex + 1;
			swatches.appendChild(swatch);
		}
	}
}

function startWorker() {
	if(typeof(myWorker) === "undefined") {
		myWorker = new Worker("worker.js");

		myWorker.onmessage = function(event) {
			var progressBar = document.getElementById('progress');

			if(event.data.success) {
				progressBar.parentElement.style.display = 'none';
				progressBar.value = 0;

				colorArray = event.data.calc;
				showColors();
			} else {
				progressBar.parentElement.style.display = 'flex';
				progressBar.value = event.data;
			}
		};
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
