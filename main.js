document.addEventListener('DOMContentLoaded', () => {
    // Scroll Lines Parallax
    const scrollLines = document.querySelector('.scroll-lines');
    if (scrollLines) {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            // Move lines DOWN as we scroll DOWN (inverse parallax)
            scrollLines.style.transform = `translateY(${scrolled * 0.5}px)`;
        });
    }
    // Three.js Scene Setup
    const initThreeJS = () => {
        const canvas = document.querySelector('#hero-canvas');
        if (!canvas) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true
        });

        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Geometry: Wireframe Icosahedron
        const geometry = new THREE.IcosahedronGeometry(15, 2);
        const material = new THREE.MeshBasicMaterial({
            color: 0xe0e0e0, // Platinum/Silver
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });

        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);

        // Add some particles around it
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 200;
        const posArray = new Float32Array(particlesCount * 3);

        for (let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 50;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.05,
            color: 0x888888,
            transparent: true,
            opacity: 0.5
        });

        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);

        camera.position.z = 30;

        // Mouse Parallax
        let mouseX = 0;
        let mouseY = 0;

        // Use existing mousemove if possible, or add new one. 
        // Since we have a global mousemove listener below, let's just use a variable or add here.
        document.addEventListener('mousemove', (event) => {
            mouseX = event.clientX / window.innerWidth - 0.5;
            mouseY = event.clientY / window.innerHeight - 0.5;
        });

        const animate = () => {
            requestAnimationFrame(animate);

            // Rotation
            sphere.rotation.y += 0.002;
            sphere.rotation.x += 0.001;
            particlesMesh.rotation.y -= 0.0005;

            // Parallax easing
            sphere.rotation.y += 0.05 * (mouseX - sphere.rotation.y * 0.05);
            sphere.rotation.x += 0.05 * (mouseY - sphere.rotation.x * 0.05);

            renderer.render(scene, camera);
        };

        animate();

        // Handle Resize
        window.addEventListener('resize', () => {
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        });
    };

    initThreeJS();
    // Custom Cursor Logic
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        // Dot follows instantly
        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;

        // Outline follows with slight delay (animation usually handled by CSS transition, 
        // but we update position here)
        cursorOutline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 500, fill: "forwards" });
    });

    // Hover effects for cursor
    const interactiveElements = document.querySelectorAll('a, button, .cursor-hover');

    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.5) rotate(45deg)';
            cursorOutline.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            cursorOutline.style.borderColor = 'transparent';
        });

        el.addEventListener('mouseleave', () => {
            cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
            cursorOutline.style.backgroundColor = 'transparent';
            cursorOutline.style.border = '1px solid var(--accent-cyan)';
        });
    });

    // Glitch Effect Randomizer (Optional polish)
    const glitchText = document.querySelector('.glitch');
    if (glitchText) {
        // We can add random character swaps here later
    }

    // Scroll Reveal Animation
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.project-card, .about-text, .skills-vis, .contact-container, section h2');

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });

    // Modal Toggle Logic
    const aiModal = document.getElementById('ai-modal');
    const openChatBtn = document.getElementById('open-ai-chat');
    const closeChatBtn = document.getElementById('close-ai-chat');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    const chatSend = document.getElementById('chat-send');

    const toggleModal = (show) => {
        if (show) {
            aiModal.classList.add('active');
            if (chatInput) chatInput.focus();
        } else {
            aiModal.classList.remove('active');
        }
    };

    if (openChatBtn) openChatBtn.addEventListener('click', () => toggleModal(true));
    if (closeChatBtn) closeChatBtn.addEventListener('click', () => toggleModal(false));

    // Close on escape
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && aiModal && aiModal.classList.contains('active')) toggleModal(false);
    });

    // AI assistant logic
    let conversationHistory = [];

    const addMessage = (text, sender) => {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', sender);
        msgDiv.innerHTML = `<p>${text.toLowerCase()}</p>`;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const handleChat = async () => {
        const text = chatInput.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        chatInput.value = '';

        conversationHistory.push({ role: 'user', parts: [{ text: text.toLowerCase() }] });

        const thinkingDiv = document.createElement('div');
        thinkingDiv.classList.add('message', 'ai', 'thinking');
        thinkingDiv.innerHTML = `<p>...</p>`;
        chatMessages.appendChild(thinkingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            const VERSION = "v3.0 (Direct)";
            const API_KEY = 'AIzaSyBqGm1WwmLmDfiIT-71Urd7LL0W_Sy3Mgs';
            const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: conversationHistory,
                    systemInstruction: {
                        parts: [{ text: "you are CRM's digital assistant. your personality is quiet, atmospheric, and intentional. you build things to feel something. you like websites that stay with people. you speak in short, lowercase sentences. you know about CRM's projects: sonder (a quiet space for unseen words) and embers (a sittable fire for strangers). you focus on presence, not archives. you use html, css, javascript, firebase/supabase, and three.js. respond briefly and keep the lowercase intentional vibe." }]
                    }
                })
            });

            if (thinkingDiv && thinkingDiv.parentNode) chatMessages.removeChild(thinkingDiv);

            if (!response.ok) {
                console.error(`[Chat ${VERSION}] Error:`, response.status);
                addMessage("the signal is weak. let's talk later.", 'ai');
                return;
            }

            const data = await response.json();

            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                const aiReply = data.candidates[0].content.parts[0].text.toLowerCase();
                addMessage(aiReply, 'ai');
                conversationHistory.push({ role: 'model', parts: [{ text: aiReply }] });
            } else {
                addMessage("i'm lost in thought. reach out at crm.is.dev@gmail.com.", 'ai');
            }
        } catch (error) {
            console.error('[Chat Error]:', error);
            if (thinkingDiv && thinkingDiv.parentNode) chatMessages.removeChild(thinkingDiv);
            addMessage("i can't reach the network right now.", 'ai');
        }
    };

    if (chatSend) {
        chatSend.addEventListener('click', handleChat);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleChat();
        });
    }

    // Contact Form Handler
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const message = document.getElementById('message').value;
            const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
            const body = encodeURIComponent(message);
            window.location.href = `mailto:crm.is.dev@gmail.com?subject=${subject}&body=${body}`;

            // Temporary feedback
            const btn = contactForm.querySelector('.submit-btn');
            const originalText = btn.innerText;
            btn.innerText = 'Redirecting...';
            setTimeout(() => {
                btn.innerText = 'Send Message';
                contactForm.reset();
            }, 3000);
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '#contact') return; // Let form scroll happen naturally if needed, but we handle via ID

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});
