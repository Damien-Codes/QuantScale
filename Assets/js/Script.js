// Effet de fond "antigravity" (particules)
(function () {
    const canvas = document.getElementById('canvas-bg');
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const PARTICLE_COUNT = 80;
    const MAX_DIST = 180;
    const REPULSION_RADIUS = 120;
    const REPULSION_FORCE = 0.3;
    let mouse = { x: null, y: null, active: false };

    function initParticles() {
        particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1.5,
                color: `rgba(0, 255, 136, ${Math.random() * 0.3 + 0.2})`
            });
        }
    }

    function updateParticles() {
        for (let p of particles) {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > width) {
                p.vx *= -0.9;
                p.x = Math.min(Math.max(p.x, 0), width);
            }
            if (p.y < 0 || p.y > height) {
                p.vy *= -0.9;
                p.y = Math.min(Math.max(p.y, 0), height);
            }

            if (mouse.active && mouse.x !== null && mouse.y !== null) {
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < REPULSION_RADIUS) {
                    const force = (REPULSION_RADIUS - dist) / REPULSION_RADIUS * REPULSION_FORCE;
                    const angle = Math.atan2(dy, dx);
                    p.vx += Math.cos(angle) * force;
                    p.vy += Math.sin(angle) * force;
                }
            }

            const maxSpeed = 1.2;
            if (Math.abs(p.vx) > maxSpeed) p.vx = Math.sign(p.vx) * maxSpeed;
            if (Math.abs(p.vy) > maxSpeed) p.vy = Math.sign(p.vy) * maxSpeed;
        }
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);

        ctx.strokeStyle = 'rgba(0, 255, 136, 0.15)';
        ctx.lineWidth = 1;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const p1 = particles[i];
                const p2 = particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MAX_DIST) {
                    const opacity = (1 - dist / MAX_DIST) * 0.5;
                    ctx.strokeStyle = `rgba(0, 255, 136, ${opacity})`;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        }

        for (let p of particles) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
            ctx.shadowColor = '#00ff88';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    function animate() {
        updateParticles();
        draw();
        requestAnimationFrame(animate);
    }

    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        initParticles();
    }

    function onMouseMove(e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;
    }

    function onMouseLeave() {
        mouse.active = false;
    }

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);

    resizeCanvas();
    animate();
})();

// Simulateur interactif
(function () {
    // Éléments du DOM
    const capitalInput = document.getElementById('capital');
    const riskPercentInput = document.getElementById('riskPercent');
    const entryInput = document.getElementById('entryPrice');
    const stopInput = document.getElementById('stopPrice');
    const tpInput = document.getElementById('tpPrice');

    const assetForex = document.getElementById('assetForex');
    const assetCrypto = document.getElementById('assetCrypto');
    const assetCommodity = document.getElementById('assetCommodity');
    const assetButtons = [assetForex, assetCrypto, assetCommodity];
    const tickIndicator = document.getElementById('tickIndicator');

    const rrSpan = document.getElementById('rrRatio');
    const positionSizeSpan = document.getElementById('positionSize');
    const positionUnitSpan = document.getElementById('positionUnit');
    const riskAmountSpan = document.getElementById('riskAmount');
    const profitSpan = document.getElementById('profitPotential');
    const slDistanceSpan = document.getElementById('slDistance');

    let currentAsset = 'forex';

    assetButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            assetButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentAsset = this.dataset.asset;
            updateTickIndicator();
            updateCalculator();
        });
    });

    function updateTickIndicator() {
        if (currentAsset === 'forex') {
            tickIndicator.textContent = 'Pip = 0.0001';
        } else if (currentAsset === 'crypto') {
            tickIndicator.textContent = 'Tick = 0.01';
        } else {
            tickIndicator.textContent = 'Point = 0.01';
        }
    }

    function updateCalculator() {
        let capital = parseFloat(capitalInput.value) || 0;
        let riskPercent = parseFloat(riskPercentInput.value) || 0;
        let entry = parseFloat(entryInput.value) || 0;
        let stop = parseFloat(stopInput.value) || 0;
        let tp = parseFloat(tpInput.value) || 0;

        if (entry === stop) stop = entry + 0.0001;

        let riskUSD = capital * (riskPercent / 100);

        let tickSize, pipValuePerLot, unit;

        if (currentAsset === 'forex') {
            tickSize = 0.0001;
            pipValuePerLot = 10;
            unit = 'LOTS';
        } else if (currentAsset === 'crypto') {
            tickSize = 0.01;
            pipValuePerLot = 1;
            unit = 'CONTRATS';
        } else {
            tickSize = 0.01;
            pipValuePerLot = 10;
            unit = 'LOTS (XAU)';
        }

        let slDistance = Math.abs(entry - stop) / tickSize;
        let tpDistance = Math.abs(tp - entry) / tickSize;

        let positionSize = riskUSD / (pipValuePerLot * slDistance);
        positionSize = Math.round(positionSize * 100) / 100;

        let profit = positionSize * pipValuePerLot * tpDistance;
        profit = Math.round(profit * 100) / 100;

        let rr = (profit / riskUSD).toFixed(2);

        positionSizeSpan.textContent = positionSize.toFixed(2);
        positionUnitSpan.textContent = unit;
        riskAmountSpan.textContent = riskUSD.toFixed(2);
        profitSpan.textContent = profit.toFixed(2);
        slDistanceSpan.textContent = slDistance.toFixed(1);
        rrSpan.textContent = rr;
    }

    [capitalInput, riskPercentInput, entryInput, stopInput, tpInput].forEach(input => {
        input.addEventListener('input', updateCalculator);
    });

    updateTickIndicator();
    updateCalculator();
})();