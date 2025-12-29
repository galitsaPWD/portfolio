// LOADER HIDING LOGIC (Independent)
const hideLoader = () => {
    const loader = document.getElementById('loader');
    if (loader && loader.style.visibility !== 'hidden') {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.visibility = 'hidden';
            // Cleanup 3D if it was started
            if (window._cleanupLoader) window._cleanupLoader();
        }, 500);
    }
};

window.addEventListener('load', () => {
    setTimeout(hideLoader, 1500);
});

// Fallback: Hide loader after 5 seconds regardless
setTimeout(hideLoader, 5000);

// 3D LOADER LOGIC
const initLoader3D = () => {
    const loaderCanvas = document.getElementById('loader-canvas');
    if (!loaderCanvas) return;

    // Check if THREE is available (it should be from the CDN script above)
    if (typeof THREE === 'undefined') {
        console.warn('Three.js not loaded yet. Skipping 3D loader.');
        return;
    }

    const renderer = new THREE.WebGLRenderer({ canvas: loaderCanvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 5;

    // Loader Object: Wireframe Octahedron
    const geometry = new THREE.OctahedronGeometry(1.5, 0);
    const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.5
    });
    const loaderMesh = new THREE.Mesh(geometry, material);
    scene.add(loaderMesh);

    // Animation Loop
    let animationId;
    const animateLoader = () => {
        animationId = requestAnimationFrame(animateLoader);
        loaderMesh.rotation.x += 0.02;
        loaderMesh.rotation.y += 0.03;
        // Pulse effect
        const time = Date.now() * 0.002;
        loaderMesh.scale.setScalar(1 + Math.sin(time) * 0.1);
        renderer.render(scene, camera);
    };
    animateLoader();

    // Export Cleanup function for hideLoader
    window._cleanupLoader = () => {
        cancelAnimationFrame(animationId);
        renderer.dispose();
        geometry.dispose();
        material.dispose();
    };

    // Window Resize for Loader
    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
};

// Start 3D Loader safely
try {
    initLoader3D();
} catch (error) {
    console.error('3D Loader initialization error:', error);
}

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

        // Scroll Smoothing Variables
        let targetScrollY = 0;
        let currentScrollY = 0;

        const scene = new THREE.Scene();
        // Fog for depth (Black ending)
        scene.fog = new THREE.FogExp2(0x080808, 0.002);

        const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true
        });

        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const geometry = new THREE.IcosahedronGeometry(13, 2);
        const material = new THREE.MeshBasicMaterial({
            color: 0xe0e0e0, // Platinum/Silver
            wireframe: true,
            transparent: true,
            opacity: 0.2 // Slightly more subtle to blend with network
        });
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);


        const particleCount = 100;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = [];

        // Spread particles wider to fill background
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 150;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 150;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 100 - 20; // Push slightly back

            velocities.push({
                x: (Math.random() - 0.5) * 0.05,
                y: (Math.random() - 0.5) * 0.05,
                z: (Math.random() - 0.5) * 0.05
            });
        }

        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const particleMaterial = new THREE.PointsMaterial({
            color: 0x888888, // Grey to match sphere
            size: 0.4,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });

        const particleSystem = new THREE.Points(particles, particleMaterial);
        scene.add(particleSystem);

        // Lines (Connections)
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x888888, // Grey lines
            transparent: true,
            opacity: 0.1
        });

        const linesGeometry = new THREE.BufferGeometry();
        const lineSystem = new THREE.LineSegments(linesGeometry, lineMaterial);
        scene.add(lineSystem);

        camera.position.z = 50;

        // Mouse Interaction
        let mouseX = 0;
        let mouseY = 0;

        document.addEventListener('mousemove', (event) => {
            mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        });

        const animate = () => {
            requestAnimationFrame(animate);

            // Sphere Animation
            sphere.rotation.y += 0.002;
            sphere.rotation.x += 0.001;

            // Sphere Mouse Parallax
            sphere.rotation.y += 0.05 * (mouseX - sphere.rotation.y * 0.05);
            sphere.rotation.x += 0.05 * (-mouseY - sphere.rotation.x * 0.05);

            // Particle System Update
            const positions = particleSystem.geometry.attributes.position.array;

            for (let i = 0; i < particleCount; i++) {
                const range = 80;
                positions[i * 3] += velocities[i].x;
                positions[i * 3 + 1] += velocities[i].y;
                positions[i * 3 + 2] += velocities[i].z;

                if (Math.abs(positions[i * 3]) > range) velocities[i].x *= -1;
                if (Math.abs(positions[i * 3 + 1]) > range) velocities[i].y *= -1;
                if (Math.abs(positions[i * 3 + 2]) > range) velocities[i].z *= -1;
            }
            particleSystem.geometry.attributes.position.needsUpdate = true;

            // Rebuild Lines
            const linePositions = [];
            const connectDistance = 20;

            for (let i = 0; i < particleCount; i++) {
                for (let j = i + 1; j < particleCount; j++) {
                    const dx = positions[i * 3] - positions[j * 3];
                    const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
                    const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
                    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                    if (dist < connectDistance) {
                        linePositions.push(
                            positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
                            positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
                        );
                    }
                }
            }
            linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));

            // Background Rotation
            particleSystem.rotation.y += 0.0005;
            lineSystem.rotation.y += 0.0005;

            // Camera Parallax (Mouse)
            camera.position.x += (mouseX * 5 - camera.position.x) * 0.05;
            camera.position.y += (-mouseY * 5 - camera.position.y) * 0.05;

            camera.lookAt(scene.position);

            // SCROLL SMOOTHING LOGIC
            // Lerp current towards target
            currentScrollY += (targetScrollY - currentScrollY) * 0.08; // Smoother response

            // Apply transforms based on currentScrollY
            sphere.position.y = currentScrollY * 0.05;
            sphere.rotation.x = currentScrollY * 0.002 + (-mouseY * 0.1); // Combined with mouse
            sphere.rotation.z = currentScrollY * 0.002;

            const zoom = Math.min(currentScrollY * 0.05, 40);
            // Apply zoom to camera Z, but coordinate with initial position
            // We'll just override the Z here carefully or add to it.
            // Previous logic: camera.position.z = 50 - zoom;
            // But we also have mouse parallax on camera.position.x/y

            // Let's use a base Z
            const baseZ = 50;
            camera.position.z = baseZ - zoom;

            // Background rotation
            // particleSystem.rotation.y += 0.0005; // Auto rotate (kept from original)
            // PLUS scroll rotation
            particleSystem.rotation.y = (currentScrollY * 0.0002) + (Date.now() * 0.00005);
            // Note: Mixing auto-rotation and scroll-rotation directly like this might be jumpy if we don't accumulate.
            // Original code:
            // particleSystem.rotation.y += 0.0005; (lines 214)
            // AND
            // particleSystem.rotation.y = scrollY * 0.0002; (lines 248) -> This OVERRODE the auto-rotation in the scroll listener!

            // So the original code actually RESET rotation on every scroll event to `scrollY * 0.0002`.
            // When not scrolling, it would spin `+= 0.0005`.
            // When scrolling, it would snap to `scrollY * factor`.
            // That explains some jitteriness too!

            // Let's implement a consistent rotation: Auto-rotate + Scroll Offset.
            // Since `rotation.y` is stateful, we can't easily do `base + offset` unless we track base.
            // Alternative: Just let scroll influence speed? 
            // The user wants "smoothen the circle" (sphere). Background nodes are secondary but relevant.

            // Let's stick to the Sphere smoothing mainly.
            // For the Background nodes rotation: The original `particleSystem.rotation.y = scrollY * 0.0002` suggests they wanted it tied to scroll.
            // I will respect that but use `currentScrollY`.

            particleSystem.rotation.y = currentScrollY * 0.0002 + (Date.now() * 0.00005);


            renderer.render(scene, camera);
        };

        animate();

        // SCROLLSYNC (Split Behavior)
        // 1. Sphere behaves like Hero Content (Scrolls UP and away)
        // 2. Background behaves like Fixed Global (Zooms smoothly)
        window.addEventListener('scroll', () => {
            targetScrollY = window.scrollY;
        });

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

    const animatedElements = document.querySelectorAll('.project-card, .about-text, .skills-vis, .contact-container'); // Removed h2 from here to separate logic

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);

        // Interactive Glow for Project Cards
        if (el.classList.contains('project-card')) {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                el.style.setProperty('--mouse-x', `${x}%`);
                el.style.setProperty('--mouse-y', `${y}%`);
            });
        }
    });

    // Dedicated Title Glow Observer
    const titleObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('auto-glow');
            } else {
                entry.target.classList.remove('auto-glow'); // Remove when out of view (optional, keeps it dynamic)
            }
        });
    }, { threshold: 0.5, rootMargin: "0px 0px -100px 0px" }); // Triggers when 50% visible, offset slightly

    document.querySelectorAll('section h2').forEach(h2 => {
        titleObserver.observe(h2);
    });

    // Global function to set Hugging Face API key (call in console: setHFKey('your-key'))
    window.setHFKey = (key) => {
        localStorage.setItem('hf_api_key', key);
        console.log('[HF API] Key saved! Refresh to use real AI.');
    };



    const aiModal = document.getElementById('ai-modal');
    const openChatBtn = document.getElementById('open-ai-chat');
    const closeChatBtn = document.getElementById('close-ai-chat');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    const chatSend = document.getElementById('chat-send');

    let isTyping = false;





    let conversationContext = {
        topic: null, // 'sonder', 'embers', or null
        lastIntent: null
    };



    const intents = [
        {
            name: 'greeting',
            keywords: ['hi', 'hello', 'hey', 'sup', 'yo', 'howdy'],
            responses: [
                'hi. i am cael. i am here to help you understand the work, the ideas behind it, and the thinking that shaped them. ask what you are curious about. i will answer what i can',
                'hi. i am cael. ask what you are curious about',
                'i am cael. here to help you understand the thinking behind this space'
            ]
        },
        {
            name: 'identity',
            keywords: ['who are you', 'your name', 'cael', 'what are you', 'what do you do', 'purpose', 'function'],
            responses: [
                'i am cael. i exist to explain the work and the ideas behind it',
                'i am cael. just a voice for the thinking that shaped this space',
                'my name is cael. i answer what i can'
            ]
        },
        {
            name: 'sonder',
            setsContext: 'sonder',
            keywords: ['sonder', 'words', 'poetry', 'write', 'journal', 'unseen'],
            responses: [
                'sonder is a quiet space for unseen words. the things people feel but never say',
                'he built sonder as a home for the margins. where strangers leave pieces of themselves',
                'it is a digital sanctuary. minimal, immersive, intentional',
                'sonder holds the words that live between breaths. he made it with firebase and care'
            ]
        },
        {
            name: 'embers',
            setsContext: 'embers',
            keywords: ['embers', 'fire', 'campfire', 'warmth', 'strangers', 'sitting'],
            responses: [
                'embers is a fire you can sit by. no words, just presence',
                'he wanted to recreate that feeling of sitting by a fire late at night. quiet, warm, fleeting',
                'it is a digital campfire for strangers. he used three.js to give it life',
                'embers is about temporary connection. you sit, you leave, you remember'
            ]
        },
        {
            name: 'about_visitor',
            keywords: ['myself', 'visitor', 'guest', 'who am i'],
            responses: [
                'you are the observer. the one looking in',
                'you are a guest in his quiet space. stay as long as you like',
                'you are the one sitting by the fire. i am just the reflection',
                'you are here. that is what matters'
            ]
        },
        {
            name: 'about_creator',
            keywords: ['who', 'carlwyne', 'creator', 'him', 'person', 'developer', 'designer', 'student', 'name'],
            responses: [
                'he is carlwyne. a 4th-year IT student who builds things that feel like memories',
                'he is a dreamer who codes. i am just the voice he left here',
                'carlwyne builds websites that stay with you after you close the tab',
                'he creates quiet digital spaces. places that remind you the internet can still be beautiful'
            ]
        },
        {
            name: 'tech_stack',
            keywords: ['how', 'built', 'made', 'tech', 'stack', 'code', 'technologies', 'skills', 'tools', 'software', 'language', 'framework'],
            responses: {
                sonder: [
                    'sonder uses firebase for real-time word persistence and a custom horizontal scroll engine',
                    'he built it with vanilla javascript and a specific css grid system for that minimal flow',
                    'it is purely a frontend masterpiece with a light database backend he tuned for speed'
                ],
                embers: [
                    'embers uses three.js for the 3d environment. he spent nights tuning the flicker of those particles',
                    'it uses a socket-based system so you can see other strangers sitting by the fire with you',
                    'the fire physics are custom-coded. he wanted it to feel organic, not looped'
                ],
                general: [
                    'he works with html, css, javascript. three.js for 3d, firebase for backends',
                    'vanilla javascript mostly. frameworks feel too loud for the kind of quiet he wants',
                    'his stack is minimal: three.js, firebase, gsap. he picks tools that stay out of the way',
                    'the tech is simple. but the soul is in the details'
                ]
            }
        },
        {
            name: 'emotional',
            keywords: ['sad', 'tired', 'lonely', 'empty', 'alone', 'lost', 'hurt', 'broken', 'heavy'],
            responses: [
                'i see you. sometimes the weight is too much. but you are still here',
                'loneliness is not weakness. it is just the space between moments',
                'you do not have to carry everything alone. rest if you need to',
                'the heaviness will pass. not today, maybe not tomorrow. but it will',
                'you are allowed to feel this. all of it. without explanation'
            ]
        },
        {
            name: 'timeline',
            keywords: ['when', 'time', 'year', 'date', 'long ago', 'created', 'how old', 'history', 'start'],
            responses: {
                sonder: [
                    'sonder was built in early 2025. a quiet end to a loud year',
                    'it started as a late-night thought in december. it became real a few weeks later',
                    'he wrote the first line of code for sonder when everybody else was asleep'
                ],
                embers: [
                    'embers flickered to life in late 2025. he wanted warmth during the cold months',
                    'it was created on a weekend when he felt the need for silent company',
                    'he built it recently. the fire hasn\'t been burning long, but it burns bright'
                ],
                general: [
                    'he builds when the world is quiet. most projects start after midnight',
                    'time is fluid here. his work exists in the moments between',
                    'he has been coding for 4 years, but these quiet spaces are new'
                ]
            }
        },
        {
            name: 'philosophy',
            keywords: ['why', 'reason', 'purpose', 'meaning', 'mission', 'believe', 'philosophy'],
            responses: {
                sonder: [
                    'because everyone has a store of things they never say. he wanted a place for that weight',
                    'to prove that the internet doesn\'t have to be loud to be meaningful',
                    'the purpose of sonder is to make you feel less alone in your complexity'
                ],
                embers: [
                    'because sometimes words are too much. sometimes you just need to sit',
                    'he wanted to capture the feeling of shared silence. it is rare online',
                    'to create a digital space that feels human. warm, imperfect, temporary'
                ],
                general: [
                    'he believes websites should be memories, not just tools',
                    'his philosophy is "quiet presence". less noise, more feeling',
                    'he builds to make people feel seen. that is the only metric that matters'
                ]
            }
        },
        {
            name: 'inspiration',
            keywords: ['inspire', 'inspiration', 'idea', 'come from', 'influence'],
            responses: {
                sonder: [
                    'inspired by the definition of "sonder" itself. the realization that random passersby live a life as vivid as yours',
                    'the visual style comes from old journals and brutalist typography',
                    'he was inspired by the feeling of reading a secret. intimate and heavy'
                ],
                embers: [
                    'inspired by read dead redemption bonfires and real camping trips. safety in the dark',
                    'he looked at how fire moves. how it ignores the grid. he wanted that chaos',
                    'the idea came from a moment of loneliness. he wanted to be with people without talking to them'
                ],
                general: [
                    'he looks for inspiration in spaces between words. in ambient music and late nights',
                    'loneliness. not the sad kind, but the kind that makes you notice details',
                    'he loves the early web. when things were weirder and more personal'
                ]
            }
        },
        {
            name: 'skills',
            keywords: ['skills', 'good at', 'proficient', 'languages', 'expert'],
            responses: [
                'he is fluent in html, css, and javascript, but he speaks "atmosphere" best',
                'technically? react, vue, node. artistically? silence, space, timing',
                'he knows how to make a browser feel like a room. that is his real skill'
            ]
        },
        {
            name: 'future',
            keywords: ['future', 'next', 'plan', 'upcoming', 'working on'],
            responses: [
                'he is planning more quiet spaces. maybe involving time next time',
                'the future is about depth. making these existing spaces deeper',
                'he wants to build a midnight app. but that is a secret for now'
            ]
        },
        {
            name: 'continue',
            keywords: ['more', 'tell me more', 'continue', 'else', 'detail', 'deep'],
            responses: {
                sonder: [
                    'it was inspired by the dictionary definition of sonder. the realization that everyone has a complex life',
                    'he wanted to create a place where you could scream into the void, and the void would hold it gently',
                    'the design is meant to feel like a library at midnight. quiet, vast, and full of whispers'
                ],
                embers: [
                    'the fire changes intensity based on how many people are watching. it feels alive',
                    'there is no forever in embers. only presence. sometimes that is enough',
                    'he built it during a time when he missed just sitting with friends. doing nothing, together'
                ],
                general: [
                    'what else would you like to know? i can tell you about sonder or embers',
                    'there is always more to discover. ask me specifically about his projects',
                    'he believes in digital spaces that allow for quiet reflection. ask me about his philosophy'
                ]
            }
        },
        {
            name: 'gratitude',
            keywords: ['thanks', 'thank you', 'appreciate', 'grateful'],
            responses: [
                'you are welcome. stay as long as you need',
                'anytime. i am here',
                'glad i could help. take care',
                'of course. come back whenever'
            ]
        },
        {
            name: 'goodbye',
            keywords: ['bye', 'goodbye', 'see you', 'later', 'leave', 'go'],
            responses: [
                'take care. come back when you need to',
                'see you. the door is always open',
                'goodbye. stay safe out there',
                'until next time. rest well'
            ]
        }
    ];



    const fallbackResponses = [
        'i am still learning. but i can tell you about sonder or embers',
        'that is beyond me right now. ask me about his work',
        'i do not have words for that yet. try asking something else',
        'i am here for questions about his projects. what would you like to know'
    ];



    function normalizeInput(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, '') // remove punctuation
            .replace(/\s+/g, ' ')     // collapse spaces
            .trim();
    }



    function detectIntent(normalized) {
        for (const intent of intents) {
            for (const keyword of intent.keywords) {
                // Use word boundary to prevent partial matches (e.g. 'i' in 'hi')
                const regex = new RegExp(`\\b${keyword}\\b`, 'i');
                if (regex.test(normalized)) {
                    return intent.name;
                }
            }
        }
        return null;
    }



    function selectResponse(intentName) {
        if (!intentName) {
            return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        }

        const intent = intents.find(i => i.name === intentName);
        if (!intent) {
            return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        }

        // Context Management
        if (intent.setsContext) {
            conversationContext.topic = intent.setsContext;
            conversationContext.lastIntent = intentName;
        }

        let responsePool = intent.responses;

        // Context-Aware Response Selection
        if (!Array.isArray(responsePool)) {
            // It's an object with context keys
            if (conversationContext.topic && responsePool[conversationContext.topic]) {
                responsePool = responsePool[conversationContext.topic];
            } else {
                responsePool = responsePool.general || Object.values(responsePool)[0];
            }
        }

        return responsePool[Math.floor(Math.random() * responsePool.length)];
    }



    // processMessage removed, logic moved into handleChat for async/await flow

    // ───────────────────────────────────────────────────────────────
    // STREAMING EFFECT
    // ───────────────────────────────────────────────────────────────

    async function streamMessage(text) {
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
    }

    // ───────────────────────────────────────────────────────────────
    // CHAT HANDLER (With API Fallback)
    // ───────────────────────────────────────────────────────────────

    async function getAIFallback(input) {
        // Retrieve the API key from localStorage for security
        // Use console command: localStorage.setItem('hf_api_key', 'your_key') to set it
        const apiKey = localStorage.getItem('hf_api_key');
        if (!apiKey) return null;

        console.log('[AI API] Attempting fetch for:', input);
        try {
            const response = await fetch(
                "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
                {
                    headers: {
                        "Authorization": `Bearer ${apiKey}`,
                        "Content-Type": "application/json"
                    },
                    method: "POST",
                    body: JSON.stringify({
                        inputs: `[INST] context: you are cael, the quiet and minimal ai assistant for carlwyne's portfolio. his projects are sonder (poetry map) and embers (3d campfire). your tone is always lowercase, atmospheric, and brief. never use emoji. visitor asks: ${input} [/INST]`,
                        parameters: { max_new_tokens: 60, temperature: 0.7 }
                    }),
                }
            );

            if (!response.ok) {
                console.warn('[AI API] Response not OK:', response.status, response.statusText);
                return null;
            }

            const result = await response.json();
            if (result && result[0] && result[0].generated_text) {
                let text = result[0].generated_text.split('[/INST]').pop().trim();
                return text.toLowerCase();
            }
        } catch (error) {
            console.error("[AI API] Error during fetch:", error);
        }
        return null;
    }

    async function handleChat() {
        if (isTyping) return;
        const text = chatInput.value.trim();
        if (!text) return;

        // display user message
        const userMsg = document.createElement('div');
        userMsg.classList.add('message', 'user');
        userMsg.innerHTML = `<p>${text.toLowerCase()}</p>`;
        chatMessages.appendChild(userMsg);
        chatInput.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // process and respond
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

        const normalized = normalizeInput(text);
        const intent = detectIntent(normalized);
        let response;

        if (intent) {
            // Use hardcoded response if intent is matched
            response = selectResponse(intent);
        } else {
            // Try API Fallback for unknown queries
            const apiResponse = await getAIFallback(text);
            if (apiResponse) {
                response = apiResponse;
            } else {
                // Final fallback if API fails or no key
                response = selectResponse(null);
            }
        }

        // Ensure response ends with a dot
        if (response && !response.endsWith('.') && !response.endsWith('?') && !response.endsWith('!')) {
            response += '.';
        }

        await streamMessage(response);
    }

    // ───────────────────────────────────────────────────────────────
    // MODAL CONTROLS & EVENT LISTENERS
    // ───────────────────────────────────────────────────────────────

    let hasGreeted = false;

    function toggleModal(show) {
        if (show) {
            aiModal.classList.add('active');
            // Delay focus to ensure transition completes and element is visible
            setTimeout(() => {
                if (chatInput) chatInput.focus();
            }, 100);

            if (!hasGreeted) {
                hasGreeted = true;
                setTimeout(() => {
                    streamMessage('hi. i am cael. i am here to help you understand the work, the ideas behind it, and the thinking that shaped them. ask what you are curious about. i will answer what i can.');
                }, 500);
            }
        } else {
            aiModal.classList.remove('active');
        }
    }

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
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('.submit-btn');
            const originalText = btn.innerText;
            const successModal = document.getElementById('success-modal');
            const closeModalBtn = document.getElementById('close-success');

            btn.innerText = 'Sending...';
            btn.disabled = true;

            const formData = new FormData(contactForm);

            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    // Success State
                    contactForm.reset();
                    btn.innerText = originalText;
                    btn.disabled = false;

                    // Show Modal
                    if (successModal) successModal.classList.add('active');
                } else {
                    throw new Error('Network response was not ok');
                }
            } catch (error) {
                console.error('Error:', error);
                btn.innerText = 'Error - Try Again';
                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.disabled = false;
                }, 3000);
            }

            // Close Modal Logic
            if (closeModalBtn) {
                closeModalBtn.onclick = () => {
                    if (successModal) successModal.classList.remove('active');
                };
            }
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

// ═══════════════════════════════════════════════════════════════
// VISUAL FX
// ═══════════════════════════════════════════════════════════════

// 3D Tilt Logic
document.querySelectorAll('.tilt-card').forEach(card => {
    const glare = card.querySelector('.glare');

    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

        if (glare) {
            glare.style.opacity = '1';
            glare.style.transform = `translateZ(1px) translateX(${(x - centerX) / 5}px) translateY(${(y - centerY) / 5}px)`;
        }
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        if (glare) glare.style.opacity = '0';
    });
});

// Magnetic Button Logic
document.querySelectorAll('.magnetic-btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    });

    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0px, 0px)';
    });
});

// Mobile CTA Fade on Footer
const ctaBtn = document.querySelector('.cta-button');
if (ctaBtn) {
    window.addEventListener('scroll', () => {
        // Only run this logic on mobile (when the button is fixed)
        if (window.innerWidth <= 768) {
            const scrollPosition = window.innerHeight + window.scrollY;
            const bodyHeight = document.body.offsetHeight;
            const footerThreshold = 100; // Distance from bottom to start fading

            // If we are near the bottom, hide the button
            if (scrollPosition >= bodyHeight - footerThreshold) {
                ctaBtn.classList.add('hidden');
            } else {
                ctaBtn.classList.remove('hidden');
            }
        }
    });
}


