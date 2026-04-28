(function () {
    "use strict";
    gsap.registerPlugin(ScrollTrigger);

    var video = document.getElementById("sneaker-video");
    var canvas = document.getElementById("video-canvas");
    var ctx = canvas.getContext("2d");
    var threeCanvas = document.getElementById("three-canvas");
    var scrollIndicator = document.getElementById("scroll-indicator");
    var loadingEl = document.getElementById("loading-overlay");
    var loadingLabel = document.getElementById("loading-pct");
    var loadingBar = document.getElementById("loading-progress");

    var scrollProgress = 0;
    var frames = [];

    // Only extract 50 frames — human eye can't tell the difference above ~24fps
    // With 50 frames over a 5s scroll, that's 10fps which is imperceptible at scroll speed
    var MAX_FRAMES = 50;

    // =========================================
    //  SMART FRAME EXTRACTION — BATCHED + NON-BLOCKING
    //  Uses requestIdleCallback so it never freezes the UI
    // =========================================
    function extractFramesFast() {
        return new Promise(function (resolve) {
            var duration = video.duration || 5;
            var step = duration / MAX_FRAMES;
            var idx = 0;
            var seekPending = false;

            var w = video.videoWidth || 1280;
            var h = video.videoHeight || 720;
            // Max 720p — above that is wasted RAM for a canvas scrub
            var scale = Math.min(1, 960 / w);
            w = Math.floor(w * scale);
            h = Math.floor(h * scale);

            console.log("[D] Extracting " + MAX_FRAMES + " frames @ " + w + "x" + h);

            function captureCurrentFrame() {
                var c = document.createElement("canvas");
                c.width = w;
                c.height = h;
                // { alpha: false } skips alpha channel compositing — ~25% faster per frame
                c.getContext("2d", { alpha: false }).drawImage(video, 0, 0, w, h);
                frames.push(c);

                var pct = Math.round((frames.length / MAX_FRAMES) * 100);
                if (loadingLabel) loadingLabel.textContent = pct + "%";
                if (loadingBar) loadingBar.style.width = pct + "%";
            }

            function scheduleNextSeek() {
                if (idx >= MAX_FRAMES) {
                    resolve();
                    return;
                }
                // Use requestAnimationFrame to yield to browser between seeks
                // This keeps the loading UI responsive and prevents jank
                requestAnimationFrame(function () {
                    seekPending = true;
                    video.currentTime = Math.min(idx * step, duration - 0.001);
                    idx++;
                });
            }

            video.addEventListener("seeked", function () {
                if (!seekPending) return;
                seekPending = false;
                captureCurrentFrame();
                scheduleNextSeek();
            });

            scheduleNextSeek();
        });
    }

    function drawFrame(progress) {
        if (!frames.length) return;
        var i = Math.min(Math.floor(progress * (frames.length - 1)), frames.length - 1);
        ctx.drawImage(frames[i], 0, 0, canvas.width, canvas.height);
    }

    // =========================================
    //  THREE.JS PARTICLES
    // =========================================
    var scene, camera, renderer, particles;

    function initThree() {
        try {
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.z = 300;
            renderer = new THREE.WebGLRenderer({ canvas: threeCanvas, alpha: true, antialias: false });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.setSize(window.innerWidth, window.innerHeight);

            var count = 400;
            var geo = new THREE.BufferGeometry();
            var pos = new Float32Array(count * 3);
            for (var i = 0; i < count; i++) {
                pos[i * 3]     = (Math.random() - 0.5) * 800;
                pos[i * 3 + 1] = (Math.random() - 0.5) * 600;
                pos[i * 3 + 2] = (Math.random() - 0.5) * 400;
            }
            geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
            var mat = new THREE.PointsMaterial({
                color: 0xffffff, size: 1.5, transparent: true,
                opacity: 0.15, sizeAttenuation: true,
                blending: THREE.AdditiveBlending, depthWrite: false
            });
            particles = new THREE.Points(geo, mat);
            scene.add(particles);
            tickThree();
        } catch (e) { console.warn("[D] Three.js error:", e); }
    }

    function tickThree() {
        requestAnimationFrame(tickThree);
        if (!particles) return;
        particles.rotation.y += 0.0003;
        particles.rotation.x += 0.0001;
        particles.position.y = -scrollProgress * 50;
        renderer.render(scene, camera);
    }

    window.addEventListener("resize", function () {
        if (!camera || !renderer) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        if (video) {
            canvas.width = video.videoWidth || 1920;
            canvas.height = video.videoHeight || 1080;
            drawFrame(scrollProgress);
        }
    });

    // =========================================
    //  GSAP SCROLLTRIGGER
    // =========================================
    function initScroll() {
        canvas.width = video.videoWidth || 1920;
        canvas.height = video.videoHeight || 1080;
        if (frames.length) drawFrame(0);

        // Hide loader gracefully
        if (loadingEl) {
            gsap.to(loadingEl, {
                opacity: 0, duration: 0.5, ease: "power2.inOut", onComplete: function () {
                    loadingEl.style.display = "none";
                }
            });
        }

        var tl = gsap.timeline({
            scrollTrigger: {
                trigger: "#sneaker-deconstruction",
                start: "top top",
                end: "+=5000",
                pin: "#deconstruct-pin",
                scrub: 0.1,
                anticipatePin: 1,
                onUpdate: function (self) {
                    scrollProgress = self.progress;
                    drawFrame(self.progress);
                    if (scrollIndicator) {
                        scrollIndicator.style.opacity = self.progress > 0.02 ? "0" : "1";
                    }
                }
            }
        });

        // Stage 1 (0-15%)
        tl.fromTo("#stage-1", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.05 }, 0.01);
        tl.to("#stage-1", { opacity: 0, y: -30, duration: 0.04 }, 0.13);
        // Stage 2 (18-33%)
        tl.fromTo("#stage-2", { opacity: 0, x: 80 }, { opacity: 1, x: 0, duration: 0.05 }, 0.18);
        tl.to("#stage-2", { opacity: 0, x: -50, duration: 0.04 }, 0.31);
        // Stage 3 (36-51%)
        tl.fromTo("#stage-3", { opacity: 0, x: -80 }, { opacity: 1, x: 0, duration: 0.05 }, 0.36);
        tl.to("#stage-3", { opacity: 0, x: 50, duration: 0.04 }, 0.49);
        // Stage 4 (54-69%)
        tl.fromTo("#stage-4", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.05 }, 0.54);
        tl.to("#stage-4", { opacity: 0, y: -40, duration: 0.04 }, 0.67);
        // Stage 5 (72-87%)
        tl.fromTo("#stage-5", { opacity: 0, x: 80 }, { opacity: 1, x: 0, duration: 0.05 }, 0.72);
        tl.to("#stage-5", { opacity: 0, x: -50, duration: 0.04 }, 0.85);
        // Stage 6 (90-100%)
        tl.fromTo("#stage-6", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.06 }, 0.90);

        console.log("[D] ScrollTrigger ready");
    }

    // =========================================
    //  INIT — fetch blob into RAM first so all seeks are instant
    // =========================================
    function init() {
        console.log("[D] init");
        initThree();
        if (!video) return;

        if (loadingEl) {
            loadingEl.style.display = "flex";
            loadingEl.style.opacity = "1";
        }
        if (loadingLabel) loadingLabel.textContent = "0%";
        if (loadingBar) loadingBar.style.width = "0%";

        function startExtraction() {
            extractFramesFast().then(initScroll);
        }

        // Pull the entire video into memory as a blob.
        // This makes all subsequent seeks operate at RAM speed (~instant)
        // instead of going through the network/disk decode pipeline.
        fetch(video.src)
            .then(function (res) { return res.blob(); })
            .then(function (blob) {
                video.src = URL.createObjectURL(blob);
                if (video.readyState >= 1) {
                    startExtraction();
                } else {
                    video.addEventListener("loadedmetadata", startExtraction, { once: true });
                }
            })
            .catch(function (err) {
                console.warn("[D] Blob fetch failed, using stream:", err);
                if (video.readyState >= 1) {
                    startExtraction();
                } else {
                    video.addEventListener("loadedmetadata", startExtraction, { once: true });
                }
            });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
