/**
 * 祝你生日快乐 | Galaxy Birthday Animation & Bubu Cake Story Controller
 * Choreography:
 * 1. Galaxy background with fireworks booming into "祝你生日快乐".
 * 2. 2-second pause with all 6 words glowing.
 * 3. 1 word 1 balloon pops in above each character and lifts them to space.
 * 4. Cake layers slide/drop down 1 by 1, candle flame ignites.
 * 5. Bubu waddles in and blows out the candle flame.
 * 6. Bubu brings the cake to the side of the screen and disappears!
 * 7. About 1s pause.
 * 8. Bubu pulls the photo from the left side of the screen into the middle.
 * 9. Reaching the middle: Bubu smiles (^ ^), plays cute sound, and says "祝你生日快乐"!
 */

(function () {
  'use strict';

  // ==========================================================================
  // DOM References & State
  // ==========================================================================
  const galaxyCanvas = document.getElementById('galaxyCanvas');
  const galaxyCtx = galaxyCanvas.getContext('2d');

  const fireworksCanvas = document.getElementById('fireworksCanvas');
  const fireworksCtx = fireworksCanvas.getContext('2d');

  const birthdayContainer = document.getElementById('birthdayContainer');
  const charUnits = Array.from(document.querySelectorAll('.char-unit'));
  
  // Scene 2 Elements: Group A (Cake Scene)
  const storyStage = document.getElementById('storyStage');
  const cakeSceneGroup = document.getElementById('cakeSceneGroup');
  const cakeContainer = document.getElementById('cakeContainer');
  const cakePlate = document.getElementById('cakePlate');
  const cakeBottom = document.getElementById('cakeBottom');
  const cakeFilling = document.getElementById('cakeFilling');
  const cakeTop = document.getElementById('cakeTop');
  const cakeFrosting = document.getElementById('cakeFrosting');
  const cakeCandle = document.getElementById('cakeCandle');
  const candleFlame = document.getElementById('candleFlame');
  const candleGlow = document.getElementById('candleGlow');
  const smokeWisp = document.getElementById('smokeWisp');
  const bubuCake = document.getElementById('bubuCake');
  const bubuCakeImg = document.getElementById('bubuCakeImg');
  const windPuff = document.getElementById('windPuff');
  const duduLaughBubble = document.getElementById('duduLaughBubble');

  // Scene 2 Elements: Group B (Photo Pulling)
  const photoPullGroup = document.getElementById('photoPullGroup');
  const bubuPuller = document.getElementById('bubuPuller');
  const bubuPullerImg = document.getElementById('bubuPullerImg');
  const bubuSpeech = document.getElementById('bubuSpeech');
  const polaroidFrame = document.getElementById('polaroidFrame');

  // Controls & Actions
  const storyActions = document.getElementById('storyActions');
  const makeWishBtn = document.getElementById('makeWishBtn');
  const replayBtn = document.getElementById('replayBtn');
  const quickReplayBtn = document.getElementById('quickReplayBtn');
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const soundIcon = document.getElementById('soundIcon');
  const fontToggleBtn = document.getElementById('fontToggleBtn');
  const interactivePrompt = document.getElementById('interactivePrompt');

  // Wish Modal & Banner Elements
  const wishModalOverlay = document.getElementById('wishModalOverlay');
  const wishCloseBtn = document.getElementById('wishCloseBtn');
  const wishInput = document.getElementById('wishInput');
  const quickWishes = document.getElementById('quickWishes');
  const sendWishBtn = document.getElementById('sendWishBtn');
  const wishBanner = document.getElementById('wishBanner');
  const wishBannerText = document.getElementById('wishBannerText');
  let wishBannerTimeout = null;

  let width = window.innerWidth;
  let height = window.innerHeight;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  let sequenceRunning = false;
  let ambientFireworksInterval = null;
  let activeTimeouts = [];

  function safeTimeout(fn, delay) {
    const t = setTimeout(fn, delay);
    activeTimeouts.push(t);
    return t;
  }

  function clearAllTimeouts() {
    activeTimeouts.forEach(t => clearTimeout(t));
    activeTimeouts = [];
  }

  // Font options
  const fontOptions = [
    { name: '俏皮', family: "'ZCOOL KuaiLe', sans-serif" },
    { name: '行书', family: "'Ma Shan Zheng', cursive" },
    { name: '现代', family: "'Noto Sans SC', sans-serif" }
  ];
  let currentFontIndex = 0;

  // ==========================================================================
  // Resize Handler
  // ==========================================================================
  function resizeCanvases() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    galaxyCanvas.width = width * dpr;
    galaxyCanvas.height = height * dpr;
    galaxyCanvas.style.width = width + 'px';
    galaxyCanvas.style.height = height + 'px';
    galaxyCtx.scale(dpr, dpr);

    fireworksCanvas.width = width * dpr;
    fireworksCanvas.height = height * dpr;
    fireworksCanvas.style.width = width + 'px';
    fireworksCanvas.style.height = height + 'px';
    fireworksCtx.scale(dpr, dpr);

    initStars();
  }

  window.addEventListener('resize', resizeCanvases);

  // ==========================================================================
  // Galaxy Starfield & Meteor Engine
  // ==========================================================================
  let stars = [];

  class Star {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 1.8 + 0.4;
      this.baseAlpha = Math.random() * 0.7 + 0.2;
      this.alpha = this.baseAlpha;
      this.twinkleSpeed = Math.random() * 0.03 + 0.01;
      this.twinklePhase = Math.random() * Math.PI * 2;
      
      const colors = ['#ffffff', '#e8f4ff', '#fff4d9', '#d4e8ff'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
      this.twinklePhase += this.twinkleSpeed;
      this.alpha = this.baseAlpha + Math.sin(this.twinklePhase) * 0.3;
      if (this.alpha < 0.1) this.alpha = 0.1;
      if (this.alpha > 1) this.alpha = 1;
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.shadowBlur = this.size > 1.2 ? 6 : 0;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function initStars() {
    stars = [];
    const count = Math.min(Math.floor((width * height) / 4500), 220);
    for (let i = 0; i < count; i++) {
      stars.push(new Star());
    }
  }

  let meteors = [];

  class Meteor {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width * 0.8 + width * 0.1;
      this.y = Math.random() * height * 0.4;
      this.length = Math.random() * 80 + 50;
      this.speed = Math.random() * 7 + 9;
      this.angle = (Math.PI / 180) * (Math.random() * 25 + 30);
      this.vx = Math.cos(this.angle) * this.speed;
      this.vy = Math.sin(this.angle) * this.speed;
      this.alpha = 1;
      this.decay = Math.random() * 0.02 + 0.015;
      this.alive = true;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.decay;
      if (this.alpha <= 0 || this.x > width || this.y > height) {
        this.alive = false;
      }
    }

    draw(ctx) {
      if (!this.alive) return;
      ctx.save();
      ctx.globalAlpha = this.alpha;
      const tailX = this.x - Math.cos(this.angle) * this.length;
      const tailY = this.y - Math.sin(this.angle) * this.length;

      const grad = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.3, 'rgba(190, 220, 255, 0.7)');
      grad.addColorStop(1, 'rgba(120, 160, 255, 0)');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();
      ctx.restore();
    }
  }

  function spawnMeteorMaybe() {
    if (Math.random() < 0.015 && meteors.length < 2) {
      meteors.push(new Meteor());
    }
  }

  // Brilliant Mega Shooting Star triggered when making a wish
  class MegaMeteor {
    constructor() {
      this.x = width * 0.1;
      this.y = height * 0.05;
      this.length = Math.min(width, height) * 0.55;
      this.speed = 22;
      this.angle = (Math.PI / 180) * 34;
      this.vx = Math.cos(this.angle) * this.speed;
      this.vy = Math.sin(this.angle) * this.speed;
      this.alpha = 1.0;
      this.decay = 0.011;
      this.alive = true;
      this.sparkleTimer = 0;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.decay;

      this.sparkleTimer++;
      if (this.sparkleTimer % 2 === 0 && sparklers.length < 200) {
        sparklers.push(new SparklerParticle(this.x, this.y));
        sparklers.push(new SparklerParticle(this.x - this.vx * 1.5, this.y - this.vy * 1.5));
      }

      if (this.alpha <= 0 || this.x > width * 1.25 || this.y > height * 1.25) {
        this.alive = false;
      }
    }

    draw(ctx) {
      if (!this.alive) return;
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.alpha);
      const tailX = this.x - Math.cos(this.angle) * this.length;
      const tailY = this.y - Math.sin(this.angle) * this.length;

      const grad = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.25, '#ffd700');
      grad.addColorStop(0.6, '#ff6097');
      grad.addColorStop(1, 'rgba(197, 116, 255, 0)');

      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 24;

      ctx.strokeStyle = grad;
      ctx.lineWidth = 5.0;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();

      // Glowing fireball head
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(this.x, this.y, 6.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  // ==========================================================================
  // Fireworks Physics & Particle System
  // ==========================================================================
  let rockets = [];
  let particles = [];
  let confetti = [];
  let shockwaves = [];
  let sparklers = [];

  // Magic Fairy Sparkler Trail Particle (Stars, Hearts, Sparkles)
  class SparklerParticle {
    constructor(x, y) {
      this.x = x + (Math.random() - 0.5) * 8;
      this.y = y + (Math.random() - 0.5) * 8;
      this.vx = (Math.random() - 0.5) * 1.8;
      this.vy = (Math.random() - 0.5) * 1.8 - 0.5;
      this.alpha = 1.0;
      this.decay = Math.random() * 0.025 + 0.018;
      this.size = Math.random() * 8 + 4;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.12;

      const colors = ['#ffd700', '#ff6097', '#fff4d9', '#4ea8ff', '#ff85b3', '#c574ff', '#ffffff'];
      this.color = colors[Math.floor(Math.random() * colors.length)];

      const types = ['star', 'star', 'heart', 'sparkle'];
      this.type = types[Math.floor(Math.random() * types.length)];
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.04;
      this.vx *= 0.98;
      this.rotation += this.rotSpeed;
      this.alpha -= this.decay;
    }

    draw(ctx) {
      if (this.alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 10;

      if (this.type === 'heart') {
        ctx.fillStyle = this.color;
        const s = this.size * 0.55;
        ctx.beginPath();
        ctx.moveTo(0, s * 0.3);
        ctx.bezierCurveTo(-s, -s * 0.6, -s * 1.2, s * 0.4, 0, s * 1.2);
        ctx.bezierCurveTo(s * 1.2, s * 0.4, s, -s * 0.6, 0, s * 0.3);
        ctx.fill();
      } else if (this.type === 'star') {
        // 4-point magical diamond sparkle star
        ctx.fillStyle = this.color;
        const s = this.size;
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.quadraticCurveTo(0, 0, s * 0.25, 0);
        ctx.quadraticCurveTo(0, 0, 0, s);
        ctx.quadraticCurveTo(0, 0, -s * 0.25, 0);
        ctx.quadraticCurveTo(0, 0, 0, -s);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-s, 0);
        ctx.quadraticCurveTo(0, 0, 0, s * 0.25);
        ctx.quadraticCurveTo(0, 0, s, 0);
        ctx.quadraticCurveTo(0, 0, 0, -s * 0.25);
        ctx.quadraticCurveTo(0, 0, -s, 0);
        ctx.fill();
      } else {
        // Glowing stardust orb
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  class Rocket {
    constructor(startX, startY, targetX, targetY, color, onExplode) {
      this.x = startX;
      this.y = startY;
      this.targetX = targetX;
      this.targetY = targetY;
      this.color = color || '#ff6097';
      this.onExplode = onExplode || null;

      const dx = targetX - startX;
      const dy = targetY - startY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const speed = Math.random() * 1.5 + 13.5;

      this.vx = (dx / dist) * speed;
      this.vy = (dy / dist) * speed;
      this.trail = [];
      this.alive = true;
    }

    update() {
      if (Math.random() < 0.8) {
        this.trail.push({
          x: this.x + (Math.random() * 4 - 2),
          y: this.y + (Math.random() * 4 - 2),
          alpha: 1.0,
          decay: Math.random() * 0.04 + 0.03,
          size: Math.random() * 2.2 + 1.2,
          vx: (Math.random() - 0.5) * 1.2,
          vy: Math.random() * 1.5 + 0.5
        });
      }

      for (let i = this.trail.length - 1; i >= 0; i--) {
        const pt = this.trail[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.alpha -= pt.decay;
        if (pt.alpha <= 0) {
          this.trail.splice(i, 1);
        }
      }

      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.035;

      if (this.y <= this.targetY || (this.vy >= 0 && this.y < height * 0.8)) {
        this.explode();
      }
    }

    explode() {
      this.alive = false;
      createExplosion(this.targetX, this.targetY, this.color);
      if (this.onExplode) {
        this.onExplode(this.targetX, this.targetY);
      }
    }

    draw(ctx) {
      for (let i = 0; i < this.trail.length; i++) {
        const pt = this.trail[i];
        ctx.save();
        ctx.globalAlpha = Math.max(pt.alpha, 0);
        ctx.fillStyle = Math.random() < 0.3 ? '#ffffff' : this.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 16;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 3.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = this.color;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  class Particle {
    constructor(x, y, color, isSparkle = false) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.isSparkle = isSparkle;

      const angle = Math.random() * Math.PI * 2;
      const speed = isSparkle ? (Math.random() * 5 + 1) : (Math.random() * 8 + 2);

      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.gravity = 0.065;
      this.friction = 0.965;
      this.alpha = 1;
      this.decay = Math.random() * 0.018 + 0.012;
      this.size = Math.random() * 2.5 + 1.2;
      this.alive = true;
    }

    update() {
      this.vx *= this.friction;
      this.vy *= this.friction;
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.decay;
      if (this.alpha <= 0) {
        this.alive = false;
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = Math.max(this.alpha, 0);
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  class Shockwave {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.radius = 4;
      this.maxRadius = Math.random() * 40 + 65;
      this.alpha = 0.9;
      this.alive = true;
    }

    update() {
      this.radius += (this.maxRadius - this.radius) * 0.16;
      this.alpha -= 0.045;
      if (this.alpha <= 0 || this.radius >= this.maxRadius - 2) {
        this.alive = false;
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = Math.max(this.alpha, 0);
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 12;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  function createExplosion(x, y, color) {
    if (window.soundEngine) {
      window.soundEngine.playExplosion(1.0 + (Math.random() * 0.4 - 0.2));
    }

    shockwaves.push(new Shockwave(x, y, color));

    const colorPalette = [color, '#ffffff', '#ffe082', color];
    for (let i = 0; i < 85; i++) {
      const pColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      particles.push(new Particle(x, y, pColor));
    }

    for (let i = 0; i < 25; i++) {
      particles.push(new Particle(x, y, '#ffffff', true));
    }
  }

  class ConfettiParticle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = -20 - Math.random() * 50;
      this.size = Math.random() * 8 + 5;
      this.color = ['#ff6097', '#ff944d', '#ffd033', '#4eeb9c', '#4ea8ff', '#c574ff', '#ffffff'][
        Math.floor(Math.random() * 7)
      ];
      this.speedY = Math.random() * 2 + 1.8;
      this.speedX = Math.random() * 1.5 - 0.75;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = Math.random() * 4 - 2;
      this.wobble = Math.random() * 10;
      this.alpha = 1;
    }

    update() {
      this.y += this.speedY;
      this.x += Math.sin(this.wobble) * 0.8 + this.speedX;
      this.wobble += 0.04;
      this.rotation += this.rotationSpeed;
      if (this.y > height + 20) {
        this.reset();
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = 0.9;
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.6);
      ctx.restore();
    }
  }

  function startConfettiShower() {
    confetti = [];
    for (let i = 0; i < 65; i++) {
      confetti.push(new ConfettiParticle());
    }
  }

  // ==========================================================================
  // Main Animation Loop
  // ==========================================================================
  function animate() {
    galaxyCtx.clearRect(0, 0, width, height);

    for (let i = 0; i < stars.length; i++) {
      stars[i].update();
      stars[i].draw(galaxyCtx);
    }

    spawnMeteorMaybe();
    for (let i = meteors.length - 1; i >= 0; i--) {
      meteors[i].update();
      meteors[i].draw(galaxyCtx);
      if (!meteors[i].alive) {
        meteors.splice(i, 1);
      }
    }

    fireworksCtx.clearRect(0, 0, width, height);

    for (let i = rockets.length - 1; i >= 0; i--) {
      rockets[i].update();
      rockets[i].draw(fireworksCtx);
      if (!rockets[i].alive) {
        rockets.splice(i, 1);
      }
    }

    for (let i = shockwaves.length - 1; i >= 0; i--) {
      shockwaves[i].update();
      shockwaves[i].draw(fireworksCtx);
      if (!shockwaves[i].alive) {
        shockwaves.splice(i, 1);
      }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw(fireworksCtx);
      if (!particles[i].alive) {
        particles.splice(i, 1);
      }
    }

    if (confetti.length > 0) {
      for (let i = 0; i < confetti.length; i++) {
        confetti[i].update();
        confetti[i].draw(fireworksCtx);
      }
    }

    for (let i = sparklers.length - 1; i >= 0; i--) {
      sparklers[i].update();
      sparklers[i].draw(fireworksCtx);
      if (sparklers[i].alpha <= 0) {
        sparklers.splice(i, 1);
      }
    }

    requestAnimationFrame(animate);
  }

  function launchFirework(targetX, targetY, color = null, onExplode = null) {
    if (window.soundEngine) {
      window.soundEngine.playLaunch();
    }
    const startX = targetX + (Math.random() * 60 - 30);
    const startY = height + 10;
    const rocket = new Rocket(startX, startY, targetX, targetY, color, onExplode);
    rockets.push(rocket);
  }

  // ==========================================================================
  // Sequence Reset Logic
  // ==========================================================================
  function resetAll() {
    sequenceRunning = false;
    clearAllTimeouts();

    if (ambientFireworksInterval) {
      clearInterval(ambientFireworksInterval);
      ambientFireworksInterval = null;
    }

    confetti = [];
    sparklers = [];
    if (wishBanner) wishBanner.classList.remove('active');
    if (wishModalOverlay) wishModalOverlay.classList.remove('active');

    // Reset Scene 1 (Characters & Balloons)
    birthdayContainer.style.opacity = '1';
    birthdayContainer.style.pointerEvents = 'none';

    charUnits.forEach((unit) => {
      unit.classList.remove('flying');
      unit.style.animation = 'none';
      void unit.offsetHeight;
      unit.style.animation = '';

      const letter = unit.querySelector('.char-letter');
      const balloon = unit.querySelector('.balloon-container');
      const aura = unit.querySelector('.char-glow-aura');

      letter.classList.remove('char-visible');
      balloon.classList.remove('balloon-active');
      aura.classList.remove('aura-flash');
    });

    // Reset Scene 2 Group A (Cake Scene) & Group B (Photo Pulling) immediately
    storyStage.style.transition = 'none';
    storyStage.classList.remove('active');
    cakeSceneGroup.style.transition = 'none';
    cakeSceneGroup.classList.remove('carry-away');
    photoPullGroup.style.transition = 'none';
    photoPullGroup.classList.remove('pulling-in');

    void storyStage.offsetHeight;
    storyStage.style.transition = '';
    cakeSceneGroup.style.transition = '';
    photoPullGroup.style.transition = '';

    const cakeParts = [cakePlate, cakeBottom, cakeFilling, cakeTop, cakeFrosting, cakeCandle];
    cakeParts.forEach((part) => {
      part.classList.remove('dropped');
    });

    candleFlame.classList.remove('burning');
    candleGlow.classList.remove('active');
    smokeWisp.classList.remove('puff');

    bubuCake.className = 'bubu-character';
    bubuCake.style.left = '-200px';
    bubuCakeImg.src = 'assets/bubu_sym.png';
    windPuff.classList.remove('active');
    if (duduLaughBubble) duduLaughBubble.classList.remove('visible');

    bubuPuller.className = 'bubu-puller';
    bubuPullerImg.src = 'assets/bubu_sym.png';
    bubuSpeech.classList.remove('visible');

    storyActions.classList.remove('visible');
  }

  // ==========================================================================
  // Scene 1: Fireworks & Balloon Lift-off
  // ==========================================================================
  function startSequence() {
    if (sequenceRunning) return;
    sequenceRunning = true;
    resetAll();

    if (interactivePrompt) {
      interactivePrompt.classList.add('hidden');
    }

    if (window.soundEngine) {
      window.soundEngine.resume();
    }

    const totalChars = charUnits.length;
    let currentCharIndex = 0;

    function revealNextCharacter() {
      if (currentCharIndex >= totalChars) {
        onAllWordsRevealed();
        return;
      }

      const unit = charUnits[currentCharIndex];
      const color = unit.getAttribute('data-color') || '#ff6097';
      const letter = unit.querySelector('.char-letter');
      const letterRect = letter ? letter.getBoundingClientRect() : unit.getBoundingClientRect();
      const targetX = letterRect.left + letterRect.width / 2;
      const targetY = letterRect.top + letterRect.height / 2;

      launchFirework(targetX, targetY, color, () => {
        const aura = unit.querySelector('.char-glow-aura');

        if (letter) letter.classList.add('char-visible');
        if (aura) aura.classList.add('aura-flash');

        if (navigator.vibrate) {
          navigator.vibrate(30);
        }
      });

      currentCharIndex++;
      safeTimeout(revealNextCharacter, 380);
    }

    safeTimeout(revealNextCharacter, 250);
  }

  function onAllWordsRevealed() {
    safeTimeout(() => {
      launchFirework(width * 0.18, height * 0.22, '#ff944d');
    }, 450);

    safeTimeout(() => {
      launchFirework(width * 0.82, height * 0.20, '#4ea8ff');
    }, 1000);

    // Wait 2.0 seconds after all words and date appear
    safeTimeout(() => {
      showBalloons();
    }, 2000);
  }

  function showBalloons() {
    charUnits.forEach((unit, idx) => {
      safeTimeout(() => {
        const balloon = unit.querySelector('.balloon-container');
        if (balloon) balloon.classList.add('balloon-active');

        if (window.soundEngine) {
          window.soundEngine.playBalloonPop(idx);
        }
      }, idx * 90);
    });

    safeTimeout(() => {
      liftOffBalloons();
    }, 2200);
  }

  function liftOffBalloons() {
    charUnits.forEach((unit) => {
      unit.classList.add('flying');
    });

    // As balloons disappear into space, trigger Scene 2: Cake Story
    safeTimeout(() => {
      birthdayContainer.style.opacity = '0';
      startCakeStory();
    }, 4800);
  }

  // ==========================================================================
  // Scene 2: Cake Drop -> Bubu Blows Candle -> Bubu Carries Cake Away ->
  //          Pause 1s -> Bubu Pulls Photo into Middle & Says 祝你生日快乐!
  // ==========================================================================
  function startCakeStory() {
    storyStage.classList.add('active');

    // 1. Drop Cake layers 1 by 1 from top to bottom
    const cakeDrops = [
      { el: cakePlate, delay: 150, sound: 0 },
      { el: cakeBottom, delay: 550, sound: 1 },
      { el: cakeFilling, delay: 950, sound: 2 },
      { el: cakeTop, delay: 1350, sound: 3 },
      { el: cakeFrosting, delay: 1750, sound: 4 },
      { el: cakeCandle, delay: 2200, sound: 5 }
    ];

    cakeDrops.forEach(item => {
      safeTimeout(() => {
        item.el.classList.add('dropped');
        if (window.soundEngine) {
          window.soundEngine.playCakeDrop(item.sound);
        }
      }, item.delay);
    });

    // 2. Light up candle flame
    safeTimeout(() => {
      candleFlame.classList.add('burning');
      candleGlow.classList.add('active');
      if (window.soundEngine) {
        window.soundEngine.playFlameIgnite();
      }

      // Sparkle burst around candle flame
      const candleRect = cakeCandle.getBoundingClientRect();
      const fx = candleRect.left + candleRect.width / 2;
      const fy = candleRect.top - 20;
      for (let i = 0; i < 20; i++) {
        particles.push(new Particle(fx, fy, '#ffe082', true));
      }

      // After flame is burning, Bubu approaches!
      safeTimeout(bubuApproachesCake, 1000);
    }, 2800);
  }

  // 3. Bubu waddles in from the left towards the cake
  function bubuApproachesCake() {
    bubuCake.classList.add('walking');
    bubuCakeImg.src = 'assets/bubu_sym.png';

    const isMobile = width < 600;
    const targetLeft = isMobile ? 'calc(50% - 150px)' : 'calc(50% - 210px)';
    bubuCake.style.left = targetLeft;

    safeTimeout(() => {
      bubuCake.classList.remove('walking');

      // Bubu leans towards candle to blow
      safeTimeout(bubuBlowsCandle, 600);
    }, 1300);
  }

  // 4. Bubu blows out the candle flame
  function bubuBlowsCandle() {
    bubuCake.classList.add('blowing');
    bubuCakeImg.src = 'assets/bubu_blow.png';

    safeTimeout(() => {
      // Wind puff shoots across to the flame
      windPuff.classList.add('active');
      if (window.soundEngine) {
        window.soundEngine.playBlowWind();
      }

      safeTimeout(() => {
        // Flame extinguished!
        candleFlame.classList.remove('burning');
        candleGlow.classList.remove('active');
        smokeWisp.classList.add('puff');
        if (window.soundEngine) {
          window.soundEngine.playFlameExtinguish();
        }

        // Bubu cheers joyfully and laughs!
        safeTimeout(() => {
          bubuCake.classList.remove('blowing');
          bubuCake.classList.add('cheering');
          bubuCakeImg.src = 'assets/bubu_smile.png';

          // Play Dudu's laughter sound!
          if (window.soundEngine) {
            window.soundEngine.playDuduLaugh();
          }

          // Show cute laughing bubble reaction!
          if (duduLaughBubble) {
            duduLaughBubble.classList.add('visible');
          }

          // Hide laugh bubble before carrying cake
          safeTimeout(() => {
            if (duduLaughBubble) {
              duduLaughBubble.classList.remove('visible');
            }
          }, 1400);

          // After laughing happily, Bubu brings the cake to the side and disappears!
          safeTimeout(bubuCarriesCakeAway, 1600);
        }, 600);

      }, 400);

    }, 350);
  }

  // 5. Bubu brings the cake to the side of the screen and disappears!
  function bubuCarriesCakeAway() {
    bubuCake.classList.remove('cheering');
    bubuCake.classList.add('walking');
    bubuCakeImg.src = 'assets/bubu_sym.png';

    // Bubu moves closer to carry/push the cake
    const isMobile = width < 600;
    bubuCake.style.left = isMobile ? 'calc(50% - 130px)' : 'calc(50% - 160px)';

    // Smoothly slide both Bubu and the Cake off-screen to the right!
    safeTimeout(() => {
      cakeSceneGroup.classList.add('carry-away');

      // Wait about 1.8s for them to exit completely, then wait 1.0s before pulling the photo
      safeTimeout(() => {
        // "and about 1s bubu hold or pull this photo from the left side screen to the middle"
        safeTimeout(bubuPullsPhotoIn, 1000);
      }, 1800);

    }, 350);
  }

  // 6. Bubu pulls the photo from the left side of the screen into the middle!
  function bubuPullsPhotoIn() {
    // Start pulling photo from left off-screen to center
    photoPullGroup.classList.add('pulling-in');
    bubuPuller.classList.add('walking');
    bubuPullerImg.src = 'assets/bubu_sym.png';

    // Takes 2.2s to reach the middle
    safeTimeout(() => {
      // Reached the middle!
      bubuPuller.classList.remove('walking');

      // Bubu smiles happily (^ ^)
      bubuPullerImg.src = 'assets/bubu_smile.png';

      // Play Dudu speaking "祝你生日快乐!" (Voice + Chimes)
      if (window.soundEngine) {
        window.soundEngine.playDuduGreeting();
      }

      // Bubu says "祝你生日快乐 ✨💖"!
      safeTimeout(() => {
        bubuSpeech.classList.add('visible');
      }, 250);

      // Play gentle Happy Birthday background melody after Dudu finishes speaking
      safeTimeout(() => {
        if (window.soundEngine) {
          window.soundEngine.playBirthdaySong();
        }
      }, 2400);

      // Start celebratory confetti shower
      startConfettiShower();

      // Show bottom action bar (Replay button)
      safeTimeout(() => {
        storyActions.classList.add('visible');
      }, 1000);

      // Ambient fireworks celebrating softly in the starry sky
      if (ambientFireworksInterval) clearInterval(ambientFireworksInterval);
      ambientFireworksInterval = setInterval(() => {
        const rx = Math.random() * (width * 0.8) + width * 0.1;
        const ry = Math.random() * (height * 0.38) + height * 0.1;
        const palette = ['#ff6097', '#ff944d', '#ffd033', '#4eeb9c', '#4ea8ff', '#c574ff'];
        const color = palette[Math.floor(Math.random() * palette.length)];
        launchFirework(rx, ry, color);
      }, 1800);

    }, 2200);
  }

  // ==========================================================================
  // User Interactions & Controls
  // ==========================================================================
  function handleScreenClick(e) {
    if (e.target.closest('button') || e.target.closest('.polaroid-frame') || e.target.closest('.wish-modal-card') || e.target.closest('.wish-tag') || e.target.closest('textarea')) {
      return;
    }

    if (window.soundEngine) {
      window.soundEngine.resume();
    }

    if (!sequenceRunning) {
      startSequence();
      return;
    }

    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : width / 2);
    const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : height / 2);

    const palette = ['#ff6097', '#ff944d', '#ffd033', '#4eeb9c', '#4ea8ff', '#c574ff', '#ffffff'];
    const color = palette[Math.floor(Math.random() * palette.length)];
    launchFirework(clientX, clientY, color);
  }

  // ==========================================================================
  // Magic Fairy Sparkler Trail on Movement / Touch
  // ==========================================================================
  let lastSparkleTime = 0;
  function handleSparklerMove(clientX, clientY) {
    const now = performance.now();
    if (now - lastSparkleTime < 16) return;
    lastSparkleTime = now;

    if (sparklers.length < 160) {
      sparklers.push(new SparklerParticle(clientX, clientY));
      if (Math.random() < 0.6) {
        sparklers.push(new SparklerParticle(clientX, clientY));
      }
    }
  }

  window.addEventListener('pointermove', (e) => {
    if (e.target.closest('button') || e.target.closest('.wish-modal-card') || e.target.closest('textarea')) return;
    handleSparklerMove(e.clientX, e.clientY);
  }, { passive: true });

  // ==========================================================================
  // Make a Wish Feature & Handlers
  // ==========================================================================
  function openWishModal() {
    if (window.soundEngine) {
      window.soundEngine.resume();
    }
    if (wishModalOverlay) {
      wishModalOverlay.classList.add('active');
      safeTimeout(() => {
        if (wishInput) wishInput.focus();
      }, 350);
    }
  }

  function closeWishModal() {
    if (wishModalOverlay) {
      wishModalOverlay.classList.remove('active');
    }
  }

  function triggerWish() {
    closeWishModal();

    const userWish = wishInput ? (wishInput.value || '').trim() : '';
    if (wishInput) wishInput.value = '';

    // Play heavenly celestial wish chime
    if (window.soundEngine) {
      window.soundEngine.playWishChime();
    }

    // Launch spectacular Mega Shooting Star across galaxy
    meteors.push(new MegaMeteor());

    // Launch celebratory fireworks honoring the wish
    safeTimeout(() => {
      launchFirework(width * 0.28, height * 0.22, '#ffd700');
    }, 280);
    safeTimeout(() => {
      launchFirework(width * 0.72, height * 0.20, '#ff6097');
    }, 620);
    safeTimeout(() => {
      launchFirework(width * 0.50, height * 0.16, '#c574ff');
    }, 980);

    // Star & heart confetti cascade
    startConfettiShower();

    // Show cosmic confirmation banner
    if (wishBanner && wishBannerText) {
      if (wishBannerTimeout) clearTimeout(wishBannerTimeout);
      wishBannerText.textContent = userWish
        ? `🌟 你的愿望「${userWish}」已送达银河，愿你所愿皆成真 ✨💖`
        : '🌟 愿望已送达浩瀚银河，愿你所愿皆成真 ✨💖';
      wishBanner.classList.add('active');

      wishBannerTimeout = setTimeout(() => {
        wishBanner.classList.remove('active');
      }, 5000);
    }
  }

  if (makeWishBtn) {
    makeWishBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openWishModal();
    });
  }

  if (wishCloseBtn) {
    wishCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeWishModal();
    });
  }

  if (wishModalOverlay) {
    wishModalOverlay.addEventListener('click', (e) => {
      if (e.target === wishModalOverlay) {
        closeWishModal();
      }
    });
  }

  if (sendWishBtn) {
    sendWishBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerWish();
    });
  }

  if (quickWishes && wishInput) {
    quickWishes.addEventListener('click', (e) => {
      const tag = e.target.closest('.wish-tag');
      if (!tag) return;
      const text = tag.getAttribute('data-wish');
      if (text) {
        wishInput.value = text;
        tag.style.transform = 'scale(1.12)';
        setTimeout(() => { tag.style.transform = ''; }, 200);
      }
    });
  }

  // Instant audio unlock on ANY first tap/click anywhere (satisfies mobile browser autoplay policy)
  const unlockAudio = () => {
    if (window.soundEngine) {
      window.soundEngine.resume();
    }
  };
  window.addEventListener('pointerdown', unlockAudio, { once: true });
  window.addEventListener('touchstart', unlockAudio, { once: true });
  window.addEventListener('click', unlockAudio, { once: true });

  window.addEventListener('click', handleScreenClick);
  window.addEventListener('touchstart', (e) => {
    if (!e.target.closest('button')) {
      handleScreenClick(e);
    }
  }, { passive: true });

  replayBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    startSequence();
  });

  quickReplayBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    startSequence();
  });

  soundToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (window.soundEngine) {
      window.soundEngine.resume();
      const isSoundOn = window.soundEngine.toggleSound();
      soundIcon.textContent = isSoundOn ? '🔊' : '🔇';
      soundToggleBtn.querySelector('.btn-text').textContent = isSoundOn ? '音效' : '静音';
    }
  });

  fontToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentFontIndex = (currentFontIndex + 1) % fontOptions.length;
    const font = fontOptions[currentFontIndex];
    document.body.style.fontFamily = font.family;
    fontToggleBtn.querySelector('.btn-text').textContent = `字体: ${font.name}`;
  });

  // Easter egg: click Bubu to bounce and cheer!
  bubuPuller.addEventListener('click', (e) => {
    e.stopPropagation();
    bubuPuller.classList.add('cheering');
    bubuSpeech.classList.add('visible');
    launchFirework(width * 0.45, height * 0.28, '#ff6097');
    setTimeout(() => {
      bubuPuller.classList.remove('cheering');
    }, 1200);
  });

  // Easter egg: click photo to show love and celebration sparkles
  polaroidFrame.addEventListener('click', (e) => {
    e.stopPropagation();
    launchFirework(width * 0.5, height * 0.25, '#ffd033');
    launchFirework(width * 0.35, height * 0.3, '#ff6097');
    launchFirework(width * 0.65, height * 0.3, '#c574ff');
    if (window.soundEngine) {
      window.soundEngine.playFlameIgnite();
    }
  });

  // ==========================================================================
  // Initialization
  // ==========================================================================
  resizeCanvases();
  animate();

  const autoStartTimer = setTimeout(() => {
    if (!sequenceRunning) {
      startSequence();
    }
  }, 1200);

  window.addEventListener('click', () => {
    clearTimeout(autoStartTimer);
  }, { once: true });

})();
