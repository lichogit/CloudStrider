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

    var frames = [];
    var scrollProgress = 0;
    var MAX_FRAMES = 100;

    // =========================================
    //  EXTRACT VIDEO FRAMES (capped at 100)
    // =========================================
    function extractFrames() {
        return new Promise(function (resolve) {
            var duration = video.duration;
            var total = MAX_FRAMES;
            var step = duration / total;
            var idx = 0;

            var tmp = document.createElement("canvas");
            tmp.width = video.videoWidth;
            tmp.height = video.videoHeight;
            var tCtx = tmp.getContext("2d");

            console.log("[D] Extracting " + total + " frames, duration=" + duration.toFixed(2) + "s");

            function nextFrame() {
                if (idx > total) {
                    console.log("[D] Done: " + frames.length + " frames extracted");
                    resolve();
                    return;
                }
                video.currentTime = Math.min(idx * step, duration);
                idx++;
            }

            video.addEventListener("seeked", function onSeeked() {
                tCtx.drawImage(video, 0, 0);
                tmp.toBlob(function (blob) {
                    var img = new Image();
                    img.onload = function () {
                        frames.push(img);
                        var pct = Math.round((frames.length / total) * 100);
                        if (loadingLabel) loadingLabel.textContent = pct + "%";
                        if (loadingBar) loadingBar.style.width = pct + "%";
                        nextFrame();
                    };
                    img.src = URL.createObjectURL(blob);
                }, "image/jpeg", 0.8);
            });

            nextFrame();
        });
    }

    // =========================================
    //  DRAW FRAME BY SCROLL PROGRESS
    // =========================================
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
                pos[i * 3] = (Math.random() - 0.5) * 800;
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
    });

    // =========================================
    //  GSAP SCROLLTRIGGER
    // =========================================
    function initScroll() {
        canvas.width = video.videoWidth || 1920;
        canvas.height = video.videoHeight || 1080;
        if (frames.length) drawFrame(0);

        // Hide loader
        if (loadingEl) {
            gsap.to(loadingEl, {
                opacity: 0, duration: 0.4, onComplete: function () {
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
                scrub: 0.3,
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
    //  INIT
    // =========================================
    function init() {
        console.log("[D] init");
        initThree();

        if (!video) { initScroll(); return; }
        video.pause();

        function go() {
            console.log("[D] Video ready, duration=" + video.duration);
            extractFrames().then(initScroll);
        }

        if (video.readyState >= 2) {
            go();
        } else {
            video.addEventListener("canplaythrough", go, { once: true });
            setTimeout(function () {
                if (!frames.length) {
                    console.warn("[D] Video timeout");
                    if (video.readyState >= 1) extractFrames().then(initScroll);
                    else initScroll();
                }
            }, 5000);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
