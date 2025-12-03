// Defer attaching DOM event listeners until the DOM is ready so the
// script doesn't throw if elements aren't present when the file is
// included in the page head. This prevents early errors that would
// stop the progress simulator from running.
document.addEventListener('DOMContentLoaded', function () {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const toggleIcon = document.getElementById('toggle-icon');

    if (sidebarToggle && sidebar && mainContent && toggleIcon) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');

            // Change the toggle icon direction
            if (sidebar.classList.contains('collapsed')) {
                toggleIcon.classList.remove('bi-chevron-left');
                toggleIcon.classList.add('bi-chevron-right');
            } else {
                toggleIcon.classList.remove('bi-chevron-right');
                toggleIcon.classList.add('bi-chevron-left');
            }
        });
    }

    // Mobile menu toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('show');
        });
    }

    // Close mobile menu when clicking on a link
    const mobileLinks = document.querySelectorAll('.mobile-menu .nav-link');
    if (mobileLinks && mobileLinks.length) {
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (mobileMenu) mobileMenu.classList.remove('show');
            });
        });
    }

    // Handle sidebar for mobile
    const mobileShowSidebar = document.getElementById('mobile-toggle');
    if (mobileShowSidebar && sidebar) {
        mobileShowSidebar.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-show');
        });
    }

    // Safe YouTube form listener: only attach if the form exists
    const ytForm = document.getElementById('youtube-form');
    if (ytForm) {
        ytForm.addEventListener('submit', function (e) {
            const urlInput = document.getElementById('youtube-link');
            const youtubeRegex = /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;

            if (!urlInput || !youtubeRegex.test(urlInput.value)) {
                e.preventDefault();
                alert('Please enter a valid YouTube URL');
                if (urlInput) urlInput.focus();
                return;
            }

            // Show loading overlay and start YouTube-mode progress simulation
            showLoading();
            simulateProgress('youtube'); // Start youtube-mode progress with YouTube-specific messages
            // Form submission continues normally - will navigate to summary page after server processes
        });
    }

    // Also attach listener to the hidden upload form to cover non-inline submit paths
    const uploadForm = document.getElementById('upload-form');
    if (uploadForm) {
        uploadForm.addEventListener('submit', function (e) {
            // Show loading overlay and start upload-mode progress simulation
            showLoading();
            simulateProgress('upload');
            // allow normal submission to continue (will navigate away)
        });
    }
});

function showYoutubeInput() {
    document.getElementById('youtube-input').style.display = 'block';
}

function hideYoutubeInput() {
    document.getElementById('youtube-input').style.display = 'none';
    document.getElementById('youtube-link').value = '';
}

function triggerFileUpload(fileType) {
    document.getElementById('file_type').value = fileType;
    document.getElementById('file-input').accept = getAcceptAttribute(fileType);
    document.getElementById('file-input').click();
}

function getAcceptAttribute(fileType) {
    const acceptMap = {
        'pdf': '.pdf,.txt',
        'audio': '.mp3,.wav,.ogg,.m4a'
    };
    return acceptMap[fileType] || '';
}

// Updated submit function with loading bar
function submitForm() {
    const fileInput = document.getElementById('file-input');
    if (fileInput.files.length > 0) {
        showLoading();
        simulateProgress('upload'); // Start upload-mode progress
        document.getElementById('upload-form').submit();
    }
}

// Show loading overlay
function showLoading() {
    const overlay = document.getElementById('loading-overlay');
    overlay.style.display = 'flex';
}

// Hide loading overlay
function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    overlay.style.display = 'none';
    // Stop any running simulation and reset the bar
    try {
        progressSimulator.stop();
    } catch (err) {
        // ignore if simulator isn't available
    }
    resetProgress();
}

// Reset progress bar
function resetProgress() {
    document.getElementById('upload-progress').style.width = '0%';
    document.getElementById('progress-text').textContent = 'Processing your file...';
}

// Reliable Progress Simulator that actually works
class ProgressSimulator {
    constructor() {
        this.interval = null;
        this.progress = 0;
        this.mode = 'generic';
    }

    start(mode = 'generic') {
        this.stop(); // Stop any existing simulation
        this.progress = 0;
        this.mode = mode;

        const progressBar = document.getElementById('upload-progress');
        const progressText = document.getElementById('progress-text');

        if (!progressBar || !progressText) {
            console.error('Progress elements not found');
            return;
        }

        // Update immediately before interval starts
        const updateProgress = () => {
            // More aggressive increments for visible movement
            let increment = Math.random() * 20;

            // Slower as we approach 99%
            if (this.progress < 20) increment *= 1.5;
            else if (this.progress > 80) increment *= 0.3;

            this.progress = Math.min(99, this.progress + increment);
            const percent = Math.floor(this.progress);

            progressBar.style.width = percent + '%';
            console.log('[Progress]', percent + '%');

            // Update text based on mode and progress
            if (this.mode === 'youtube') {
                if (this.progress < 30) {
                    progressText.textContent = 'Contacting YouTube...';
                } else if (this.progress < 60) {
                    progressText.textContent = 'Extracting transcript...';
                } else if (this.progress < 90) {
                    progressText.textContent = 'Downloading audio...';
                } else {
                    progressText.textContent = 'Finalizing...';
                }
            } else {
                if (this.progress < 30) {
                    progressText.textContent = 'Uploading file...';
                } else if (this.progress < 60) {
                    progressText.textContent = 'Processing content...';
                } else if (this.progress < 90) {
                    progressText.textContent = 'Generating summary...';
                } else {
                    progressText.textContent = 'Finalizing...';
                }
            }
        };

        // Update immediately
        updateProgress();

        // Then update every 300-500ms
        this.interval = setInterval(updateProgress, 300 + Math.random() * 200);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
}

// Global progress simulator instance
const progressSimulator = new ProgressSimulator();

// Simple function to start progress simulation
function simulateProgress(mode = 'upload') {
    progressSimulator.start(mode);
}

// YouTube form listener attached safely during DOMContentLoaded above

// When the document becomes hidden (navigation starts), set the bar to 100%
// so the user sees a completed loading bar while the next page loads.
document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') {
        const progressBar = document.getElementById('upload-progress');
        const progressText = document.getElementById('progress-text');
        if (progressBar) progressBar.style.width = '100%';
        if (progressText) progressText.textContent = 'Loading...';
        try { progressSimulator.stop(); } catch (e) { /* ignore */ }
        // Do not hide the overlay here; the browser will navigate away and replace the page.
    }
});