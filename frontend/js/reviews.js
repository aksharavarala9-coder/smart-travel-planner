document.addEventListener('DOMContentLoaded', async () => {
    if (!Auth.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    const user = Auth.getUser();
    if (user) {
        document.getElementById('user-info').textContent = `Hi, ${user.name}`;
    }

    await loadReviews();

    // Event listener for dropdown filter
    document.getElementById('destination-filter').addEventListener('change', (e) => {
        loadReviews(e.target.value);
    });

    // Event listener for form submission
    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const destination = document.getElementById('destination').value;
            const rating = document.getElementById('rating').value;
            const text = document.getElementById('text').value;
            const submitBtn = reviewForm.querySelector('button[type="submit"]');

            try {
                submitBtn.textContent = 'Posting...';
                submitBtn.disabled = true;

                await apiCall('/reviews', {
                    method: 'POST',
                    body: JSON.stringify({ destination, rating: parseInt(rating), text })
                });

                showAlert('Review posted successfully!', 'success');
                reviewForm.reset();
                await loadReviews(document.getElementById('destination-filter').value);

            } catch (error) {
                showAlert(error.message, 'danger');
            } finally {
                submitBtn.textContent = 'Post Review';
                submitBtn.disabled = false;
            }
        });
    }
});

async function loadReviews(destinationFilter = '') {
    const container = document.getElementById('reviews-feed');
    container.innerHTML = '<div style="color: var(--text-muted);">Loading reviews...</div>';

    try {
        let url = '/reviews';
        if (destinationFilter) {
            url += `?destination=${destinationFilter}`;
        }
        
        const response = await apiCall(url);
        const reviews = response.data;

        if (reviews.length === 0) {
            container.innerHTML = `
                <div class="card" style="text-align: center; color: var(--text-muted);">
                    <h4>No reviews yet</h4>
                    <p style="margin-top: 0.5rem;">Be the first to share your experience!</p>
                </div>`;
            return;
        }

        container.innerHTML = reviews.map(review => {
            const stars = '⭐'.repeat(review.rating);
            const date = new Date(review.createdAt).toLocaleDateString();
            
            return `
            <div class="card" style="padding: 1.5rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <div>
                        <strong style="color: var(--primary); font-size: 1.1rem;">${review.destination}</strong>
                        <span style="color: var(--text-muted); font-size: 0.9rem; margin-left: 0.5rem;">by ${review.username}</span>
                    </div>
                    <div style="color: var(--text-muted); font-size: 0.85rem;">${date}</div>
                </div>
                <div class="star-rating" style="margin-bottom: 1rem;">${stars}</div>
                <p style="color: var(--text-main);">${review.text}</p>
            </div>
            `;
        }).join('');

    } catch (error) {
        showAlert('Failed to load reviews.', 'danger');
        container.innerHTML = `<div style="color: var(--danger);">Error loading reviews.</div>`;
    }
}
