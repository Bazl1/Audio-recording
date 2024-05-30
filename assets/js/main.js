let mediaRecorder;
let audioChunks = [];
let audioContext;
let analyser;
let dataArray;
let bufferLength;
let bars = [];

const columns = 32;
const width = 5;
let height;

document.getElementById("startBtn").addEventListener("click", async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    source.connect(analyser);
    analyser.fftSize = 64;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    createVisualizer();

    mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
        console.log("Recording stopped");
        const equalizer = document.querySelector(".hero__equalizer");
        equalizer.innerHTML = "";
        equalizer.style.display = "none";

        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(audioBlob);
        const downloadLink = document.getElementById("downloadLink");
        downloadLink.href = audioUrl;
        downloadLink.download = "recording.wav";
        downloadLink.style.display = "flex";
    };

    console.log("Recording started");
    mediaRecorder.start();
    drawVisualizer();

    document.getElementById("startBtn").disabled = true;
    document.getElementById("stopBtn").disabled = false;
});

document.getElementById("stopBtn").addEventListener("click", () => {
    mediaRecorder.stop();
    document.getElementById("startBtn").disabled = false;
    document.getElementById("stopBtn").disabled = true;
});

function createVisualizer() {
    const equalizer = document.querySelector(".hero__equalizer");
    equalizer.innerHTML = "";
    for (let i = 0; i < columns; i++) {
        const bar = document.createElement("div");
        bar.classList.add("bar");
        bar.style.width = `${width}px`;
        equalizer.appendChild(bar);
        bars.push(bar);
    }
}

function drawVisualizer() {
    requestAnimationFrame(drawVisualizer);
    analyser.getByteFrequencyData(dataArray);
    bars.forEach((bar, index) => {
        const value = dataArray[index];
        const percent = value / 256;
        const height = percent * 100;
        bar.style.height = `${height}px`;
        bar.style.backgroundColor = `rgb(${value}, ${255 - value}, 50)`;
    });
}
