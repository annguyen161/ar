const mv = document.getElementById("mv");
const customAR = document.getElementById("customAR");
const playAnimBtn = document.getElementById("playAnim");
const bgm = document.getElementById("bgm");
const btnGroup = document.getElementById("btnGroup");
const visitBtn = document.getElementById("visitBtn");
const textBanner = document.querySelector(".text-banner");
const modelLoading = document.getElementById("model-loading");
const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

let firstAnim = null;
let arActivated = false;
let isModelLoaded = false;
let isAudioLoaded = false;

// Function to get URL parameters
function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Function to get current month from URL or default to 1
function getCurrentMonth() {
  const month = getUrlParameter("month");
  return month ? parseInt(month) : 1;
}

// Lazy loading functions
function loadFloatingElements() {
  const floatingElements = document.querySelectorAll(".floating-element");
  floatingElements.forEach((element, index) => {
    setTimeout(() => {
      element.classList.add("lazy-loaded");
    }, index * 100);
  });
}

function preloadAudio(audioSrc) {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.preload = "metadata";
    audio.oncanplaythrough = () => {
      isAudioLoaded = true;
      resolve();
    };
    audio.onerror = () => reject();
    audio.src = audioSrc;
  });
}

function showModelLoading() {
  if (modelLoading) {
    modelLoading.style.display = "block";
  }
}

function hideModelLoading() {
  if (modelLoading) {
    modelLoading.style.display = "none";
  }
}

// Function to update model and audio based on month
function updateContentForMonth(month) {
  // Show loading indicator
  showModelLoading();

  // Update model source
  const modelSrc = `module/source/month${month}/baby${month}.glb`;
  const iosSrc = `module/source/month${month}/baby${month}.usdz`;

  mv.setAttribute("src", modelSrc);
  mv.setAttribute("ios-src", iosSrc);
  mv.setAttribute("alt", `BABY${month}M`);

  // Update audio source with lazy loading
  const audioSrc = `module/source/month${month}/voice${month}.MP3`;
  bgm.setAttribute("src", audioSrc);

  // Preload audio in background
  preloadAudio(audioSrc).catch(() => {
    console.log("Audio preload failed, will load on demand");
  });

  // Update banner text
  updateBannerTextForMonth(month);
}

// Function to update banner text for specific month
function updateBannerTextForMonth(month) {
  const bannerText = document.querySelector(".banner-text");
  if (bannerText) {
    bannerText.innerHTML = `
      Lắng nghe "Lời thì thầm từ con" <br />
      tháng ${month}
    `;
  }
}

// Function to check AR support
function checkARSupport() {
  // Check for WebXR support
  if ("xr" in navigator) {
    return navigator.xr
      .isSessionSupported("immersive-ar")
      .then((supported) => {
        return supported;
      })
      .catch(() => {
        return false;
      });
  }

  // Check for iOS AR Quick Look support
  if (isIOS) {
    return new Promise((resolve) => {
      // iOS devices with iOS 12+ support AR Quick Look
      const iOSVersion = navigator.userAgent.match(/OS (\d+)_/);
      if (iOSVersion && parseInt(iOSVersion[1]) >= 12) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }

  // Check for Android ARCore support
  if (/Android/i.test(navigator.userAgent)) {
    return new Promise((resolve) => {
      // Basic Android AR support check
      resolve(true);
    });
  }

  // Default to false for unsupported devices
  return Promise.resolve(false);
}

// Function to show AR not supported message
function showARNotSupportedMessage() {
  // Create modal overlay
  const modal = document.createElement("div");
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    font-family: 'Nunito', sans-serif;
  `;

  // Create modal content
  const modalContent = document.createElement("div");
  modalContent.style.cssText = `
    background: white;
    padding: 30px;
    border-radius: 15px;
    text-align: center;
    max-width: 350px;
    margin: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  `;

  // Create message
  const message = document.createElement("div");
  message.style.cssText = `
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 20px;
    line-height: 1.4;
  `;
  message.textContent = "Thiết bị của bạn không hỗ trợ AR";

  // Create close button
  const closeBtn = document.createElement("button");
  closeBtn.style.cssText = `
    background: #FF6B6B;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 25px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s ease;
  `;
  closeBtn.textContent = "Đóng";
  closeBtn.onmouseover = () => (closeBtn.style.background = "#FF5252");
  closeBtn.onmouseout = () => (closeBtn.style.background = "#FF6B6B");

  // Add click handler to close modal
  closeBtn.addEventListener("click", () => {
    document.body.removeChild(modal);
  });

  // Add click handler to close modal when clicking overlay
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });

  // Assemble modal
  modalContent.appendChild(message);
  modalContent.appendChild(closeBtn);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
}

// Function to update banner text after 1 minute
function updateBannerText() {
  const bannerText = document.querySelector(".banner-text");
  if (bannerText) {
    bannerText.innerHTML = `
      Mẹ khám phá TRỌN VẸN 9 THÁNG trưởng thành của con tại "đổi quà" nhé
    `;
  }
}

// Function to set initial banner text
function setInitialBannerText() {
  const bannerText = document.querySelector(".banner-text");
  if (bannerText) {
    const currentMonth = getCurrentMonth();
    bannerText.innerHTML = `
      Lắng nghe "Lời thì thầm từ con" <br />
      tháng ${currentMonth}
    `;
  }
}

// Intersection Observer for lazy loading
function setupIntersectionObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("lazy-loaded");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "50px",
    }
  );

  // Observe floating elements
  document.querySelectorAll(".floating-element").forEach((el) => {
    observer.observe(el);
  });
}

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Lazy load resources based on user interaction
function setupLazyResourceLoading() {
  // Load audio when user first interacts
  let audioLoaded = false;
  const loadAudio = () => {
    if (!audioLoaded && bgm.src) {
      bgm.load();
      audioLoaded = true;
    }
  };

  // Load audio on first user interaction
  document.addEventListener("click", loadAudio, { once: true });
  document.addEventListener("touchstart", loadAudio, { once: true });
  document.addEventListener("keydown", loadAudio, { once: true });
}

// Initialize content based on URL parameter
document.addEventListener("DOMContentLoaded", function () {
  const currentMonth = getCurrentMonth();
  updateContentForMonth(currentMonth);

  // Setup intersection observer for lazy loading
  setupIntersectionObserver();

  // Setup lazy resource loading
  setupLazyResourceLoading();

  // Load floating elements with lazy loading
  setTimeout(() => {
    loadFloatingElements();
  }, 500);
});

setTimeout(() => {
  if (typeof textBanner !== "undefined" && textBanner) {
    textBanner.classList.add("show", "lazy-loaded");
  }
}, 1000);

// Hide visit button and set initial banner text for 1 minute when page loads
function hideVisitButtonForOneMinute() {
  // Set initial banner text
  setInitialBannerText();

  // Hide the button initially
  visitBtn.style.display = "none";
  visitBtn.classList.remove("show");

  // Show the button after 1 minute (60 seconds)
  setTimeout(() => {
    // Show the button (text will be updated automatically in showVisitButton)
    visitBtn.style.display = "flex";
    visitBtn.classList.add("show");
    updateBannerText();
  }, 60000); // 60 seconds = 60000 milliseconds
}

// Start hiding the button when page loads
hideVisitButtonForOneMinute();

customAR.addEventListener("click", async (event) => {
  event.preventDefault();

  // Check AR support before activating
  try {
    const isARSupported = await checkARSupport();

    if (!isARSupported) {
      showARNotSupportedMessage();
      return;
    }

    await mv.activateAR();
    arActivated = true;
  } catch (err) {
    // Show error message if AR activation fails
    showARNotSupportedMessage();
  }

  if (isIOS && bgm.paused) {
    bgm.pause();
    bgm.currentTime = 0;
    bgm.loop = true; // Enable audio looping on iOS AR
    // Load audio if not already loaded
    if (!isAudioLoaded) {
      bgm.load();
      bgm.addEventListener(
        "canplaythrough",
        () => {
          bgm
            .play()
            .catch((err) =>
              console.error("Không phát được nhạc trên iOS:", err)
            );
        },
        { once: true }
      );
    } else {
      setTimeout(() => {
        bgm
          .play()
          .catch((err) => console.error("Không phát được nhạc trên iOS:", err));
      }, 100);
    }
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    bgm.pause();
    bgm.currentTime = 0;
  }
});

window.addEventListener("pagehide", () => {
  bgm.pause();
  bgm.currentTime = 0;
});

mv.addEventListener("load", () => {
  const animations = mv.availableAnimations;
  isModelLoaded = true;

  // Hide loading indicator and show model
  hideModelLoading();
  mv.style.opacity = "1";
  mv.classList.add("loaded");

  if (animations && animations.length > 0) {
    firstAnim = animations[0];
    mv.animationName = firstAnim;
    mv.animationLoop = true;
    mv.pause();
  } else {
    console.log("Không tìm thấy animation trong mô hình.");
  }

  mv.addEventListener("ar-status", (event) => {
    console.log("AR status:", event.detail.status);
    if (event.detail.status === "session-started") {
      // Start animation automatically when AR session starts
      if (firstAnim) {
        mv.animationName = firstAnim;
        mv.animationLoop = true;
        mv.currentTime = 0;
        mv.play();
      }

      bgm.pause();
      bgm.currentTime = 0;
      bgm.loop = true; // Enable audio looping in AR mode
      // Load audio if not already loaded
      if (!isAudioLoaded) {
        bgm.load();
        bgm.addEventListener(
          "canplaythrough",
          () => {
            bgm
              .play()
              .catch((err) => console.error("Không phát được nhạc:", err));
          },
          { once: true }
        );
      } else {
        setTimeout(() => {
          bgm
            .play()
            .catch((err) => console.error("Không phát được nhạc:", err));
        }, 100);
      }
    } else if (event.detail.status === "not-presenting") {
      // Pause audio when exiting AR
      bgm.pause();
      bgm.currentTime = 0;
      bgm.loop = false; // Disable audio looping when exiting AR
      mv.cameraOrbit = "45deg 90deg 2m";
      // Reset play button state when exiting AR
      isPlaying = false;
      playAnimBtn.classList.remove("playing");
      updatePlayButtonIcon();
      showVisitButton();
    }
  });

  if (mv.getAttribute("ar-status") !== "session-started") {
    mv.setAttribute("ar-status", "not-presenting");
  }

  // Add skeleton loading to buttons initially
  btnGroup.classList.add("loading");

  // Remove skeleton loading and show buttons
  setTimeout(() => {
    btnGroup.classList.remove("loading");
    btnGroup.classList.add("show");
  }, 500);
});

function showVisitButton() {
  if (!visitBtn.classList.contains("show")) {
    visitBtn.style.display = "flex";
    visitBtn.classList.add("show");
    updateBannerText();
  }
}

let isPlaying = false;

playAnimBtn.addEventListener("click", () => {
  if (!firstAnim) {
    alert("Model chưa có animation!");
    return;
  }

  if (!isPlaying) {
    // Play animation
    mv.animationName = firstAnim;
    mv.animationLoop = true;
    mv.currentTime = 0;
    mv.play();
    isPlaying = true;
    playAnimBtn.classList.add("playing");
    updatePlayButtonIcon();

    // Play music when animation starts
    if (bgm.src) {
      // Stop any current audio operations
      bgm.pause();
      bgm.currentTime = 0;
      bgm.loop = true; // Enable audio looping

      // Load audio if not already loaded
      if (!isAudioLoaded) {
        bgm.load();
        // Wait for audio to be ready before playing
        bgm.addEventListener(
          "canplaythrough",
          () => {
            bgm
              .play()
              .catch((err) => console.error("Không phát được nhạc:", err));
          },
          { once: true }
        );
      } else {
        // If already loaded, play immediately
        setTimeout(() => {
          bgm
            .play()
            .catch((err) => console.error("Không phát được nhạc:", err));
        }, 100);
      }
    }
  } else {
    // Pause animation
    mv.pause();
    // Pause music when animation is paused
    bgm.pause();
    bgm.loop = false; // Disable audio looping when paused
    isPlaying = false;
    playAnimBtn.classList.remove("playing");
    updatePlayButtonIcon();
  }
});

function updatePlayButtonIcon() {
  const svg = playAnimBtn.querySelector("svg");

  if (!svg) {
    return;
  }

  if (isPlaying) {
    // Show pause icon
    svg.innerHTML = '<path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>';
  } else {
    // Show play icon
    svg.innerHTML = '<path d="M8 5v14l11-7z"/>';
  }
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && arActivated) {
    setTimeout(() => {
      if (mv.getAttribute("ar-status") === "not-presenting") {
        showVisitButton();
      }
    }, 500);
  }
});
