// Achievement tracking
const achievements = {
    'early-bird': { count: 0, target: 5, completed: false },
    'streak-master': { count: 0, target: 7, completed: false },
    'task-crusher': { count: 0, target: 50, completed: false }
};

// Daily challenge tracking
let dailyChallenge = {
    description: 'Complete 3 business tasks before lunch',
    target: 3,
    completed: 0,
    reward: 'Bonus points'
};

// Load todos from localStorage
function loadTodos() {
    const storedTodos = localStorage.getItem('todos');
    return storedTodos ? JSON.parse(storedTodos) : [];
}

// Calculate streak with improved accuracy
function calculateStreak() {
    const todos = loadTodos();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Get all completed dates
    const completedDates = todos
        .filter(todo => todo.done && todo.completedAt)
        .map(todo => {
            const date = new Date(todo.completedAt);
            return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
        })
        .sort((a, b) => b - a); // Sort in descending order

    if (completedDates.length === 0) return 0;

    // Check if there's activity today
    const hasActivityToday = completedDates.includes(today.getTime());
    
    // If no activity today, check if we still have yesterday's streak
    if (!hasActivityToday) {
        const hasActivityYesterday = completedDates.includes(yesterday.getTime());
        if (!hasActivityYesterday) return 0;
    }

    let streak = hasActivityToday ? 1 : 0;
    let currentDate = hasActivityToday ? yesterday : new Date(yesterday);

    // Count consecutive days
    while (true) {
        const currentTime = currentDate.getTime();
        if (!completedDates.includes(currentTime)) break;
        
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
}

// Update achievements
function updateAchievements() {
    const todos = loadTodos();
    const now = new Date();
    const hour = now.getHours();
    
    // Update early bird achievement
    if (hour < 9) {
        const completedToday = todos.filter(todo => 
            todo.done && 
            new Date(todo.completedAt).toDateString() === now.toDateString()
        ).length;
        achievements['early-bird'].count = completedToday;
    }

    // Update streak master achievement
    achievements['streak-master'].count = calculateStreak();

    // Update task crusher achievement
    achievements['task-crusher'].count = todos.filter(todo => todo.done).length;

    // Update UI
    Object.entries(achievements).forEach(([key, achievement]) => {
        const card = document.querySelector(`[data-achievement="${key}"]`);
        if (card) {
            const progress = card.querySelector('.progress');
            const progressFill = card.querySelector('.progress-fill');
            
            if (progress) {
                progress.textContent = `${achievement.count}/${achievement.target}`;
            }
            
            if (progressFill) {
                const progressPercent = (achievement.count / achievement.target) * 100;
                progressFill.style.width = `${Math.min(progressPercent, 100)}%`;
            }
            
            if (achievement.count >= achievement.target && !achievement.completed) {
                achievement.completed = true;
                card.classList.add('completed');
                showNotification(`Achievement unlocked: ${card.querySelector('h4').textContent}!`);
            }
        }
    });
}

// Update daily challenge
function updateDailyChallenge() {
    const todos = loadTodos();
    const now = new Date();
    const hour = now.getHours();
    const isBeforeLunch = hour < 12;

    if (isBeforeLunch) {
        const businessCompleted = todos.filter(todo => 
            todo.done && 
            todo.category === 'business' &&
            new Date(todo.completedAt).toDateString() === now.toDateString()
        ).length;

        dailyChallenge.completed = businessCompleted;
        
        // Update UI
        const progressBar = document.querySelector('.challenge-progress .progress-fill');
        const progressText = document.querySelector('.challenge-progress span');
        const claimButton = document.querySelector('.claim-reward');

        if (progressBar && progressText && claimButton) {
            const progress = (dailyChallenge.completed / dailyChallenge.target) * 100;
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `${dailyChallenge.completed}/${dailyChallenge.target} completed`;

            if (dailyChallenge.completed >= dailyChallenge.target) {
                claimButton.disabled = false;
            }
        }
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Update statistics with improved streak display
function updateStatistics() {
    const todos = loadTodos();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Calculate completed todos today
    const completedToday = todos.filter(todo => {
        const todoDate = new Date(todo.completedAt);
        return todo.done && todoDate >= today;
    }).length;
    
    // Calculate productivity score
    const totalTodos = todos.length;
    const completedTodos = todos.filter(todo => todo.done).length;
    const productivityScore = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;
    
    // Calculate streak
    const streak = calculateStreak();
    
    // Update DOM with improved streak display
    document.getElementById('completed-today').textContent = completedToday;
    document.getElementById('productivity-score').textContent = `${productivityScore}%`;
    
    const streakElement = document.getElementById('current-streak');
    if (streakElement) {
        const streakInfo = document.createElement('div');
        streakInfo.className = 'streak-info';
        streakInfo.innerHTML = `
            <span class="streak-count">${streak}</span>
            <span class="streak-label">day${streak !== 1 ? 's' : ''} streak</span>
        `;
        streakElement.innerHTML = '';
        streakElement.appendChild(streakInfo);
    }
    
    // Update progress bar
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        progressFill.style.width = `${productivityScore}%`;
    }
}

// Tips carousel
function initTipsCarousel() {
    const carousel = document.querySelector('.tips-carousel');
    const tips = document.querySelectorAll('.tip-card');
    let currentTip = 0;

    // Add navigation dots
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'carousel-dots';
    tips.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = `dot ${index === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => goToTip(index));
        dotsContainer.appendChild(dot);
    });
    carousel.appendChild(dotsContainer);

    // Add navigation arrows
    const nav = document.createElement('div');
    nav.className = 'carousel-nav';
    nav.innerHTML = `
        <button class="nav-button prev" aria-label="Previous tip">←</button>
        <button class="nav-button next" aria-label="Next tip">→</button>
    `;
    carousel.appendChild(nav);

    // Add click handlers for navigation
    nav.querySelector('.prev').addEventListener('click', () => {
        currentTip = (currentTip - 1 + tips.length) % tips.length;
        updateCarousel();
    });

    nav.querySelector('.next').addEventListener('click', () => {
        currentTip = (currentTip + 1) % tips.length;
        updateCarousel();
    });

    // Initialize first tip
    tips[0].classList.add('active');

    function goToTip(index) {
        currentTip = index;
        updateCarousel();
    }

    function updateCarousel() {
        // Update tips
        tips.forEach((tip, index) => {
            tip.classList.remove('active');
            if (index === currentTip) {
                tip.classList.add('active');
            }
        });

        // Update dots
        dotsContainer.querySelectorAll('.dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === currentTip);
        });
    }

    // Auto-advance carousel
    setInterval(() => {
        currentTip = (currentTip + 1) % tips.length;
        updateCarousel();
    }, 5000);
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Update all statistics and achievements
    updateStatistics();
    updateAchievements();
    updateDailyChallenge();
    
    // Handle reward claiming
    const claimButton = document.querySelector('.claim-reward');
    if (claimButton) {
        claimButton.addEventListener('click', () => {
            if (!claimButton.disabled) {
                showNotification(`Congratulations! You've earned ${dailyChallenge.reward}!`);
                claimButton.disabled = true;
            }
        });
    }
    
    // Update challenge timer
    function updateChallengeTimer() {
        const timer = document.querySelector('.challenge-timer');
        if (timer) {
            const now = new Date();
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);
            const diff = endOfDay - now;
            
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            timer.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    setInterval(updateChallengeTimer, 1000);
    updateChallengeTimer();
    
    initTipsCarousel();
    
    // View options toggle
    const viewOptions = document.querySelectorAll('.view-option');
    viewOptions.forEach(option => {
        option.addEventListener('click', () => {
            viewOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            const view = option.dataset.view;
            document.getElementById('dashboard-todo-list').className = `todo-list ${view}-view`;
        });
    });
}); 