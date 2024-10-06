// Exchange rate for USD to EUR (can be updated dynamically if needed)
const exchangeRate = 0.91;

// Load data from localStorage when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    updateSummary();
});

// Event listener for adding or updating a purchase
document.getElementById('add-btn').addEventListener('click', addPurchase);

let editIndex = -1;  // Global variable to track which item is being edited

// Function to add or update a purchase
function addPurchase() {
    const date = document.getElementById('date').value;
    const purchaseAmount = parseFloat(document.getElementById('purchase').value);
    const earningAmount = parseFloat(document.getElementById('earning').value);

    if (!date || isNaN(purchaseAmount) || isNaN(earningAmount)) {
        alert('Please fill in all fields correctly!');
        return;
    }

    // Convert purchase and earnings to EUR
    const purchaseInEUR = (purchaseAmount * exchangeRate).toFixed(2);
    const earningInEUR = (earningAmount * exchangeRate).toFixed(2);

    // Calculate expiry date (60 days from the purchase date)
    const expiryDate = new Date(date);
    expiryDate.setDate(expiryDate.getDate() + 60);
    const expiryDateStr = expiryDate.toISOString().split('T')[0];

    // Create a purchase object
    const purchase = {
        date,
        purchaseAmount: purchaseAmount.toFixed(2),
        purchaseInEUR,
        earningAmount: earningAmount.toFixed(2),
        earningInEUR,
        expiryDate: expiryDateStr
    };

    let purchases = JSON.parse(localStorage.getItem('purchases')) || [];

    if (editIndex === -1) {
        // If we're adding a new purchase
        purchases.push(purchase);
    } else {
        // If we're updating an existing purchase
        purchases[editIndex] = purchase;
        editIndex = -1; // Reset after editing
        document.getElementById('add-btn').textContent = 'Add Purchase'; // Reset button text
    }

    // Save updated purchases to localStorage
    localStorage.setItem('purchases', JSON.stringify(purchases));

    // Refresh the table and summary
    refreshTable();
    updateSummary();

    // Clear inputs
    document.getElementById('date').value = '';
    document.getElementById('purchase').value = '';
    document.getElementById('earning').value = '';
}

// Function to save purchase to localStorage
function savePurchase(purchase) {
    let purchases = JSON.parse(localStorage.getItem('purchases')) || [];
    purchases.push(purchase);
    localStorage.setItem('purchases', JSON.stringify(purchases));
}

// Function to load data from localStorage
function loadData() {
    let purchases = JSON.parse(localStorage.getItem('purchases')) || [];
    purchases.forEach((purchase, index) => appendPurchaseToTable(purchase, index));
}

// Function to append a purchase to the table
function appendPurchaseToTable(purchase, index) {
    const table = document.getElementById('purchase-list');
    const row = document.createElement('tr');

    row.innerHTML = `
        <td>${purchase.date}</td>
        <td>$${purchase.purchaseAmount}</td>
        <td>€${purchase.purchaseInEUR}</td>
        <td>$${purchase.earningAmount}</td>
        <td>€${purchase.earningInEUR}</td>
        <td>${purchase.expiryDate}</td>
        <td>
            <button class="edit-btn" onclick="editPurchase(${index})">Edit</button>
            <button class="delete-btn" onclick="deletePurchase(${index})">Delete</button>
        </td>
    `;

    table.appendChild(row);
}

// Function to edit a purchase
function editPurchase(index) {
    let purchases = JSON.parse(localStorage.getItem('purchases')) || [];
    const purchase = purchases[index];

    document.getElementById('date').value = purchase.date;
    document.getElementById('purchase').value = purchase.purchaseAmount;
    document.getElementById('earning').value = purchase.earningAmount;

    editIndex = index;
    document.getElementById('add-btn').textContent = 'Update Purchase';  // Change button text
}

// Function to delete a purchase
function deletePurchase(index) {
    let purchases = JSON.parse(localStorage.getItem('purchases')) || [];
    
    purchases.splice(index, 1);  // Remove the purchase at the specified index
    localStorage.setItem('purchases', JSON.stringify(purchases));  // Update localStorage

    refreshTable();  // Refresh the table
    updateSummary();  // Refresh summary
}

// Function to refresh the table content
function refreshTable() {
    const table = document.getElementById('purchase-list');
    table.innerHTML = '';  // Clear existing rows

    let purchases = JSON.parse(localStorage.getItem('purchases')) || [];
    purchases.forEach((purchase, index) => appendPurchaseToTable(purchase, index));
}

// Function to update the summary
function updateSummary() {
    let purchases = JSON.parse(localStorage.getItem('purchases')) || [];
    let totalPurchasesUSD = 0, totalPurchasesEUR = 0, totalEarningsUSD = 0, totalEarningsEUR = 0;
    let projectedEarningsUSD = 0, projectedEarningsEUR = 0;
    let monthEndEarningsUSD = 0, monthEndEarningsEUR = 0;  // New variables for earnings until the end of the month

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const endOfMonth = new Date(currentDate.getFullYear(), currentMonth + 1, 0); // Last day of the current month

    purchases.forEach(purchase => {
        totalPurchasesUSD += parseFloat(purchase.purchaseAmount);
        totalPurchasesEUR += parseFloat(purchase.purchaseInEUR);
        totalEarningsUSD += parseFloat(purchase.earningAmount);
        totalEarningsEUR += parseFloat(purchase.earningInEUR);

        // Calculate projected earnings over 60 days (multiplying by 60)
        projectedEarningsUSD += parseFloat(purchase.earningAmount) * 60;
        projectedEarningsEUR += parseFloat(purchase.earningInEUR) * 60;

        // Calculate earnings until the end of the month (based on the purchase date)
        const purchaseDate = new Date(purchase.date);
        if (purchaseDate.getMonth() === currentMonth) {
            const daysLeft = Math.min((endOfMonth - purchaseDate) / (1000 * 60 * 60 * 24), 60);
            monthEndEarningsUSD += parseFloat(purchase.earningAmount) * daysLeft;
            monthEndEarningsEUR += parseFloat(purchase.earningInEUR) * daysLeft;
        }
    });

    // Update the total purchases and earnings
    document.getElementById('total-purchases').textContent = `$${totalPurchasesUSD.toFixed(2)} / €${totalPurchasesEUR.toFixed(2)}`;
    document.getElementById('total-earnings').textContent = `$${totalEarningsUSD.toFixed(2)} / €${totalEarningsEUR.toFixed(2)}`;

    // Update the projected earnings over 60 days
    document.getElementById('projected-earnings').textContent = `$${projectedEarningsUSD.toFixed(2)} / €${projectedEarningsEUR.toFixed(2)}`;

    // Update the earnings until the end of the month
    document.getElementById('month-end-earnings').textContent = `$${monthEndEarningsUSD.toFixed(2)} / €${monthEndEarningsEUR.toFixed(2)}`;
}
