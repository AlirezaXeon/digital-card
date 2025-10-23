// worker.js — Cloudflare Worker (single-file)
// -------------------------------------------
// Purpose:
//   Serves a personal "Digital Card" webpage as a single HTML response.
//   Includes profile avatar, display name, bio, social links, animated visuals,
//   and interaction features like copy handle, native-app deep links, and gyroscope motion.
//
// How to use:
//   1) Replace all YOUR_* placeholders with your own data.
//      - AVATAR_URL: Host your image (e.g., on GitHub) and reference via jsDelivr.
//      - YOUR_NAME / YOUR_DISPLAY_NAME / YOUR_HANDLE / YOUR_BIO_LINE
//      - Social links: Instagram, Telegram, GitHub, Email.
//   2) Deploy as a Cloudflare Worker.
//
// Notes:
//   - No external build step required; everything is inline.
//   - Three.js and GSAP are loaded via CDN for the animated background and UI transitions.
// -------------------------------------------

export default {
  async fetch(request, env) {
    // === Profile image URL (recommend hosting via GitHub + jsDelivr) ===
    // Example: https://cdn.jsdelivr.net/gh/<YOUR_GITHUB_USERNAME>/<YOUR_REPO>@main/assets/avatar.jpg
    const AVATAR_URL = 'https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/YOUR_REPO@main/assets/avatar.jpg';

    // === Inline HTML payload (single-file Worker) ===
    const html = `<!doctype html>
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Digital Card</title>
<style>
/* ---------- Inline CSS: layout and visuals ---------- */
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Russo+One&display=swap');

/* Base reset and theme colors */
* { margin: 0; padding: 0; box-sizing: border-box; }
:root{
  --neon-cyan: #00ffff;
  --neon-pink: #ff00ff;
  --neon-yellow: #ffff00;
  --neon-green: #00ff00;
  --neon-orange: #ff6600;
  --neon-purple: #9945ff;
}
body{
  font-family: 'Orbitron', monospace;
  background: #000;
  overflow-x: hidden;
  position: relative;
  color: #fff;
}

/* Canvas background + animated grid overlay */
#canvas-bg { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; }
.cyber-grid { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-image: linear-gradient(rgba(0,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.06) 1px, transparent 1px); background-size: 50px 50px; z-index: 2; animation: gridMove 10s linear infinite; pointer-events: none; transform: translate3d(0,0,0); }
@keyframes gridMove { 0% { transform: translate(0,0);} 100% { transform: translate(50px,50px);} }

/* Gyroscope enable button (needed on iOS for permission) */
#gyroEnableBtn {
  position: fixed;
  right: 1rem;
  bottom: 1.6rem;
  z-index: 20000;
  background: linear-gradient(135deg,var(--neon-cyan),var(--neon-pink));
  color: #000;
  padding: 0.6rem 0.9rem;
  border-radius: 14px;
  font-weight: 700;
  font-size: 0.95rem;
  box-shadow: 0 6px 20px rgba(0,0,0,0.4);
  border: none;
  display: none; /* Only shown if permission is required */
}

/* Fullscreen loader */
#loader { position: fixed; width:100%; height:100vh; background:#000; z-index:100000; display:flex; justify-content:center; align-items:center; transition: opacity .6s, visibility .6s; }
.loader-content { text-align:center; color:#fff; }
.loader-dna { width:60px; height:60px; margin:0 auto 18px; position:relative; transform: rotateZ(45deg); }
.loader-dna:before, .loader-dna:after { content:''; position:absolute; inset:0; border-radius:50%; animation: dnaSpinner 2s infinite ease; background: linear-gradient(45deg,var(--neon-cyan),var(--neon-pink)); opacity:0.9; }
.loader-dna:after { animation-delay:-1s; background: linear-gradient(45deg,var(--neon-yellow),var(--neon-purple)); }
@keyframes dnaSpinner { 50% { transform: scale(.35) rotate(360deg); opacity: .4 } 100% { transform: scale(1) rotate(720deg); opacity:1 } }
.loading-text { font-size:1rem; font-weight:700; background: linear-gradient(90deg,var(--neon-cyan),var(--neon-pink)); -webkit-background-clip:text; color:transparent; }

/* Main container and headline */
.main-container { position: relative; z-index: 10; min-height:100vh; display:flex; align-items:center; justify-content:center; padding:2rem; }
.glitch-title { font-size: clamp(2.5rem, 10vw, 6rem); font-weight:900; font-family:'Russo One',sans-serif; text-transform:uppercase; text-align:center; margin-bottom:1.5rem; position:relative; color:#fff; text-shadow: 0 0 10px var(--neon-cyan); }
.cyber-badge { display:inline-block; padding: .8rem 1.6rem; background: linear-gradient(45deg, rgba(0,255,255,0.06), rgba(255,0,255,0.04)); border:2px solid var(--neon-cyan); border-radius:40px; cursor:pointer; transition: transform .18s; }
.cyber-badge:active { transform: scale(.98); }
.cyber-badge-text { font-size:1.1rem; font-weight:700; color:#fff; }

/* Profile section */
.profile {
  text-align: center;
  margin: 18px 0 14px;
  z-index: 12;
}
.avatar {
  width: 110px;
  height: 110px;
  object-fit: cover;
  border-radius: 50%;
  border: 3px solid rgba(0,255,255,0.12);
  box-shadow: 0 8px 30px rgba(0,255,255,0.06);
  display: inline-block;
  margin-bottom: 12px;
}
.profile-name {
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: 0.6px;
  color: #fff;
  margin-bottom: 6px;
}
.profile-bio {
  font-size: 0.95rem;
  color: rgba(255,255,255,0.78);
  margin-bottom: 8px;
}

/* Social cards grid */
.cards-container { display:grid; grid-template-columns: repeat(auto-fit,minmax(240px,1fr)); gap:1.2rem; max-width:1100px; width:100%; margin-top:1.6rem; perspective:1000px; }
.holo-card { position:relative; background: linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01)); border-radius:16px; padding:1.6rem; overflow:hidden; cursor:pointer; min-height:180px; display:flex; flex-direction:column; align-items:center; justify-content:center; transition: transform .36s cubic-bezier(.2,.8,.2,1), box-shadow .36s; }
.holo-card:hover { transform: translateY(-8px); box-shadow: 0 18px 40px rgba(0,255,255,0.06); }

.icon-wrapper { width:80px; height:80px; position:relative; margin-bottom:1rem; border-radius:12px; overflow:hidden; display:flex; align-items:center; justify-content:center; background: linear-gradient(135deg, rgba(0,255,255,0.06), rgba(153,69,255,0.04)); }
.icon-face { font-size:2.4rem; backface-visibility:hidden; z-index:2; position:relative; }
.icon-wrapper::before { content:''; position:absolute; inset:0; z-index:1; pointer-events:none; background: linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(255,255,255,0.06) 40%, rgba(0,0,0,0) 80%); transform: translateX(-120%); animation: iconSweep 3s ease-in-out infinite; mix-blend-mode: screen; }
@keyframes iconSweep { 0% { transform: translateX(-120%); } 50% { transform: translateX(120%); } 100% { transform: translateX(120%); } }

.card-title { font-size:1.05rem; font-weight:700; text-transform:uppercase; -webkit-background-clip:text; color: #fff; }

/* Toast notification */
.toast { position: fixed; top: 1.8rem; left: 50%; transform: translateX(-50%) translateY(-100px); background: linear-gradient(135deg, var(--neon-green), var(--neon-cyan)); color:#000; padding:.8rem 1.2rem; border-radius:40px; font-weight:700; z-index:10001; opacity:0; transition: all .3s; }
.toast.show { transform: translateX(-50%) translateY(0); opacity:1; }

/* Scan line overlay */
.scan-line { position: fixed; top: 0; left: 0; width: 100%; height: 2px; background: linear-gradient(90deg, transparent, var(--neon-cyan), transparent); animation: scan 4s linear infinite; z-index:4; pointer-events:none; }
@keyframes scan { 0% { transform: translateY(0);} 100% { transform: translateY(100vh);} }

/* Responsive adjustments */
@media (max-width:768px) { .glitch-title { font-size:2.6rem; } .icon-wrapper { width:64px; height:64px; } .avatar { width: 88px; height: 88px; } .profile-name { font-size: 1rem; } }
</style>
</head>
<body>
  <!-- Loader screen -->
  <div id="loader">
    <div class="loader-content">
      <div class="loader-dna"></div>
      <div class="loading-text">INITIALIZING QUANTUM MATRIX...</div>
    </div>
  </div>

  <!-- Canvas + overlays -->
  <canvas id="canvas-bg"></canvas>
  <div class="cyber-grid" id="cyberGrid"></div>
  <div class="scan-line"></div>

  <!-- Gyro permission button (iOS) -->
  <button id="gyroEnableBtn" aria-label="Enable device motion">Enable Motion</button>

  <div class="main-container">
    <div style="width:100%;max-width:1100px;">
      <h1 class="glitch-title" data-text="YOUR NAME">YOUR NAME</h1>
      <div style="text-align:center;">
        <div class="cyber-badge" id="cyberBadge"><span class="cyber-badge-text">@YOUR_HANDLE</span></div>
      </div>

      <!-- Profile block -->
      <div class="profile">
        <img src="${AVATAR_URL}" alt="Profile image" class="avatar" loading="lazy">
        <h2 class="profile-name">YOUR_DISPLAY_NAME</h2>
        <p class="profile-bio">YOUR_BIO_LINE</p>
      </div>

      <!-- Social cards -->
      <div class="cards-container">
        <a href="https://instagram.com/YOUR_INSTAGRAM" class="holo-card link-card" data-app="instagram://user?username=YOUR_INSTAGRAM" data-web="https://instagram.com/YOUR_INSTAGRAM" data-hint="instagram">
          <div class="icon-wrapper"><div class="icon-face">📷</div></div>
          <h3 class="card-title">Instagram</h3>
        </a>

        <a href="https://t.me/YOUR_TELEGRAM" class="holo-card link-card" data-app="tg://resolve?domain=YOUR_TELEGRAM" data-web="https://t.me/YOUR_TELEGRAM" data-hint="telegram">
          <div class="icon-wrapper"><div class="icon-face">✈️</div></div>
          <h3 class="card-title">Telegram</h3>
        </a>

        <a href="https://github.com/YOUR_GITHUB_USERNAME" class="holo-card link-card" data-app="github://open?username=YOUR_GITHUB_USERNAME" data-web="https://github.com/YOUR_GITHUB_USERNAME" data-hint="github">
          <div class="icon-wrapper"><div class="icon-face">💻</div></div>
          <h3 class="card-title">GitHub</h3>
        </a>

        <a href="mailto:your.email@example.com" class="holo-card link-card" data-app="mailto:your.email@example.com" data-web="mailto:your.email@example.com" data-hint="email">
          <div class="icon-wrapper"><div class="icon-face">📧</div></div>
          <h3 class="card-title">Email</h3>
        </a>
      </div>
    </div>
  </div>

  <div class="toast" id="toast">Copied! ✅</div>

  <script>
  (function(){
    // CDN URLs for external libraries
    var THREE_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    var GSAP_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';

    // Dynamically load a script; calls cb(err) when done
    function loadScript(src, cb) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = function(){ cb && cb(null); };
      s.onerror = function(){ cb && cb(new Error('load failed: ' + src)); };
      document.head.appendChild(s);
    }

    // Show toast message briefly (used for copy, permission states)
    function showToastOnce(msg) {
      var t = document.getElementById('toast');
      if (!t) return;
      t.textContent = msg || 'Done';
      t.classList.add('show');
      setTimeout(function(){ t.classList.remove('show'); }, 1600);
    }

    // Open a native app via URI; if it fails or is unavailable, fall back to the web URL
    function openAppThenWeb(appUri, webUrl, timeoutMs) {
      timeoutMs = typeof timeoutMs === 'number' ? timeoutMs : 400;
      if (!appUri || appUri === webUrl) {
        window.location.href = webUrl;
        return;
      }
      var fallback = setTimeout(function() { window.location.href = webUrl; }, timeoutMs);
      var handled = false;
      function onVisibilityChange() {
        if (document.visibilityState === 'hidden') {
          handled = true; clearTimeout(fallback); cleanup();
        }
      }
      function onPageHide() { handled = true; clearTimeout(fallback); cleanup(); }
      document.addEventListener('visibilitychange', onVisibilityChange);
      window.addEventListener('pagehide', onPageHide);

      try {
        var ifr = document.createElement('iframe');
        ifr.style.display = 'none';
        ifr.src = appUri;
        document.body.appendChild(ifr);
        setTimeout(function(){ cleanup(); }, 2000);
      } catch(e) {
        clearTimeout(fallback);
        window.location.href = webUrl;
      }

      function cleanup(){ try{ ifr && ifr.remove(); }catch(e){} document.removeEventListener('visibilitychange', onVisibilityChange); window.removeEventListener('pagehide', onPageHide); }
    }

    // Bind click handlers on social cards to prefer native app, fallback to web
    function wireLinks() {
      var links = document.querySelectorAll('.link-card');
      Array.prototype.forEach.call(links, function(a){
        a.addEventListener('click', function(ev){
          ev.preventDefault();
          var appUri = a.getAttribute('data-app');
          var webUrl = a.getAttribute('data-web') || a.href;
          // Special-case mailto: URIs (open directly)
          if ((appUri && appUri.indexOf('mailto:') === 0) || (webUrl && webUrl.indexOf('mailto:') === 0)) {
            window.location.href = webUrl;
            return;
          }
          openAppThenWeb(appUri, webUrl, 400);
        }, false);
      });
    }

    // Copy handle to clipboard when clicking the badge
    var badge = document.getElementById('cyberBadge');
    if (badge) {
      badge.addEventListener('click', function() {
        var text = '@YOUR_HANDLE';
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function(){ showToastOnce('Copied! ✅'); }, function(){ showToastOnce('Copied! ✅'); });
        } else {
          var t = document.createElement('textarea');
          t.value = text; document.body.appendChild(t); t.select();
          try { document.execCommand('copy'); showToastOnce('Copied! ✅'); } catch(e){ showToastOnce('Copy failed'); }
          t.remove();
        }
      }, false);
    }

    // Fallback avatar if the image fails to load
    document.addEventListener('DOMContentLoaded', function(){
      var av = document.querySelector('.avatar');
      if (!av) return;
      av.onerror = function(){ av.src = 'https://via.placeholder.com/150/000000/FFFFFF?text=AVATAR'; };
    });

    // Three.js scene state
    var scene, camera, renderer, particleSystem;
    var mouseX = 0, mouseY = 0;
    var windowHalfX = window.innerWidth / 2;
    var windowHalfY = window.innerHeight / 2;

    // Gyroscope configuration for motion effects
    var gyroConfig = {
      enabled: false,
      useThree: true,
      sensitivity: 0.6,
      lerpFactor: 0.08,
      maxOffset: 120
    };

    var gyroTarget = { x: 0, y: 0 };
    var gyroCurrent = { x: 0, y: 0 };

    // Map device orientation to target offsets
    function handleDeviceOrientation(e) {
      var gamma = e.gamma || 0;
      var beta = e.beta || 0;
      var nx = (gamma / 45) * gyroConfig.sensitivity;
      var ny = (beta / 45) * gyroConfig.sensitivity;
      gyroTarget.x = clamp(nx * gyroConfig.maxOffset, -gyroConfig.maxOffset, gyroConfig.maxOffset);
      gyroTarget.y = clamp(ny * gyroConfig.maxOffset, -gyroConfig.maxOffset, gyroConfig.maxOffset);
    }

    // Clamp helper
    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

    // Request motion permission on iOS (if required); start gyro accordingly
    function requestGyroPermissionIfNeeded(onGranted, onDenied) {
      var needRequest = typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function';
      if (needRequest) {
        DeviceMotionEvent.requestPermission().then(function(result){
          if (result === 'granted') {
            startGyro();
            onGranted && onGranted();
          } else {
            onDenied && onDenied();
          }
        }).catch(function(){ onDenied && onDenied(); });
      } else {
        startGyro();
        onGranted && onGranted();
      }
    }

    // Start gyroscope tracking
    function startGyro() {
      if (gyroConfig.enabled) return;
      gyroConfig.enabled = true;
      if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', handleDeviceOrientation, true);
      }
    }

    // Stop gyroscope tracking
    function stopGyro() {
      gyroConfig.enabled = false;
      window.removeEventListener('deviceorientation', handleDeviceOrientation, true);
    }

    // Apply smoothed gyro offsets to either Three.js camera or the grid overlay
    function applyGyroToScene() {
      gyroCurrent.x += (gyroTarget.x - gyroCurrent.x) * gyroConfig.lerpFactor;
      gyroCurrent.y += (gyroTarget.y - gyroCurrent.y) * gyroConfig.lerpFactor;

      if (typeof camera !== 'undefined' && camera && gyroConfig.useThree && renderer) {
        var offsetX = gyroCurrent.x * 0.6;
        var offsetY = gyroCurrent.y * 0.6;
        camera.position.x += (offsetX - camera.position.x) * 0.06;
        camera.position.y += (offsetY - camera.position.y) * 0.06;
      } else {
        var grid = document.getElementById('cyberGrid');
        if (grid) {
          var tx = gyroCurrent.x * 0.18;
          var ty = gyroCurrent.y * 0.18;
          grid.style.transform = 'translate3d(' + tx + 'px, ' + ty + 'px, 0)';
        }
      }
    }

    // Initialize Three.js scene: particles + random wireframe polyhedra
    function initThree() {
      if (!window.THREE) return;
      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x000000, 0.0008);
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
      camera.position.z = 1000;

      // Particles buffer geometry
      var geometry = new THREE.BufferGeometry();
      var vertices = [];
      var colors = [];
      for (var i = 0; i < 12000; i++) {
        vertices.push(Math.random()*2000 - 1000, Math.random()*2000 - 1000, Math.random()*2000 - 1000);
        colors.push(Math.random(), Math.random(), Math.random());
      }
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

      var material = new THREE.PointsMaterial({ size: 1.6, vertexColors: true, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending });
      particleSystem = new THREE.Points(geometry, material);
      scene.add(particleSystem);

      // Add a few wireframe shapes with random rotation speeds
      var geomArr = [ new THREE.TetrahedronGeometry(90,0), new THREE.OctahedronGeometry(90,0), new THREE.IcosahedronGeometry(90,0) ];
      for (var k = 0; k < 8; k++) {
        var g = geomArr[Math.floor(Math.random()*geomArr.length)];
        var m = new THREE.MeshBasicMaterial({ color: Math.random()*0xffffff, wireframe: true, transparent: true, opacity: 0.15 });
        var mesh = new THREE.Mesh(g, m);
        mesh.position.x = Math.random()*2000 - 1000;
        mesh.position.y = Math.random()*2000 - 1000;
        mesh.position.z = Math.random()*2000 - 1000;
        mesh.rotation.x = Math.random()*2*Math.PI;
        mesh.rotation.y = Math.random()*2*Math.PI;
        mesh.userData = { rotationSpeed: { x: (Math.random()*0.006-0.003), y: (Math.random()*0.006-0.003) } };
        scene.add(mesh);
      }

      // Renderer setup and reactive sizing
      renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas-bg'), antialias: true, alpha: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);

      // Mouse parallax for camera
      document.addEventListener('mousemove', function(e){ mouseX = e.clientX - windowHalfX; mouseY = e.clientY - windowHalfY; }, false);
      window.addEventListener('resize', function(){
        windowHalfX = window.innerWidth / 2; windowHalfY = window.innerHeight / 2;
        camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }, false);
    }

    // Animation loop for particles, wireframes, gyro, and camera parallax
    function animateThree() {
      requestAnimationFrame(animateThree);
      if (particleSystem) { particleSystem.rotation.x += 0.00008; particleSystem.rotation.y += 0.00014; }
      scene.children.forEach(function(child){
        if (child.userData && child.userData.rotationSpeed) {
          child.rotation.x += child.userData.rotationSpeed.x;
          child.rotation.y += child.userData.rotationSpeed.y;
        }
      });

      applyGyroToScene();

      if (camera) {
        camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
        camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);
      }
      if (renderer && camera) renderer.render(scene, camera);
    }

    // Show gyro permission button on iOS; otherwise start gyro if available
    var gyroBtn = document.getElementById('gyroEnableBtn');
    function checkAndShowGyroButtonIfNeeded() {
      var needRequest = typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function';
      if (needRequest && 'ontouchstart' in window) {
        gyroBtn.style.display = 'block';
        gyroBtn.addEventListener('click', function(){
          requestGyroPermissionIfNeeded(function(){ showToastOnce('Motion enabled'); gyroBtn.style.display = 'none'; }, function(){ showToastOnce('Permission denied'); gyroBtn.style.display = 'none'; });
        }, { once:true });
      } else {
        if (window.DeviceOrientationEvent) startGyro();
      }
    }

    // App bootstrap after DOM readiness
    function runApp() {
      wireLinks();
      checkAndShowGyroButtonIfNeeded();

      // Hide loader after short delay
      setTimeout(function(){
        var loader = document.getElementById('loader');
        if (loader) { loader.style.opacity = '0'; loader.style.visibility = 'hidden'; }
      }, 900);

      // Load Three.js and start scene
      loadScript(THREE_CDN, function(){ try { initThree(); animateThree(); } catch(e){ console.warn(e); } });

      // Load GSAP and perform entrance animations (if available)
      loadScript(GSAP_CDN, function(err){
        try {
          if (window.gsap) {
            gsap.from(".glitch-title", { duration: 1.6, y:-80, opacity:0, ease: "power2.out", delay: .6 });
            gsap.from(".cyber-badge", { duration: 1, scale:0.9, opacity:0, ease: "back.out(1.2)", delay: .9 });
            gsap.from(".holo-card", { duration: 0.9, y: 60, opacity: 0, stagger: 0.14, ease: "power3.out", delay: 1.1 });
          }
        } catch(e){ /* safely ignore animation errors */ }
      });
    }

    // Run when DOM is ready
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(runApp, 80);
    } else {
      document.addEventListener('DOMContentLoaded', runApp);
    }
  })();
  </script>
</body>
</html>`; // end HTML

    return new Response(html, {
      headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-cache' }
    });
  }
};