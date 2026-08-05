/**
 * ApexElite Premium Interactive Splash Click Particles
 * High-performance HTML5 Canvas click particle splash effect, preserving the default cursor.
 */
class SplashCursor {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#ccff00';
        this.secondaryColor = '#00ffaa';

        this.init();
    }

    init() {
        // Setup Canvas CSS
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100vw';
        this.canvas.style.height = '100vh';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '999999';
        document.body.appendChild(this.canvas);

        this.resize();
        this.bindEvents();
        this.loop();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());

        // Click splash trigger
        window.addEventListener('mousedown', (e) => {
            this.spawnSplash(e.clientX, e.clientY);
        });
    }

    spawnSplash(x, y) {
        // High density blast on click
        const particleCount = 16;
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
            const speed = Math.random() * 4 + 3;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: Math.random() * 4 + 2,
                color: Math.random() > 0.5 ? this.accentColor : this.secondaryColor,
                alpha: 1,
                decay: Math.random() * 0.02 + 0.012
            });
        }
    }

    loop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and Draw Click Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            
            // Apply slight drag/friction
            p.vx *= 0.96;
            p.vy *= 0.96;
            
            p.alpha -= p.decay;
            p.radius -= 0.05;

            if (p.alpha <= 0 || p.radius <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.alpha;
            this.ctx.fill();
        }

        requestAnimationFrame(() => this.loop());
    }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new SplashCursor());
} else {
    new SplashCursor();
}
