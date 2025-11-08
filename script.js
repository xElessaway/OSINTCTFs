// Multi-CTF OSINT Challenge Platform
// Supports unlimited CTF collections loaded from data.js

let ctfData = [];

// Load CTF data from local data.js file
function loadCTFData() {
    try {
        if (typeof window.localCTFData === 'undefined') {
            throw new Error('Local CTF data not found. Make sure data.js is loaded.');
        }
        
        showLoading(true);
        ctfData = window.localCTFData;
        updateHeroStats();
        loadCTFCards();
        showLoading(false);
        
    } catch (error) {
        console.error('Error loading CTF data:', error);
        showError('Failed to load CTF data. Please check your data.js file.');
        showLoading(false);
    }
}

// Update hero section statistics
function updateHeroStats() {
    const totalChallenges = ctfData.reduce((sum, ctf) => sum + ctf.totalChallenges, 0);
    const totalCTFs = ctfData.length;
    
    const counters = document.querySelectorAll('.stat-number');
    if (counters[0]) counters[0].setAttribute('data-count', totalChallenges);
    if (counters[2]) counters[2].setAttribute('data-count', totalCTFs);
}

// Show/hide loading spinner
function showLoading(show) {
    const grid = document.getElementById('ctf-grid');
    if (show) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <div class="loading-spinner"></div>
                <p style="color: var(--text-secondary); margin-top: 1rem;">Loading challenges...</p>
            </div>
        `;
    }
}

// Show error message
function showError(message) {
    const grid = document.getElementById('ctf-grid');
    grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
            <p style="color: var(--danger-color); font-size: 1.2rem;">⚠️ ${message}</p>
        </div>
    `;
}

// Animated counter
function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 30);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadCTFData();
    
    // Animated counters
    const counters = document.querySelectorAll('.stat-number');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-count'));
                animateCounter(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    });
    counters.forEach(counter => observer.observe(counter));

    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // Close mobile menu on link click
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Modal functionality
    const modal = document.getElementById('ctfModal');
    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    setupTabs();
});

// Setup tab switching
function setupTabs() {
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-btn') || e.target.closest('.tab-btn')) {
            const btn = e.target.classList.contains('tab-btn') ? e.target : e.target.closest('.tab-btn');
            const difficulty = btn.dataset.difficulty;
            
            document.querySelectorAll('.tab-btn').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(`${difficulty}-pane`).classList.add('active');
        }
    });
}

// Load CTF Cards
function loadCTFCards() {
    const grid = document.getElementById('ctf-grid');
    grid.innerHTML = '';
    
    if (ctfData.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">No CTF collections available yet.</p>';
        return;
    }
    
    ctfData.forEach(ctf => {
        const card = createCTFCard(ctf);
        grid.appendChild(card);
    });
}

// Create CTF Card
function createCTFCard(ctf) {
    const card = document.createElement('div');
    card.className = 'ctf-card';
    
    const easyCount = ctf.challenges.easy.length;
    const mediumCount = ctf.challenges.medium.length;
    const hardCount = ctf.challenges.hard.length;
    
    card.innerHTML = `
        <div class="ctf-header">
            <h3>${ctf.title}</h3>
            <span class="status-badge ${ctf.status}">${ctf.status}</span>
        </div>
        <p class="ctf-description">${ctf.description}</p>
        <div class="ctf-stats">
            <div class="stat">
                <span class="stat-icon">🎯</span>
                <span>${ctf.totalChallenges} Challenges</span>
            </div>
            <div class="stat">
                <span class="stat-icon">📅</span>
                <span>${ctf.year || '2024'}</span>
            </div>
        </div>
        <div class="ctf-footer">
            <div class="difficulty-tags">
                ${easyCount > 0 ? `<span class="difficulty-badge easy">${easyCount} Easy</span>` : ''}
                ${mediumCount > 0 ? `<span class="difficulty-badge medium">${mediumCount} Medium</span>` : ''}
                ${hardCount > 0 ? `<span class="difficulty-badge hard">${hardCount} Hard</span>` : ''}
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => openModal(ctf));
    return card;
}

// Open Modal with CTF Details
function openModal(ctf) {
    const modal = document.getElementById('ctfModal');
    const modalTitle = document.getElementById('modal-title');
    const modalStatus = document.getElementById('modal-status');
    const modalDescription = document.getElementById('modal-description');
    const githubLink = document.getElementById('github-link');
    const answersLink = document.getElementById('answers-link');
    
    modalTitle.textContent = ctf.title;
    modalStatus.textContent = ctf.status;
    modalStatus.className = `status-badge ${ctf.status}`;
    modalDescription.textContent = ctf.description;
    githubLink.href = ctf.githubUrl;
    answersLink.href = ctf.answersUrl;
    
    document.getElementById('easy-count').textContent = ctf.challenges.easy.length;
    document.getElementById('medium-count').textContent = ctf.challenges.medium.length;
    document.getElementById('hard-count').textContent = ctf.challenges.hard.length;
    
    loadChallenges('easy-challenges', ctf.challenges.easy, ctf.id);
    loadChallenges('medium-challenges', ctf.challenges.medium, ctf.id);
    loadChallenges('hard-challenges', ctf.challenges.hard, ctf.id);
    
    document.querySelectorAll('.tab-btn').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    document.querySelector('.tab-btn[data-difficulty="easy"]').classList.add('active');
    document.getElementById('easy-pane').classList.add('active');
    
    modal.style.display = 'block';
}

// Load Challenges into Accordion
function loadChallenges(containerId, challenges, ctfId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    if (challenges.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); padding: 2rem; text-align: center;">No challenges available</p>';
        return;
    }
    
    challenges.forEach((challenge, index) => {
        const accordionItem = createAccordionItem(challenge, index, ctfId);
        container.appendChild(accordionItem);
    });
}

// Create Accordion Item
function createAccordionItem(challenge, index, ctfId) {
    const item = document.createElement('div');
    item.className = 'accordion-item';
    item.dataset.challengeName = challenge.name;
    item.dataset.ctfId = ctfId;
    
    const uniqueId = `${ctfId}-${challenge.name}`;
    
    let challengeHTML = `
        <div class="accordion-header">
            <h4>🔍 ${challenge.name}</h4>
            <span class="accordion-icon">▼</span>
        </div>
        <div class="accordion-content">
            <div class="accordion-body">
                <p class="challenge-description">${challenge.description}</p>
    `;
    
    if (challenge.imageUrl) {
        challengeHTML += `
            <div class="challenge-image">
                <a href="${challenge.imageUrl}" target="_blank">
                    <img src="${challenge.imageUrl}" alt="${challenge.name}" loading="lazy">
                </a>
            </div>
        `;
    }
    
    if (challenge.files && challenge.files.length > 0) {
        challengeHTML += `
            <div class="challenge-files">
                <strong>📁 Files:</strong> ${challenge.files.join(', ')}
            </div>
        `;
    }
    
    challengeHTML += `
        <div class="challenge-password">
            <strong>🔐 Password Format:</strong> <code>${challenge.passwordFormat}</code>
        </div>
        <div class="answer-section">
            <h5>🔑 Verify Your Answer</h5>
            <div class="answer-input-group">
                <input type="text" class="answer-input" placeholder="Enter your answer here..." data-challenge="${uniqueId}">
                <button class="btn-verify" onclick="verifyAnswer('${uniqueId}')">Verify</button>
            </div>
            <div class="answer-feedback"></div>
            <p class="answer-hint">💡 Hint: Make sure to follow the exact password format shown above</p>
        </div>
    `;
    
    if (challenge.localFolder) {
        challengeHTML += `
            <div class="challenge-github-link">
                <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 1rem;">
                    📂 Challenge files located in: <code style="color: var(--secondary-color);"></code>
                </p>
            </div>
        `;
    }
    
    challengeHTML += `
            </div>
        </div>
    `;
    
    item.innerHTML = challengeHTML;
    
    const header = item.querySelector('.accordion-header');
    header.addEventListener('click', () => {
        item.classList.toggle('active');
    });
    
    return item;
}

// Verify Answer Function
function verifyAnswer(uniqueId) {
    const input = document.querySelector(`.answer-input[data-challenge="${uniqueId}"]`);
    const feedback = input.closest('.answer-section').querySelector('.answer-feedback');
    const verifyBtn = input.closest('.answer-input-group').querySelector('.btn-verify');
    
    const userAnswer = input.value.trim();
    
    if (!userAnswer) {
        showFeedback(feedback, 'Please enter an answer', 'error');
        return;
    }
    
    verifyBtn.disabled = true;
    verifyBtn.textContent = 'Checking...';
    
    const [ctfId, ...challengeNameParts] = uniqueId.split('-');
    const challengeName = challengeNameParts.join('-');
    
    let challenge = null;
    const ctf = ctfData.find(c => c.id === parseInt(ctfId));
    if (ctf) {
        for (const difficulty of ['easy', 'medium', 'hard']) {
            const found = ctf.challenges[difficulty].find(c => c.name === challengeName);
            if (found) {
                challenge = found;
                break;
            }
        }
    }
    
    setTimeout(() => {
        if (challenge && challenge.answer) {
            const correctAnswer = challenge.answer.toLowerCase().trim();
            const userAnswerNormalized = userAnswer.toLowerCase().trim();
            
            if (userAnswerNormalized === correctAnswer) {
                input.classList.remove('incorrect');
                input.classList.add('correct');
                showFeedback(feedback, '🎉 Correct! Well done! You can now use this password to extract the flag from Flag.rar', 'success');
                localStorage.setItem(`ctf_solved_${uniqueId}`, 'true');
            } else {
                input.classList.remove('correct');
                input.classList.add('incorrect');
                showFeedback(feedback, '❌ Incorrect answer. Please try again!', 'error');
            }
        } else {
            showFeedback(feedback, 'ℹ️ Answer verification not available. Check the Answers folder locally.', 'error');
        }
        
        verifyBtn.disabled = false;
        verifyBtn.textContent = 'Verify';
    }, 500);
}

// Show feedback message
function showFeedback(feedbackElement, message, type) {
    feedbackElement.textContent = message;
    feedbackElement.className = `answer-feedback show ${type}`;
    
    if (type === 'error') {
        setTimeout(() => {
            feedbackElement.classList.remove('show');
        }, 5000);
    }
}

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero-content');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        hero.style.opacity = 1 - scrolled / 700;
    }
});

// Add animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.ctfs-section, .about-section, .contact-section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(50px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        sectionObserver.observe(section);
    });
});

// Add keyboard shortcut for answer verification (Enter key)
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target.classList.contains('answer-input')) {
        const challengeId = e.target.dataset.challenge;
        verifyAnswer(challengeId);
    }
});