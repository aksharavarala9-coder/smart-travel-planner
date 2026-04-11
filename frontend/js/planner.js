let map;

document.addEventListener('DOMContentLoaded', () => {
    if (!Auth.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    const user = Auth.getUser();
    if (user) {
        document.getElementById('user-info').textContent = `Hi, ${user.name}`;
    }

    // Initialize Map with a default view (World View)
    map = L.map('map').setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    const plannerForm = document.getElementById('planner-form');
    if (plannerForm) {
        plannerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const destination = document.getElementById('destination').value;
            const days = document.getElementById('days').value;
            const budget = document.getElementById('budget').value;
            const submitBtn = plannerForm.querySelector('button[type="submit"]');

            try {
                submitBtn.textContent = 'Generating...';
                submitBtn.disabled = true;

                const response = await apiCall('/trips', {
                    method: 'POST',
                    body: JSON.stringify({ destination, days: parseInt(days), budget: parseFloat(budget) })
                });

                showAlert('Trip successfully created and itinerary generated!', 'success');
                displayItinerary(response.data);
                
                // Simple geocoding using Nominatim (OpenStreetMap) to pan the map
                fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data && data.length > 0) {
                            const lat = data[0].lat;
                            const lon = data[0].lon;
                            map.setView([lat, lon], 12);
                            L.marker([lat, lon]).addTo(map)
                                .bindPopup(`<b>${destination}</b><br>Trip Location`)
                                .openPopup();
                        }
                    });

                // Set this trip as active for expenses
                localStorage.setItem('activeTripId', response.data._id);
                document.getElementById('manage-expenses-btn').style.display = 'inline-flex';

            } catch (error) {
                showAlert(error.message, 'danger');
            } finally {
                submitBtn.textContent = 'Generate Itinerary & Visualize Map';
                submitBtn.disabled = false;
            }
        });
    }
});

function displayItinerary(trip) {
    const container = document.getElementById('itinerary-container');
    const content = document.getElementById('itinerary-content');
    
    container.style.display = 'block';
    content.innerHTML = trip.itinerary.map(dayInfo => `
        <div class="card glass-card" style="background: white;">
            <h4 style="color: var(--primary); margin-bottom: 1rem;">Day ${dayInfo.day}</h4>
            <ul style="color: var(--text-main); font-size: 0.95rem; padding-left: 1.2rem; list-style-type: disc;">
                ${dayInfo.activities.map(act => `<li style="margin-bottom: 0.5rem;">${act}</li>`).join('')}
            </ul>
        </div>
    `).join('');
}
