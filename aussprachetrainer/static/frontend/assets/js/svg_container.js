const svgFilenames = ['person-icon.svg', 'speech-bubble-icon.svg', 'waveform-icon.svg']; // Update with your filenames
const colors = ['var(--lila)', 'var(--rosa)', 'var(--black)', 'var(--light-rosa)']; // Add your desired colors

function loadAndColorSVG(svgUrl) {
    // Randomly select an SVG file
    const randomSVGFile = svgFilenames[Math.floor(Math.random() * svgFilenames.length)];
    const randomScale = Math.random() * 0.7 + 0.3; // Scale between 0.3x and 1x
    const randomRotation = Math.floor(Math.random() * 360); // Rotation from 0 to 360 degrees
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    //const svgUrl = `${staticPathAssets}images/${randomSVGFile}`;

    // Fetch the SVG file
    fetch(svgUrl)
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, "image/svg+xml");
            const svgElement = doc.querySelector('svg');

            if (svgElement) {
                // Apply random rotation and scale
                svgElement.style.transform = `rotate(${randomRotation}deg) scale(${randomScale})`;

                // Apply random color
                svgElement.setAttribute('fill', randomColor);
                svgElement.querySelectorAll('*').forEach(el => {
                    el.setAttribute('fill', randomColor);
                });

                // Place the SVG element
                placeRandomly(svgElement, randomScale);
            }
        })
        .catch(error => console.error('Error loading SVG:', error));
}




function placeRandomly(element) {
    const container = document.getElementById('svgContainer');
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    const middleStart = (containerWidth / 2) - 300;
    const middleEnd = (containerWidth / 2) + 300;
    let x, y;
    let counter = 0;
    do {
        x = Math.random() * (containerWidth);
        y = Math.random() * (containerHeight);
        counter++;
        if (counter > 10) {
            console.log('Could not place SVG');
            return;
        }
    } while (x > middleStart && x < middleEnd); 
    element.style.position = 'absolute';
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    container.appendChild(element);
}

// Create multiple SVGs
const numberOfSVGs = 10; // Number of SVGs you want to create
for (let i = 0; i < numberOfSVGs; i++) {
    loadAndColorSVG(`${staticPathAssets}images/person-icon.svg`);
    
    setTimeout(() => {
        loadAndColorSVG(`${staticPathAssets}images/speech-bubble-icon.svg`);
    }, 1000)
}
