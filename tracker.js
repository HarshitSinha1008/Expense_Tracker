let expenses = [];
        let expenseChart = null;
        let currentFilter = 'all';

        // Set today's date as default
        document.getElementById('date').valueAsDate = new Date();

        // Initialize
        function init() {
            expenses = JSON.parse(localStorage.getItem('expenses')) || [];
            renderExpenses();
            updateChart();
            updateStats();
        }

        // Render expenses
        function renderExpenses() {
            const list = document.getElementById('expenseList');
            const filtered = currentFilter === 'all' 
                ? expenses 
                : expenses.filter(exp => exp.category === currentFilter);

            if (filtered.length === 0) {
                list.innerHTML = `
                    <div class="empty-state">
                        <i class="ri-inbox-line"></i>
                        <p>No expenses yet. Start tracking!</p>
                    </div>
                `;
                return;
            }

            list.innerHTML = filtered.map((exp, index) => `
                <div class="expense-item">
                    <div class="expense-info">
                        <span class="expense-category category-${exp.category}">
                            ${getCategoryName(exp.category)}
                        </span>
                        <div class="expense-name">${exp.item}</div>
                        <div class="expense-date">${formatDate(exp.date)}</div>
                    </div>
                    <div class="expense-amount">₹${exp.amount.toFixed(2)}</div>
                    <button class="btn-delete" onclick="deleteExpense(${expenses.indexOf(exp)})">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </div>
            `).join('');
        }

        // Update statistics
        function updateStats() {
            const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const monthTotal = expenses
                .filter(exp => {
                    const expDate = new Date(exp.date);
                    return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
                })
                .reduce((sum, exp) => sum + exp.amount, 0);

            document.getElementById('totalExpenses').textContent = `₹${total.toFixed(2)}`;
            document.getElementById('monthExpenses').textContent = `₹${monthTotal.toFixed(2)}`;
            document.getElementById('itemCount').textContent = expenses.length;
        }

        // Update chart
        function updateChart() {
            const categoryTotals = {};
            expenses.forEach(exp => {
                categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
            });

            const labels = Object.keys(categoryTotals).map(getCategoryName);
            const data = Object.values(categoryTotals);
            const colors = ['#ffeaa7', '#74b9ff', '#fab1a0', '#a29bfe', '#fd79a8', '#dfe6e9'];

            const ctx = document.getElementById('chart').getContext('2d');
            
            if (expenseChart) {
                expenseChart.destroy();
            }

            expenseChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: colors,
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 15,
                                font: { size: 12 }
                            }
                        }
                    }
                }
            });
        }

        // Add expense
        document.getElementById('expenseForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const item = document.getElementById('item').value.trim();
            const category = document.getElementById('category').value;
            const amount = parseFloat(document.getElementById('amount').value);
            const date = document.getElementById('date').value;

            if (amount <= 0) {
                alert('Amount must be greater than 0');
                return;
            }

            const expense = { item, category, amount, date };
            expenses.unshift(expense);
            localStorage.setItem('expenses', JSON.stringify(expenses));

            renderExpenses();
            updateChart();
            updateStats();
            e.target.reset();
            document.getElementById('date').valueAsDate = new Date();
            
            // Show success feedback
            const btn = e.target.querySelector('button');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="ri-check-line"></i> Added!';
            setTimeout(() => btn.innerHTML = originalText, 1500);
        });

        // Delete expense
        function deleteExpense(index) {
            if (confirm('Delete this expense?')) {
                expenses.splice(index, 1);
                localStorage.setItem('expenses', JSON.stringify(expenses));
                renderExpenses();
                updateChart();
                updateStats();
            }
        }

        // Filter expenses
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                renderExpenses();
            });
        });

        // Clear all
        document.getElementById('clearBtn').addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all expenses? This cannot be undone.')) {
                expenses = [];
                localStorage.removeItem('expenses');
                renderExpenses();
                updateChart();
                updateStats();
            }
        });

        // Export data
        document.getElementById('exportBtn').addEventListener('click', () => {
            if (expenses.length === 0) {
                alert('No expenses to export!');
                return;
            }

            const csv = [
                ['Date', 'Item', 'Category', 'Amount'],
                ...expenses.map(exp => [exp.date, exp.item, getCategoryName(exp.category), exp.amount])
            ].map(row => row.join(',')).join('\n');

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        });

        // Helper functions
        function getCategoryName(category) {
            const names = {
                food: 'Food & Dining',
                transport: 'Transport',
                entertainment: 'Entertainment',
                utilities: 'Utilities',
                shopping: 'Shopping',
                other: 'Other'
            };
            return names[category] || category;
        }

        function formatDate(dateStr) {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-IN', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
            });
        }

        // Initialize on load
        init();