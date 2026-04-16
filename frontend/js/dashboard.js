document.addEventListener('DOMContentLoaded', async () => {
    if (!Auth.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    const user = Auth.getUser();
    if (user) {
        document.getElementById('user-info').textContent = `Namaste, ${user.name}`;
    }

    await loadTripsAndCharts();
    initGeolocation();
});

async function loadTripsAndCharts() {
    const container = document.getElementById('trips-container');
    
    try {
        const response = await apiCall('/trips');
        const trips = response.data;

        if (trips.length === 0) {
            container.innerHTML = `
                <div class="card" style="grid-column: 1 / -1; text-align: center;">
                    <h3 style="color: var(--primary);">No trips planned yet</h3>
                    <p style="margin-top: 0.5rem; color: var(--text-muted);">Start exploring incredible India by creating your first trip.</p>
                    <a href="planner.html" class="btn btn-primary" style="margin-top: 1rem;">Plan Trip</a>
                </div>`;
            return;
        }

        // Render Trip Cards
        container.innerHTML = trips.map(trip => `
            <div class="card cursor-pointer" onclick="viewTrip('${trip._id}')" style="cursor: pointer;">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <h3 style="color: var(--primary); margin-bottom: 0.5rem;">${trip.destination}</h3>
                    <span style="background: var(--bg-light); color: var(--text-muted); font-size: 0.8rem; padding: 0.25rem 0.5rem; border-radius: 4px;">${trip.days} Days</span>
                </div>
                <div style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1rem;">
                    <span style="font-weight: 500; color: var(--text-main);">Budget:</span> ₹${trip.budget}
                </div>
                <div style="background: rgba(46, 204, 113, 0.1); color: var(--secondary); padding: 0.5rem 1rem; border-radius: 0.5rem; font-size: 0.9rem; border: 1px solid rgba(46, 204, 113, 0.2);">
                    <strong>Guide Generated:</strong> ${trip.itinerary ? trip.itinerary.length : 0} Spots Map Available
                </div>
            </div>
        `).join('');

        // Generate Charts based on Trip Data
        generateCharts(trips);

    } catch (error) {
        showAlert(error.message, 'danger');
        container.innerHTML = `<div style="grid-column: 1 / -1; color: var(--danger); text-align: center;">Failed to load your travel data</div>`;
    }
}

function generateCharts(trips) {
    // Process Data for Pie Chart (Destinations)
    const destinationCounts = {};
    trips.forEach(t => {
        destinationCounts[t.destination] = (destinationCounts[t.destination] || 0) + 1;
    });

    const destLabels = Object.keys(destinationCounts);
    const destData = Object.values(destinationCounts);

    const ctxTrips = document.getElementById('tripsChart').getContext('2d');
    new Chart(ctxTrips, {
        type: 'doughnut',
        data: {
            labels: destLabels,
            datasets: [{
                data: destData,
                backgroundColor: ['#FF9933', '#138808', '#000080', '#FBBF24', '#3B82F6'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Process Data for Bar Chart (Budget)
    const budgetLabels = trips.map((t, index) => `${t.destination} (Trip ${index+1})`);
    const budgetData = trips.map(t => t.budget);

    const ctxBudget = document.getElementById('budgetChart').getContext('2d');
    new Chart(ctxBudget, {
        type: 'bar',
        data: {
            labels: budgetLabels,
            datasets: [{
                label: 'Allocated Budget (₹)',
                data: budgetData,
                backgroundColor: '#FF9933',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function viewTrip(tripId) {
    localStorage.setItem('activeTripId', tripId);
    window.location.href = 'expenses.html';
}

function initGeolocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async position => {
                const { latitude, longitude } = position.coords;
                // Reverse geocode using Nominatim
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await res.json();
                    
                    const city = data.address.city || data.address.town || data.address.village || data.address.county || 'Unknown Location';
                    document.getElementById('current-location').innerHTML = `📍 ${city}, India`;
                    
                    // Mock weather
                    document.getElementById('weather-info').innerHTML = `
                        <div style="font-size: 2rem;">⛅</div>
                        <div style="font-size: 0.9rem;">28°C, Partly Cloudy</div>
                    `;

                    // Generate nearby trips
                    generateNearbyTrips(city);

                } catch (error) {
                    document.getElementById('current-location').innerHTML = `📍 Location found, exact town unavailable`;
                }
            },
            () => {
                document.getElementById('current-location').innerHTML = `📍 Location access denied`;
            }
        );
    }
}

function generateNearbyTrips(city) {
    const list = document.getElementById('nearby-trips');
    // Provide some context aware suggestions based on Indian geography
    let suggestions = [];
    if (city.includes('Hyderabad') || city.includes('Telangana') || city.includes('Andhra')) {
        suggestions = ['Warangal Fort (Weekend getaway)', 'Nagarjuna Sagar (1-day trip)', 'Srisailam (Spiritual trip)'];
    } else if (city.includes('Mumbai') || city.includes('Maharashtra')) {
        suggestions = ['Lonavala (Scenic)', 'Mahabaleshwar (Hills)', 'Alibaug (Beaches)'];
    } else if (city.includes('Delhi') || city.includes('Haryana') || city.includes('UP')) {
        suggestions = ['Agra (Taj Mahal)', 'Jaipur (Pink City)', 'Rishikesh (Adventure)'];
    } else if (city.includes('Bangalore') || city.includes('Karnataka')) {
        suggestions = ['Mysore (Heritage)', 'Coorg (Coffee Estates)', 'Ooty (Hills)'];
    } else {
        suggestions = ['Local heritage walk', 'Main City Museum', 'Nature reserve exploration'];
    }

    list.innerHTML = suggestions.map(s => `<li style="margin-bottom: 0.5rem;">🗺️ ${s}</li>`).join('');
}
