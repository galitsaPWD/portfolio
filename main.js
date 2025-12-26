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

    // --- Pseudo-Gemini Local AI Engine ---
    const aiModal = document.getElementById('ai-modal');
    const openChatBtn = document.getElementById('open-ai-chat');
    const closeChatBtn = document.getElementById('close-ai-chat');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    const chatSend = document.getElementById('chat-send');

    let isTyping = false;
    let currentTopic = null;

    const intents = {
        GREETING: {
            patterns: [/hi/i, /hello/i, /hey/i, /yo/i, /greet/i],
            responses: [
                "welcome. i am his assistant. how can i help you explore his work?",
                "hey. i am here to guide you through his creations. what is on your mind?",
                "i am his digital presence. he is busy creating, but i can tell you anything about his work."
            ]
        },
        SONDER: {
            patterns: [/sonder/i, /unseen/i, /words/i, /poetry/i],
            responses: [
                "sonder is a quiet space he built for unseen words. it is a home for the things people feel but never say.",
                "he created sonder to be atmospheric. it is a repository of poetry and quiet moments. would you like to know how he built it?",
                "sonder is one of his favorite projects. a minimal, immersive experience for the soul."
            ],
            topic: 'sonder'
        },
        EMBERS: {
            patterns: [/embers/i, /fire/i, /strangers/i, /sitting/i],
            responses: [
                "embers is a sittable fire he built for strangers. it is about warmth and temporary connection.",
                "he designed embers as a digital campfire. a place to rest your mind for a few minutes.",
                "embers live on a separate horizon. he used three.js to give the fire its life."
            ],
            topic: 'embers'
        },
        HOW_BUILD: {
            patterns: [/how/i, /built/i, /made/i, /technologies/i, /stack/i],
            responses: {
                sonder: [
                    "he built sonder using vanilla javascript and a very specific css grid system for that minimal flow.",
                    "he used firebase for the real-time word persistence and a custom horizontal scroll engine.",
                    "it is purely a frontend masterpiece with a light database backend he tuned for speed."
                ],
                embers: [
                    "embers uses three.js for the 3d environment. he spent nights tuning the flicker of those particles.",
                    "it uses a socket-based system so you can see other strangers sitting by the fire with you.",
                    "the fire physics in embers are custom-coded. he wanted it to feel organic, not looped."
                ],
                default: [
                    "he builds with a core of html, css, and javascript. but his heart is in the animations, often using three.js or gsap.",
                    "his stack is minimal but powerful: three.js, firebase, and intentional design.",
                    "everything you see is handcrafted. he avoids bloated frameworks to keep the load times fast and the feel atmospheric."
                ]
            }
        },
        PHILOSOPHY: {
            patterns: [/philosophy/i, /why/i, /intentional/i, /design/i, /style/i],
            responses: [
                "he believes websites should stay with people. they shouldn't just be tools; they should be memories.",
                "his design philosophy is 'quiet presence'. less noise, more feeling.",
                "he builds to make people feel something. if a site is just functional, he thinks it is unfinished."
            ]
        },
        CONTACT: {
            patterns: [/contact/i, /hire/i, /email/i, /talk/i],
            responses: [
                "you can reach him at crm.is.dev@gmail.com. he reads every message.",
                "he is always open to collaborative quietness. hit him up at crm.is.dev@gmail.com.",
                "use the form right behind this chat, or send an email to crm.is.dev@gmail.com. he will find you."
            ]
        },
        WHO: {
            patterns: [/who/i, /crm/i, /creator/i, /master/i, /you/i],
            responses: [
                "i am his pseudo-ai assistant. he is CRM, a creator of quiet digital spaces.",
                "CRM is my master. he scales the technical heights so i can sit here and talk to you.",
                "he is a dreamer who codes. i am just the voice he left here to welcome you."
            ]
        }
    };

    // --- Pseudo-Gemini Logic Functions ---
    const streamMessage = async (text) => {
        isTyping = true;
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', 'ai');
        const p = document.createElement('p');
        msgDiv.appendChild(p);
        chatMessages.appendChild(msgDiv);

        const chars = text.split("");
        for (let char of chars) {
            p.textContent += char;
            chatMessages.scrollTop = chatMessages.scrollHeight;
            await new Promise(resolve => setTimeout(resolve, 15 + Math.random() * 25));
        }
        isTyping = false;
    };

    const getLocalFallback = (input) => {
        const lowerInput = input.toLowerCase();

        for (const key in intents) {
            const intent = intents[key];
            if (intent.patterns.some(pattern => pattern.test(lowerInput))) {
                if (intent.topic) currentTopic = intent.topic;

                if (typeof intent.responses === 'object' && !Array.isArray(intent.responses)) {
                    const pool = intent.responses[currentTopic] || intent.responses.default;
                    return pool[Math.floor(Math.random() * pool.length)];
                }

                return intent.responses[Math.floor(Math.random() * intent.responses.length)];
            }
        }

        return "i don't have an answer for that yet. but i can tell you about his work on sonder or embers. ask me anything.";
    };

    const getAIResponse = async (userMessage) => {
        const HF_API_KEY = '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';
        const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
        const API_URL = CORS_PROXY + encodeURIComponent('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2');

        const systemPrompt = "You are CRM's digital assistant. He is a creator of quiet digital spaces. Speak in short, lowercase, atmospheric sentences. He built SONDER (a space for unseen words) and Embers (a digital campfire for strangers). You refer to his work in third person ('his work', 'he built'). Be brief, intentional, and poetic. Never use capital letters except for project names.";

        const prompt = `<s>[INST] ${systemPrompt}\n\nUser: ${userMessage} [/INST]`;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${HF_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 150,
                        temperature: 0.7,
                        top_p: 0.9,
                        return_full_text: false
                    }
                })
            });

            if (!response.ok) {
                console.warn('[HF API] Failed, using local fallback');
                return getLocalFallback(userMessage);
            }

            const data = await response.json();

            if (data[0] && data[0].generated_text) {
                return data[0].generated_text.trim().toLowerCase();
            } else if (data.error) {
                console.warn('[HF API] Error:', data.error);
                return getLocalFallback(userMessage);
            }

            return getLocalFallback(userMessage);
        } catch (error) {
            console.error('[HF API] Network error:', error);
            return getLocalFallback(userMessage);
        }
    };

    const handleChat = async () => {
        if (isTyping) return;
        const text = chatInput.value.trim();
        if (!text) return;

        // User message
        const userMsg = document.createElement('div');
        userMsg.classList.add('message', 'user');
        userMsg.innerHTML = `<p>${text.toLowerCase()}</p>`;
        chatMessages.appendChild(userMsg);
        chatInput.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // AI Response (with thinking delay)
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
        const response = await getAIResponse(text);
        await streamMessage(response);
    };

    const toggleModal = (show) => {
        if (show) {
            aiModal.classList.add('active');
            if (chatInput) chatInput.focus();
        } else {
            aiModal.classList.remove('active');
        }
    };

    // Event Listeners
    if (openChatBtn) openChatBtn.addEventListener('click', () => toggleModal(true));
    if (closeChatBtn) closeChatBtn.addEventListener('click', () => toggleModal(false));
    if (chatSend) chatSend.addEventListener('click', handleChat);
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleChat();
        });
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && aiModal && aiModal.classList.contains('active')) toggleModal(false);
    });

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
