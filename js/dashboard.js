// DOM Elements
const productivityScoreEl = document.querySelector('.productivity-score');
const completedTodayEl = document.querySelector('.completed-today');
const currentStreakEl = document.querySelector('.current-streak');
const progressBarEl = document.querySelector('.progress-bar');

// Dashboard Statistics
let statistics = {
    productivityScore: 0,
    completedToday: 0,
    currentStreak: 0,
    achievements: {
        'early-bird': { current: 0, total: 5, unlocked: false },
        'streak-master': { current: 0, total: 7, unlocked: false },
        'task-crusher': { current: 0, total: 50, unlocked: false }
    },
    lastCompletedDate: null
};

// Load statistics from localStorage
function loadStatistics() {
    const savedStats = localStorage.getItem('dashboardStats');
    if (savedStats) {
        statistics = JSON.parse(savedStats);
    }
    updateDashboard();
}

// Save statistics to localStorage
function saveStatistics() {
    localStorage.setItem('dashboardStats', JSON.stringify(statistics));
}

// Update all dashboard elements
function updateDashboard() {
    updateProductivityScore();
    updateCompletedToday();
    updateStreak();
    updateAchievements();
    updateChallengeTimer();
}

// Calculate and update productivity score
function updateProductivityScore() {
    const todos = JSON.parse(localStorage.getItem('todos')) || [];
    const total = todos.length;
    const completed = todos.filter(todo => todo.done).length;
    statistics.productivityScore = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const scoreElement = document.getElementById('productivity-score');
    const progressFill = scoreElement?.closest('.stat-card')?.querySelector('.progress-fill');
    
    if (scoreElement) {
        scoreElement.textContent = `${statistics.productivityScore}%`;
    }
    if (progressFill) {
        progressFill.style.width = `${statistics.productivityScore}%`;
    }
}

// Update completed tasks today
function updateCompletedToday() {
    const todos = JSON.parse(localStorage.getItem('todos')) || [];
    const today = new Date().setHours(0, 0, 0, 0);
    
    statistics.completedToday = todos.filter(todo => {
        if (!todo.done || !todo.completedAt) return false;
        const completedDate = new Date(todo.completedAt).setHours(0, 0, 0, 0);
        return completedDate === today;
    }).length;
    
    const completedTodayElement = document.getElementById('completed-today');
    if (completedTodayElement) {
        completedTodayElement.textContent = statistics.completedToday;
    }
}

// Update streak count
function updateStreak() {
    const todos = JSON.parse(localStorage.getItem('todos')) || [];
    const today = new Date().setHours(0, 0, 0, 0);
    
    if (statistics.lastCompletedDate) {
        const lastDate = new Date(statistics.lastCompletedDate).setHours(0, 0, 0, 0);
        const daysDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff > 1) {
            statistics.currentStreak = 0;
        } else if (daysDiff === 1) {
            // Check if there are completed tasks today to continue the streak
            const completedToday = todos.some(todo => {
                if (!todo.done || !todo.completedAt) return false;
                const completedDate = new Date(todo.completedAt).setHours(0, 0, 0, 0);
                return completedDate === today;
            });
            
            if (!completedToday) {
                statistics.currentStreak = 0;
            }
        }
    }
    
    const completedToday = todos.some(todo => {
        if (!todo.done || !todo.completedAt) return false;
        const completedDate = new Date(todo.completedAt).setHours(0, 0, 0, 0);
        return completedDate === today;
    });
    
    if (completedToday) {
        if (statistics.currentStreak === 0 || !statistics.lastCompletedDate) {
            statistics.currentStreak = 1;
        }
        statistics.lastCompletedDate = new Date().toISOString();
    }
    
    const streakElement = document.querySelector('.streak-count');
    if (streakElement) {
        streakElement.textContent = statistics.currentStreak;
    }
}

// Update achievements
function updateAchievements() {
    const todos = JSON.parse(localStorage.getItem('todos')) || [];
    const today = new Date().setHours(0, 0, 0, 0);
    
    // Early Bird Achievement
    const earlyTasks = todos.filter(todo => {
        if (!todo.done || !todo.completedAt) return false;
        const completedTime = new Date(todo.completedAt);
        const completedDate = completedTime.setHours(0, 0, 0, 0);
        return completedDate === today && completedTime.getHours() < 9;
    }).length;
    statistics.achievements['early-bird'].current = earlyTasks;
    
    // Streak Master Achievement
    statistics.achievements['streak-master'].current = statistics.currentStreak;
    
    // Task Crusher Achievement
    statistics.achievements['task-crusher'].current = todos.filter(todo => todo.done).length;
    
    // Update UI for each achievement
    Object.entries(statistics.achievements).forEach(([key, achievement]) => {
        const card = document.querySelector(`[data-achievement="${key}"]`);
        if (!card) return;
        
        const progressFill = card.querySelector('.progress-fill');
        const current = card.querySelector('.current');
        const percentage = card.querySelector('.percentage');
        const lockedBadge = card.querySelector('.status-badge.locked');
        const unlockedBadge = card.querySelector('.status-badge.unlocked');
        
        const progress = (achievement.current / achievement.total) * 100;
        
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
        if (current) {
            current.textContent = achievement.current;
        }
        if (percentage) {
            percentage.textContent = `${Math.round(progress)}%`;
        }
        
        if (achievement.current >= achievement.total && !achievement.unlocked) {
            achievement.unlocked = true;
            if (lockedBadge) lockedBadge.style.display = 'none';
            if (unlockedBadge) unlockedBadge.style.display = 'block';
            showNotification('Achievement Unlocked! 🎉');
        }
    });
}

// Tips Carousel
let currentTipIndex = 0;
const tips = document.querySelectorAll('.tip-card');

function showTip(index) {
    tips.forEach(tip => {
        tip.classList.remove('active');
        tip.style.transform = 'translateX(100%)';
        tip.style.opacity = '0';
    });
    
    tips[index].classList.add('active');
    tips[index].style.transform = 'translateX(0)';
    tips[index].style.opacity = '1';
}

function nextTip() {
    currentTipIndex = (currentTipIndex + 1) % tips.length;
    showTip(currentTipIndex);
}

function previousTip() {
    currentTipIndex = (currentTipIndex - 1 + tips.length) % tips.length;
    showTip(currentTipIndex);
}

// Challenge Timer
function updateChallengeTimer() {
    const now = new Date();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const timeLeft = endOfDay - now;
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    document.getElementById('challenge-timer').textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Notifications
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadStatistics();
    
    // Tips carousel navigation
    const prevButton = document.querySelector('.nav-button.prev');
    const nextButton = document.querySelector('.nav-button.next');
    if (prevButton) prevButton.addEventListener('click', previousTip);
    if (nextButton) nextButton.addEventListener('click', nextTip);
    
    // Update challenge timer every second
    setInterval(updateChallengeTimer, 1000);
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
        });
    }
    
    // Load saved theme
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
});

// Listen for todo updates
window.addEventListener('todoUpdated', () => {
    updateDashboard();
    saveStatistics();
});

// Initial setup
showTip(0); 