const corsProxy = "https://api.allorigins.win/raw?url=";
const apiKey = "dkjh8GsofJdfBkWbLRPjQeFEDf5NlMJoccHVFfVU";
const title = document.getElementById('title');
const image = document.getElementById('image');
const explanation = document.getElementById('explanation');
const date = document.getElementById('date');
const link = document.getElementById('link');
const randomBtn = document.getElementById('random-btn');
const loading = document.getElementById('loading');

image.crossOrigin = "Anonymous";

async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
    }
    return response.json();
}

function updateDOM(apodData) {
    title.innerText = apodData.title;
    explanation.innerText = apodData.explanation;
    date.innerText = apodData.date;

    const imageUrl = apodData.media_type === "video" ? apodData.thumbnail_url : apodData.url;
    image.src = corsProxy + encodeURIComponent(imageUrl);
    link.href = apodData.url;

    image.addEventListener("load", () => {
        const { r, g, b } = getAverageColor(image);
        document.body.style.backgroundColor = `rgb(${r},${g},${b})`;
        loading.style.display = "none";
        randomBtn.style.display = 'block';
    });
}

async function getData() {
    try {
        const apodData = await fetchData(`https://api.nasa.gov/planetary/apod?api_key=${apiKey}&thumbs=true`);
        updateDOM(apodData);
        console.log(apodData);
    } catch (error) {
        console.error(error.message);
    }
}

async function getRandom() {
    try {
        loading.style.display = "block";
        const jsonData = await fetchData(`https://api.nasa.gov/planetary/apod?api_key=${apiKey}&thumbs=true&count=1`);
        const apodData = jsonData[0];
        updateDOM(apodData);
        console.log(apodData);
    } catch (error) {
        console.error(error.message);
        loading.style.display = "none";
    }
}

randomBtn.addEventListener("click", getRandom);
window.addEventListener("load", getData);

function getAverageColor(img) {
    const max = 10; // Max size (Higher num = better precision but slower)
    const { naturalWidth: iw, naturalHeight: ih } = img;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const sr = Math.min(max / iw, max / ih); // Scale ratio
    const w = Math.ceil(iw * sr); // Width
    const h = Math.ceil(ih * sr); // Height
    const a = w * h; // Area

    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(img, 0, 0, w, h);

    const data = ctx.getImageData(0, 0, w, h).data;
    let r = 0, g = 0, b = 0;

    for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
    }

    r = Math.floor(r / a);
    g = Math.floor(g / a);
    b = Math.floor(b / a);

    return { r, g, b };
}
