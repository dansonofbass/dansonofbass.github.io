const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Initial resize
resizeCanvas();

// Handle window resize
window.addEventListener('resize', resizeCanvas);

// Node class for the graph
class Node {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.vz = (Math.random() - 0.5) * 2;
        this.size = Math.random() * 4 + 2;
        this.connections = [];
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.z += this.vz;

        // Bounce off walls with padding
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        if (this.z < -200 || this.z > 200) this.vz *= -1;
    }

    draw() {
        const scale = Math.max(0.1, (this.z + 200) / 400); // Ensure scale is never negative
        const size = Math.max(0.5, this.size * scale); // Ensure size is never too small
        const alpha = scale * 0.8;

        ctx.beginPath();
        ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(145, 145, 145, ${alpha})`;
        ctx.fill();
    }
}

// Create nodes
const nodes = [];
const numNodes = Math.min(100, Math.floor((window.innerWidth * window.innerHeight) / 10000)); // Adjust number of nodes based on screen size
for (let i = 0; i < numNodes; i++) {
    nodes.push(new Node(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 400 - 200
    ));
}

// Animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sort nodes by z-index for 3D effect
    nodes.sort((a, b) => a.z - b.z);

    // Update and draw nodes
    nodes.forEach(node => {
        node.update();
        node.draw();
    });

    // Draw connections
    nodes.forEach((node1, i) => {
        nodes.slice(i + 1).forEach(node2 => {
            const dx = node1.x - node2.x;
            const dy = node1.y - node2.y;
            const dz = node1.z - node2.z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (distance < 150) {
                const alpha = (1 - distance / 150) * 0.5;
                ctx.beginPath();
                ctx.moveTo(node1.x, node1.y);
                ctx.lineTo(node2.x, node2.y);
                ctx.strokeStyle = `rgba(252, 252, 252, ${alpha})`;
                ctx.stroke();
            }
        });
    });

    requestAnimationFrame(animate);
}

// Start animation
animate();

// Create a MutationObserver instance
const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
            // Handle added nodes
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // Element node
                    if (node.classList && node.classList.contains('project-card')) {
                        node.classList.add('visible');
                    }
                }
            });
        }
    });
});

// Configuration for the observer
const config = {
    childList: true,    // Watch for changes to the direct children
    subtree: true,      // Watch for changes to all descendants
    attributes: true,   // Watch for changes to attributes
    characterData: true // Watch for changes to text content
};

// Start observing the document body
mutationObserver.observe(document.body, config);

// Function to handle section visibility
function handleSectionVisibility() {
    const sections = document.querySelectorAll('section');
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });

    sections.forEach(section => {
        sectionObserver.observe(section);
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

function initializeApp() {
    handleSectionVisibility();
    
    // Smooth scroll functionality
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Clean up observers when page is hidden
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        mutationObserver.disconnect();
    } else {
        mutationObserver.observe(document.body, config);
    }
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    mutationObserver.disconnect();
});

// Intersection Observer for sections and project cards
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
});

// Observe all sections
document.querySelectorAll('section').forEach(section => {
    sectionObserver.observe(section);
});

// Observe all project cards
document.querySelectorAll('.project-card').forEach(card => {
    sectionObserver.observe(card);
});


// Enhanced hover effect for cards
document.querySelectorAll('.project-card, .skill-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Calculate distance from center for glow intensity
        const distanceX = Math.abs(x - centerX) / centerX;
        const distanceY = Math.abs(y - centerY) / centerY;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
        
        // Apply immediate movement based on mouse position
        const moveX = 0;
        const moveY = (y - centerY) / 20;
        
        // Apply transform immediately
        card.style.transform = `translate(${moveX}px, ${moveY - 8}px)`;
        
        // Apply glow with delay
        requestAnimationFrame(() => {
            const glowIntensity = 1 - distance;
            card.style.boxShadow = `
                0 15px 40px rgba(11, 255, 1, ${0.4 * glowIntensity}),
                0 0 30px rgba(11, 255, 1, ${0.3 * glowIntensity}),
                0 0 60px rgba(11, 255, 1, ${0.2 * glowIntensity}),
                0 0 90px rgba(11, 255, 1, ${0.1 * glowIntensity})
            `;
        });
    });
    
    card.addEventListener('mouseleave', () => {
        // Reset transform immediately
        card.style.transform = 'translate(0, 0)';
        // Reset glow with delay
        requestAnimationFrame(() => {
            card.style.boxShadow = 'none';
        });
    });
});

/* Typing animation for about section */
const typingText = document.querySelector('.typing-text');
const texts = [
    "Full-Stack Developer specialized in React & Node.js  ;",
    "Also crafting WordPress themes & plugins with modern code  ;",
    "Passionate about AI & Machine Learning  ;",
    "Working on large academic projects & real-world applications  ;",
    "Always eager to learn & collaborate in awesome teams  ;"
];
let textIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 50; // Faster typing speed

function typeText() {
    const currentText = texts[textIndex].substring(0, charIndex);
    typingText.textContent = currentText;

    // Add a subtle glow effect
    typingText.style.textShadow = `0 0 10px rgba(11, 255, 1, ${charIndex / texts[textIndex].length * 0.5})`;

    if (!isDeleting && charIndex < texts[textIndex].length) {
        charIndex++;
        typingSpeed = 50; // Faster typing
    } else if (isDeleting && charIndex > 0) {
        charIndex--;
        typingSpeed = 30; // Faster deleting
    }

    if (charIndex === texts[textIndex].length && !isDeleting) {
        isDeleting = true;
        typingSpeed = 1500; // Shorter pause at the end
    } else if (charIndex === 0 && isDeleting) {
        isDeleting = false;
        textIndex = (textIndex + 1) % texts.length;
        typingSpeed = 300; // Shorter pause before next text
    }

    setTimeout(typeText, typingSpeed);
}

// Start typing animation when about section is in view
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            typeText();
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

observer.observe(document.querySelector('.about-text')); 