document.addEventListener('DOMContentLoaded', async () => {
    if (!Auth.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    const user = Auth.getUser();
    if (user) {
        document.getElementById('user-info').textContent = `Hi, ${user.name}`;
    }

    await loadTrips();
});

async function loadTrips() {
    const container = document.getElementById('trips-container');
    
    try {
        const response = await apiCall('/trips');
        const trips = response.data;

        if (trips.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 3rem; background: var(--surface); border-radius: 1rem;">
                    <h3>No trips planned yet</h3>
                    <p style="margin-top: 0.5rem;">Start exploring the world by creating your first trip.</p>
                </div>`;
            return;
        }

        container.innerHTML = trips.map(trip => `
            <div class="card cursor-pointer" onclick="viewTrip('${trip._id}')">
                <h3 style="color: var(--primary); margin-bottom: 0.5rem;">${trip.destination}</h3>
                <div style="display: flex; justify-content: space-between; color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem;">
                    <span>${trip.days} Days</span>
                    <span>Budget: $${trip.budget}</span>
                </div>
                <div style="background: var(--bg-light); padding: 1rem; border-radius: 0.5rem; font-size: 0.9rem;">
                    <strong>AI Itinerary:</strong> ${trip.itinerary ? trip.itinerary.length : 0} Days Planned
                </div>
            </div>
        `).join('');

    } catch (error) {
        showAlert(error.message, 'danger');
        container.innerHTML = `<div style="grid-column: 1 / -1; color: var(--danger); text-align: center;">Failed to load trips</div>`;
    }
}

function viewTrip(tripId) {
    // Save to local storage so other pages know which trip is active
    localStorage.setItem('activeTripId', tripId);
    window.location.href = 'expenses.html';
}
