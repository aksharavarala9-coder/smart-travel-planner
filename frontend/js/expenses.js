document.addEventListener('DOMContentLoaded', async () => {
    if (!Auth.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    const user = Auth.getUser();
    if (user) document.getElementById('user-info').textContent = `Hi, ${user.name}`;

    const tripId = localStorage.getItem('activeTripId');
    if (!tripId) {
        document.getElementById('active-trip-name').textContent = 'No trip selected';
        document.getElementById('alert-container').innerHTML = `
            <div class="alert alert-danger" style="display: flex; justify-content: space-between; align-items: center;">
                Please select a trip from the dashboard first.
                <a href="dashboard.html" class="btn btn-secondary btn-sm" style="padding: 0.25rem 0.75rem;">Go to Dashboard</a>
            </div>`;
        
        // Disable form
        document.getElementById('expense-form').querySelectorAll('input, button').forEach(el => el.disabled = true);
        return;
    }

    await loadTripDetails(tripId);
    await loadExpenses(tripId);

    // Form submission
    const expenseForm = document.getElementById('expense-form');
    if (expenseForm) {
        expenseForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const description = document.getElementById('description').value;
            const amount = parseFloat(document.getElementById('amount').value);
            const paidBy = document.getElementById('paidBy').value.trim();
            const splitAmongRaw = document.getElementById('splitAmong').value;
            
            const splitAmong = splitAmongRaw.split(',').map(name => name.trim()).filter(name => name);

            if (splitAmong.length === 0) {
                showAlert('Please provide at least one person to split among.', 'danger');
                return;
            }

            try {
                const submitBtn = expenseForm.querySelector('button[type="submit"]');
                submitBtn.disabled = true;
                submitBtn.textContent = 'Adding...';

                await apiCall('/expenses', {
                    method: 'POST',
                    body: JSON.stringify({
                        tripId,
                        description,
                        amount,
                        paidBy,
                        splitAmong
                    })
                });

                showAlert('Expense added successfully!', 'success');
                expenseForm.reset();
                await loadExpenses(tripId);

            } catch (error) {
                showAlert(error.message, 'danger');
            } finally {
                const submitBtn = expenseForm.querySelector('button[type="submit"]');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Add Expense';
            }
        });
    }
});

async function loadTripDetails(tripId) {
    try {
        const response = await apiCall(`/trips/${tripId}`);
        const trip = response.data;
        document.getElementById('active-trip-name').textContent = trip.destination;
    } catch (error) {
        console.error('Error loading trip details', error);
    }
}

async function loadExpenses(tripId) {
    try {
        const response = await apiCall(`/expenses/${tripId}`);
        const { data: expenses, balances } = response;

        // Render History
        const listContainer = document.getElementById('expenses-list');
        if (expenses.length === 0) {
            listContainer.innerHTML = '<div style="color: var(--text-muted); font-size: 0.9rem;">No expenses recorded yet.</div>';
        } else {
            listContainer.innerHTML = expenses.map(exp => `
                <div style="padding: 0.75rem; border: 1px solid var(--border); border-radius: 0.5rem; background: var(--surface);">
                    <div style="display: flex; justify-content: space-between; font-weight: 500; margin-bottom: 0.25rem;">
                        <span>${exp.description}</span>
                        <span>$${exp.amount.toFixed(2)}</span>
                    </div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">
                        Paid by <b>${exp.paidBy}</b>. Split among: ${exp.splitAmong.join(', ')}
                    </div>
                </div>
            `).join('');
        }

        // Render Balances
        const balancesContainer = document.getElementById('balances-container');
        const balanceEntries = Object.entries(balances);
        
        if (balanceEntries.length === 0) {
            balancesContainer.innerHTML = 'All settled up!';
        } else {
            balancesContainer.innerHTML = balanceEntries.map(([person, amount]) => {
                const isOwed = amount > 0;
                const isOwing = amount < 0;
                let text = `${person} is settled`;
                let color = 'var(--text-main)';
                
                if (isOwed) {
                    text = `${person} gets back $${Math.abs(amount).toFixed(2)}`;
                    color = 'var(--secondary)'; // green
                } else if (isOwing) {
                    text = `${person} owes $${Math.abs(amount).toFixed(2)}`;
                    color = 'var(--danger)'; // red
                }
                
                return `<div style="color: ${color}; margin-bottom: 0.25rem;">• ${text}</div>`;
            }).join('');
        }

    } catch (error) {
        console.error('Error loading expenses', error);
        showAlert('Could not load expenses.', 'danger');
    }
}
