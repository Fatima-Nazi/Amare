// Ratings.js - User feedback ratings for perfumes
const PERFUMES = [
    "Azure Elixer", 
    "Midnight Alpha", 
    "Velvet Desire", 
    "Oud 313", 
    "OUD 313 NOIR", 
    "5 Testers", 
    "3 Tester"
];

let feedbacks = JSON.parse(localStorage.getItem('perfumeFeedbacks')) || {};

function saveFeedbacks() {
    localStorage.setItem('perfumeFeedbacks', JSON.stringify(feedbacks));
}

function addFeedback(perfumeName, rating, comment, name) {
    if (!feedbacks[perfumeName]) feedbacks[perfumeName] = [];
    feedbacks[perfumeName].push({
        rating: parseInt(rating),
        comment: comment,
        name: name,
        date: new Date().toLocaleDateString()
    });
    saveFeedbacks();
}

function getAverageRating(perfumeName) {
    const reviews = feedbacks[perfumeName] || [];
    if (reviews.length === 0) return 0;
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    return Math.round(avg * 2) / 2; // 1 decimal
}

function displayRating(cardElement, perfumeName) {
    const avgRating = getAverageRating(perfumeName);
    const ratingDiv = cardElement.querySelector('.avg-rating');
    if (!ratingDiv) return;
    
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += `<i class="fas fa-star star ${i <= avgRating ? 'filled' : ''}"></i>`;
    }
    ratingDiv.innerHTML = stars + (avgRating > 0 ? ` <span>(${Math.round(avgRating * 10)/10} / ${feedbacks[perfumeName]?.length || 0} reviews)</span>` : '');
}

function displayAllRatings() {
    document.querySelectorAll('.product-card, .product-cardi').forEach(card => {
        const h3 = card.querySelector('h3');
        if (h3) {
            const perfumeName = h3.textContent.trim();
            displayRating(card, perfumeName);
        }
    });
}

// Feedback form helpers
function initRatingStars(inputId) {
    const stars = document.querySelectorAll(`#${inputId} .star`);
    let selected = 0;
    
    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            selected = index + 1;
            stars.forEach((s, i) => {
                if (i < selected) {
                    s.classList.add('filled', 'active');
                } else {
                    s.classList.remove('filled', 'active');
                }
            });
            document.getElementById(inputId.replace('stars', 'rating')).value = selected;
        });
    });
}

// Init on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        displayAllRatings();
    });
} else {
    displayAllRatings();
}
