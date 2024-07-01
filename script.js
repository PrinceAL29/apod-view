async function getData() {
    const url = `https://api.nasa.gov/planetary/apod?api_key=dkjh8GsofJdfBkWbLRPjQeFEDf5NlMJoccHVFfVU&thumbs=true`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const apodData = await response.json();

        const title = document.getElementById('title');
        const image = document.getElementById('image');
        const explanation = document.getElementById('explanation');
        const date = document.getElementById('date');

        const corsProxy = "https://api.allorigins.win/raw?url=";

        title.innerText = apodData.title;
        explanation.innerText = apodData.explanation;
        date.innerText = apodData.date;

        if (apodData.media_type === "video") {
            image.src = corsProxy + apodData.thumbnail_url;
        } else {
            image.src = corsProxy + apodData.url;
        }

        image.addEventListener("load", () => {
            const { r, g, b } = getAverageColor(image);
            console.log(r, g, b)
            document.body.style.backgroundColor = `rgb(${r},${g},${b})`;
        });

        console.log(apodData);
    } catch (error) {
        console.error(error.message);
    }
}

window.addEventListener("load", getData);

const getAverageColor = (img) => {

    const max = 10; // Max size (Higher num = better precision but slower)
    const { naturalWidth: iw, naturalHeight: ih } = img;
    const ctx = document.createElement`canvas`.getContext`2d`;
    const sr = Math.min(max / iw, max / ih); // Scale ratio
    const w = Math.ceil(iw * sr); // Width
    const h = Math.ceil(ih * sr); // Height
    const a = w * h;              // Area

    img.crossOrigin = 1;
    ctx.canvas.width = w;
    ctx.canvas.height = h;
    ctx.drawImage(img, 0, 0, w, h);

    const data = ctx.getImageData(0, 0, w, h).data;
    let r = g = b = 0;

    for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
    }

    r = ~~(r / a);
    g = ~~(g / a);
    b = ~~(b / a);

    return { r, g, b };
};


