(function() {
      // loader
      window.addEventListener('load', () => {
        const loader = document.getElementById('loader');
        setTimeout(() => {
          if(loader) {
            loader.style.opacity = '0';
            loader.style.visibility = 'hidden';
          }
        }, 800);
      });

      // Particles + mouse interaction + floating orbs
      const canvas = document.getElementById('particle-canvas');
      let ctx = canvas.getContext('2d');
      let particles = [];
      let mouseX = 0, mouseY = 0;
      
      function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      window.addEventListener('resize', resizeCanvas);
      resizeCanvas();

      class Particle {
        constructor() {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
          this.radius = Math.random() * 2 + 1;
          this.speedX = (Math.random() - 0.5) * 0.4;
          this.speedY = (Math.random() - 0.5) * 0.2;
          this.alpha = Math.random() * 0.5 + 0.2;
        }
        update() {
          this.x += this.speedX;
          this.y += this.speedY;
          if(this.x < 0) this.x = canvas.width;
          if(this.x > canvas.width) this.x = 0;
          if(this.y < 0) this.y = canvas.height;
          if(this.y > canvas.height) this.y = 0;
          // mouse influence
          const dx = mouseX - this.x;
          const dy = mouseY - this.y;
          const dist = Math.hypot(dx, dy);
          if(dist < 120) {
            const angle = Math.atan2(dy, dx);
            const force = (120 - dist) / 120 * 0.8;
            this.x -= Math.cos(angle) * force;
            this.y -= Math.sin(angle) * force;
          }
        }
        draw() {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
          ctx.fillStyle = `rgba(100, 150, 255, ${this.alpha * 0.6})`;
          ctx.fill();
        }
      }
      for(let i=0; i<120; i++) particles.push(new Particle());
      
      function animateParticles() {
        if(!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
          p.update();
          p.draw();
        });
        requestAnimationFrame(animateParticles);
      }
      animateParticles();
      
      document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      });
      
      // Intersection Observer for fade-up, blur reveal and progress bars
      const fadeElements = document.querySelectorAll('.fade-up');
      const blurElements = document.querySelectorAll('.blur-reveal');
      
      const observerOptions = { threshold: 0.2, rootMargin: "0px 0px -50px 0px" };
      const appearObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if(entry.isIntersecting) {
            entry.target.classList.add('visible');
            appearObserver.unobserve(entry.target);
          }
        });
      }, observerOptions);
      
      fadeElements.forEach(el => appearObserver.observe(el));
      blurElements.forEach(el => appearObserver.observe(el));
      
      // Progress fill animation with counter
      const progressFills = document.querySelectorAll('.progress-fill');
      let animatedProgress = false;
      const progressObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if(entry.isIntersecting && !animatedProgress) {
            animatedProgress = true;
            progressFills.forEach(fill => {
              const target = parseInt(fill.getAttribute('data-target'));
              let current = 0;
              const fillWidth = () => {
                if(current <= target) {
                  fill.style.width = current + '%';
                  current++;
                  requestAnimationFrame(fillWidth);
                } else {
                  fill.style.width = target + '%';
                }
              };
              fillWidth();
              // update label numbers
              const parent = fill.closest('.progress-item');
              const labelSpan = parent.querySelector('.progress-label span:last-child');
              let num = 0;
              const interval = setInterval(() => {
                if(num <= target) {
                  labelSpan.innerText = num + '%';
                  num++;
                } else {
                  clearInterval(interval);
                }
              }, 12);
            });
            progressObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      const progressSection = document.querySelector('#progress');
      if(progressSection) progressObserver.observe(progressSection);
      
      // parallax effect (mouse movement on hero and cards)
      const heroSection = document.querySelector('.hero');
      document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth) - 0.5;
        const y = (e.clientY / window.innerHeight) - 0.5;
        if(heroSection) {
          heroSection.style.transform = `translate(${x * 8}px, ${y * 5}px)`;
        }
        const cards = document.querySelectorAll('.motivation-card');
        cards.forEach((card, idx) => {
          const speed = 0.03 * (idx+1);
          card.style.transform = `translate(${x * 6 * speed}px, ${y * 4 * speed}px)`;
        });
      });
      
      // smooth inertia scrolling + additional cinematic blur transitions on scroll
      const sections = document.querySelectorAll('section');
      const navLinks = document.querySelectorAll('.nav-links a');
      window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
          const sectionTop = section.offsetTop;
          if(pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
          }
        });
        navLinks.forEach(link => {
          link.style.opacity = '0.7';
          if(link.getAttribute('href') === `#${current}`) {
            link.style.opacity = '1';
            link.style.color = '#0a84ff';
          } else {
            link.style.color = '#f5f5f7';
          }
        });
        // subtle parallax for quote
        const quoteSec = document.querySelector('.cinematic-quote');
        if(quoteSec) {
          const scrolled = window.scrollY;
          quoteSec.style.backgroundPositionY = `${scrolled * 0.15}px`;
        }
      });
      
      // scroll snap overshoot prevention, dynamic nav background
      const nav = document.querySelector('nav');
      window.addEventListener('scroll', () => {
        if(window.scrollY > 50) {
          nav.style.backgroundColor = 'rgba(5,5,5,0.85)';
          nav.style.backdropFilter = 'blur(24px)';
        } else {
          nav.style.backgroundColor = 'rgba(5,5,5,0.6)';
        }
      });
      
      // Add floating glow movement replicating mouse-move parallax glow
      const glows = document.querySelectorAll('.floating-glow');
      document.addEventListener('mousemove', (e) => {
        const xPercent = e.clientX / window.innerWidth;
        const yPercent = e.clientY / window.innerHeight;
        glows.forEach((glow, index) => {
          const moveX = (xPercent - 0.5) * 40;
          const moveY = (yPercent - 0.5) * 30;
          glow.style.transform = `translate(${moveX * (index+1) * 0.6}px, ${moveY * (index+1) * 0.5}px)`;
        });
      });
      
      // extra text animation on load for quote
      const quoteDiv = document.querySelector('.quote-text');
      if(quoteDiv) quoteDiv.classList.add('visible');
      
      // button click CTA
      const startBtn = document.getElementById('start-journey');
      if(startBtn) {
        startBtn.addEventListener('click', (e) => {
          e.preventDefault();
          document.querySelector('#about').scrollIntoView({ behavior: 'smooth' });
        });
      }
      const keepClimb = document.querySelector('.final-cta .btn');
      if(keepClimb) {
        keepClimb.addEventListener('click', (e) => {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      }
      
      // animate labels for progress also on scroll, but fallback handled above
      // Add trailing effect to headings
      console.log('THE CLIMB — cinematic experience active');
    })();
