let currentFilter = 'all';

function filterByCategory(category) {
    currentFilter = category;
    const rows = document.querySelectorAll('#btkTable tbody tr');
    const buttons = document.querySelectorAll('.filter-btn');
    
    buttons.forEach(btn => btn.classList.remove('active'));
    
    buttons.forEach(btn => {
        if (btn.textContent.includes('Összes') && category === 'all') btn.classList.add('active');
        if (btn.textContent.includes('Kisebb') && category === 'low') btn.classList.add('active');
        if (btn.textContent.includes('Közepes') && category === 'medium') btn.classList.add('active');
        if (btn.textContent.includes('Súlyos') && category === 'serious') btn.classList.add('active');
        if (btn.textContent.includes('Korrupció') && category === 'corruption') btn.classList.add('active');
    });
    
    rows.forEach(row => {
        if (row.classList.contains('category') || row.classList.contains('corruption')) {
            row.style.display = '';
        } else if (category === 'all') {
            row.style.display = '';
        } else {
            const rowCategory = row.getAttribute('data-category');
            if (rowCategory === category) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    });
    
    updateStats();
}

function searchTable() {
    const input = document.querySelector('.search-box');
    const filter = input.value.toLowerCase();
    const rows = document.querySelectorAll('#btkTable tbody tr');
    
    rows.forEach(row => {
        if (row.classList.contains('category') || row.classList.contains('corruption')) {
            return;
        }
        
        const code = row.cells[1]?.textContent.toLowerCase() || '';
        const name = row.cells[2]?.textContent.toLowerCase() || '';
        const description = row.cells[5]?.textContent.toLowerCase() || '';
        
        if (code.includes(filter) || name.includes(filter) || description.includes(filter)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
    
    updateStats();
}

function updateStats() {
    const visibleRows = document.querySelectorAll('#btkTable tbody tr:not(.category):not(.corruption):not([style*="display: none"])');
    
    let totalCrimes = 0;
    let totalFines = 0;
    let totalPrison = 0;
    let statePrisonCount = 0;
    
    visibleRows.forEach(row => {
        if (row.cells.length >= 5) {
            totalCrimes++;
            
            const fine = parseInt(row.cells[3].textContent.replace(/[\$,]/g, '')) || 0;
            const prison = parseInt(row.cells[4].textContent) || 0;
            
            totalFines += fine;
            totalPrison += prison;
            
            if (prison > 60) {
                statePrisonCount++;
            }
        }
    });
    
    document.getElementById('totalCrimes').textContent = totalCrimes;
    document.getElementById('avgFine').textContent = totalCrimes > 0 ? '$' + Math.round(totalFines / totalCrimes).toLocaleString() : '$0';
    document.getElementById('avgPrison').textContent = totalCrimes > 0 ? Math.round(totalPrison / totalCrimes) + ' perc' : '0 perc';
    document.getElementById('statePrisonCount').textContent = statePrisonCount;
}

document.addEventListener('DOMContentLoaded', function() {
    const firstFilterBtn = document.querySelector('.filter-btn');
    if (firstFilterBtn) {
        firstFilterBtn.classList.add('active');
    }
    
    updateStats();
});

document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        document.querySelector('.search-box').focus();
    }
});