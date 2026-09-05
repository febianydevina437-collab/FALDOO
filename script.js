const searchButton = document.getElementById("searchButton");
const message = document.getElementById("message");

const tripRadios = document.querySelectorAll('input[name="trip"]');
const returnGroup = document.getElementById("returnGroup");
const returnDate = document.getElementById("returnDate");
const departure = document.getElementById("departure");

const mediaInput = document.getElementById("mediaInput");
const slideshowDisplay = document.getElementById("slideshowDisplay");
const previousButton = document.getElementById("previousButton");
const nextButton = document.getElementById("nextButton");
const playButton = document.getElementById("playButton");
const clearButton = document.getElementById("clearButton");
const slideCounter = document.getElementById("slideCounter");

let mediaFiles = [];
let currentSlide = 0;
let slideshowTimer = null;
let slideshowPlaying = false;

const today = new Date().toISOString().split("T")[0];

if (departure) departure.min = today;
if (returnDate) returnDate.min = today;

tripRadios.forEach(function (radio) {
    radio.addEventListener("change", function () {
        if (radio.value === "One Way") {
            if (returnGroup) returnGroup.style.display = "none";
            if (returnDate) returnDate.value = "";
        } else {
            if (returnGroup) returnGroup.style.display = "flex";
        }
    });
});

if (departure) {
    departure.addEventListener("change", function () {
        if (returnDate) {
            returnDate.min = departure.value;
            if (returnDate.value && returnDate.value < departure.value) {
                returnDate.value = "";
            }
        }
    });
}

if (searchButton) {
    searchButton.addEventListener("click", function (e) {
        e.preventDefault();

        const selectedTrip = document.querySelector('input[name="trip"]:checked');
        const trip = selectedTrip ? selectedTrip.value : "Round Trip";
        const from = document.getElementById("from") ? document.getElementById("from").value : "";
        const to = document.getElementById("to") ? document.getElementById("to").value : "";
        const departureVal = departure ? departure.value : "";
        const returnDateVal = returnDate ? returnDate.value : "";
        const passengers = document.getElementById("passengers") ? document.getElementById("passengers").value : "1";
        const flightClass = document.getElementById("flightClass") ? document.getElementById("flightClass").value : "Economy";

        if (!from || !to || !departureVal) {
            alert("Please fill out all required fields (From, To, Departure).");
            return;
        }

        const queryParams = new URLSearchParams({
            trip,
            from,
            to,
            departure: departureVal,
            returnDate: returnDateVal,
            passengers,
            flightClass
        });

        window.location.href = `ticket.html?${queryParams.toString()}`;
    });
}

if (mediaInput) {
    mediaInput.addEventListener("change", function () {
        const selectedFiles = Array.from(mediaInput.files);

        if (selectedFiles.length === 0) {
            return;
        }

        selectedFiles.forEach(function (file) {
            if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
                mediaFiles.push({
                    file: file,
                    url: URL.createObjectURL(file),
                    type: file.type
                });
            }
        });

        currentSlide = 0;
        showSlide(currentSlide);
        mediaInput.value = "";
    });
}

function showSlide(index) {
    if (!slideshowDisplay) return;

    if (mediaFiles.length === 0) {
        slideshowDisplay.innerHTML = `
            <div class="empty-slideshow">
                <span>📸</span>
                <h3>No media added yet</h3>
                <p>Choose photos or videos below to create your slideshow.</p>
            </div>
        `;

        if (slideCounter) slideCounter.textContent = "0 / 0";
        return;
    }

    if (index < 0) {
        currentSlide = mediaFiles.length - 1;
    } else if (index >= mediaFiles.length) {
        currentSlide = 0;
    } else {
        currentSlide = index;
    }

    const media = mediaFiles[currentSlide];

    slideshowDisplay.innerHTML = "";

    if (media.type.startsWith("image/")) {
        const image = document.createElement("img");

        image.src = media.url;
        image.alt = media.file.name;

        slideshowDisplay.appendChild(image);
    } else if (media.type.startsWith("video/")) {
        const video = document.createElement("video");

        video.src = media.url;
        video.controls = true;
        video.autoplay = slideshowPlaying;
        video.playsInline = true;

        slideshowDisplay.appendChild(video);

        video.addEventListener("ended", function () {
            if (slideshowPlaying) {
                nextSlide();
            }
        });

        if (slideshowPlaying) {
            video.play().catch(function () {});
        }
    }

    if (slideCounter) {
        slideCounter.textContent = currentSlide + 1 + " / " + mediaFiles.length;
    }
}

function nextSlide() {
    showSlide(currentSlide + 1);
}

function previousSlide() {
    showSlide(currentSlide - 1);
}

function startSlideshow() {
    if (mediaFiles.length === 0) {
        return;
    }

    slideshowPlaying = true;
    if (playButton) playButton.textContent = "❚❚ Pause";

    clearInterval(slideshowTimer);

    slideshowTimer = setInterval(function () {
        const currentMedia = mediaFiles[currentSlide];

        if (currentMedia.type.startsWith("video/")) {
            const video = slideshowDisplay.querySelector("video");

            if (video) {
                video.play().catch(function () {});
            }
        } else {
            nextSlide();
        }
    }, 5000);

    const currentVideo = slideshowDisplay.querySelector("video");

    if (currentVideo) {
        currentVideo.play().catch(function () {});
    }
}

function stopSlideshow() {
    slideshowPlaying = false;
    if (playButton) playButton.textContent = "▶ Play";

    clearInterval(slideshowTimer);
    slideshowTimer = null;

    if (slideshowDisplay) {
        const currentVideo = slideshowDisplay.querySelector("video");

        if (currentVideo) {
            currentVideo.pause();
        }
    }
}

if (previousButton) {
    previousButton.addEventListener("click", function () {
        stopSlideshow();
        previousSlide();
    });
}

if (nextButton) {
    nextButton.addEventListener("click", function () {
        stopSlideshow();
        nextSlide();
    });
}

if (playButton) {
    playButton.addEventListener("click", function () {
        if (slideshowPlaying) {
            stopSlideshow();
        } else {
            startSlideshow();
        }
    });
}

if (clearButton) {
    clearButton.addEventListener("click", function () {
        stopSlideshow();

        mediaFiles.forEach(function (media) {
            URL.revokeObjectURL(media.url);
        });

        mediaFiles = [];
        currentSlide = 0;

        showSlide(0);
    });
}

showSlide(0);