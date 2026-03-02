const title = document.getElementById('title');
const image = document.getElementById('image');
const explanation = document.getElementById('explanation');
const date = document.getElementById('date');
const link = document.getElementById('link');
const randomBtn = document.getElementById('random-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const loading = document.getElementById('loading');
const inputDate = document.getElementById("dateObj");

image.crossOrigin = "Anonymous";

const dateObj = new Date();
let currentDate = `${dateObj.getFullYear()}-${("0" + (dateObj.getMonth() + 1)).slice(-2)}-${("0" + dateObj.getDate()).slice(-2)}`;
inputDate.setAttribute('max', currentDate);

let selectedDate = new Date();

async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error(error.message);
        alert("There was an issue fetching data. Please try again later.");
        throw error;
    }
}

function updateDOM(apodData) {
    title.innerText = apodData.title;
    explanation.innerText = apodData.explanation;
    date.innerText = apodData.date;
    const imageUrl = apodData.media_type === "video" ? apodData.thumbnail_url : apodData.url;
    image.src = `/image-proxy?url=${encodeURIComponent(imageUrl)}`;
    link.href = apodData.url;

    image.onload = () => {
        const { r, g, b } = getAverageColor(image);
        document.body.style.backgroundColor = `rgb(${r},${g},${b})`;
        loading.style.display = "none";
        randomBtn.style.display = 'block';
        prevBtn.style.display = 'block';
        nextBtn.style.display = 'block';
        inputDate.style.display = 'block';
        document.body.style.overflow = "auto";
    };

    image.onerror = () => {
        loading.style.display = "none";
        alert("Failed to load image. Please try again.");
    };
}

async function getData(date) {
    try {
        document.body.style.overflow = "hidden";
        loading.style.display = "block";
        const apodData = await fetchData(`/data?date=${date}`);
        updateDOM(apodData);
        checkNextButton(date);
    } catch (error) {
        console.error(error.message);
        document.body.style.overflow = "auto";
        loading.style.display = "none";
    }
}

async function getRandom() {
    try {
        document.body.style.overflow = "hidden";
        loading.style.display = "block";
        const jsonData = await fetchData(`/data?random=1`);
        const apodData = jsonData[0];
        updateDOM(apodData);

        selectedDate = new Date(apodData.date);
        inputDate.value = apodData.date;
        checkNextButton(apodData.date);
    } catch (error) {
        console.error(error.message);
        document.body.style.overflow = "auto";
        loading.style.display = "none";
    }
}

function updateDateInput() {
    inputDate.value = selectedDate.toISOString().split('T')[0];
}

function checkNextButton(selectedDate) {
    if (selectedDate === currentDate) {
        nextBtn.disabled = true;
    } else {
        nextBtn.disabled = false;
    }
}

function adjustDate(offset) {
    selectedDate.setDate(selectedDate.getDate() + offset);
    updateDateInput();
    getData(formatDate(selectedDate));
}

function formatDate(date) {
    return `${date.getFullYear()}-${("0" + (date.getMonth() + 1)).slice(-2)}-${("0" + date.getDate()).slice(-2)}`;
}

randomBtn.addEventListener("click", () => {
    getRandom();
});

prevBtn.addEventListener("click", () => {
    adjustDate(-1);
});

nextBtn.addEventListener("click", () => {
    adjustDate(1); // Go to next day
});

inputDate.addEventListener("change", () => {
    selectedDate = new Date(inputDate.value);
    getData(formatDate(selectedDate));
});

window.addEventListener("load", () => {
    updateDateInput();
    getData(formatDate(selectedDate));
    checkNextButton(inputDate.value);
});

function getAverageColor(img) {
    const max = 10;
    const { naturalWidth: iw, naturalHeight: ih } = img;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const sr = Math.min(max / iw, max / ih);
    const w = Math.ceil(iw * sr);
    const h = Math.ceil(ih * sr);
    const a = w * h;

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
