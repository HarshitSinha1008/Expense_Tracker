let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let expenseChart = null;

function renderExpense() {
    const list = document.getElementById('list');
    list.innerHTML = '';
    expenses.forEach(exp => {
        const li = document.createElement('li');
        li.textContent = `${exp.item} - ${exp.amount} - ${exp.date}`;
        list.appendChild(li);
    });
}

function clear_All() {
    localStorage.clear();
    document.getElementById("list").innerHTML = "";
    expenses = [];
    renderExpense();
    updateChart();
    alert('All expenses cleared');
}

function groupExpenses(expenses, groupBy) {
  const totals = {};

  expenses.forEach((expense) => {
    const key = expense[groupBy];
    if (!totals[key]) {
      totals[key] = 0;
    }
    totals[key] += Number(expense.amount);
  });

  return totals;
}

function updateChart() {
  
  const groupedByDate = groupExpenses(expenses, 'item'); 
  const labels = Object.keys(groupedByDate); 
  const data = Object.values(groupedByDate);

  const ctx = document.getElementById('chart').getContext('2d');
  if (expenseChart) {
    expenseChart.destroy();
  }
  expenseChart = new Chart(ctx, {
    type: 'pie',  // 👈 CHANGED THIS
    data: {
      labels: labels,
      datasets: [{
        label: 'Expenses by Date',
        data: data,
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
      }
    }
  });
}
    
document.getElementById("expenseForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const item = document.getElementById("item").value.trim();
    const amount = document.getElementById("amount").value;
    const date = document.getElementById("date").value;

    if (!item || !amount || !date) {
        alert("Please fill all fields");
        return;
    }

    if (Number(amount) < 0) {
        alert("Amount cannot be negative");
        return;
    }

    const expense = {
        item,
        amount: Number(amount),
        date
    };

    expenses.push(expense);
    localStorage.setItem("expenses", JSON.stringify(expenses));

    renderExpense();
    updateChart();
    e.target.reset();
});

document.getElementById("clear").addEventListener("click", clear_All);
document.addEventListener("DOMContentLoaded", () => {
  renderExpense();
  updateChart();
}); 
