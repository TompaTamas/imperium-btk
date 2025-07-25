let currentTheme = 'light';
let currentFilter = 'all';

function toggleTheme() {
    const body = document.body;
    const button = document.querySelector('.theme-toggle');
    
    if (currentTheme === 'light') {
        body.setAttribute('data-theme', 'dark');
        button.innerHTML = '☀️ Világos téma';
        currentTheme = 'dark';
    } else {
        body.setAttribute('data-theme', 'light');
        button.innerHTML = '🌙 Sötét téma';
        currentTheme = 'light';
    }
    
    // localStorage helyett sessionStorage használata (memóriában tárolás)
    sessionStorage.setItem('theme', currentTheme);
}

function filterByCategory(category) {
    currentFilter = category;
    const rows = document.querySelectorAll('#btkTable tbody tr');
    const buttons = document.querySelectorAll('.filter-btn');
    
    // Update active button
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Find the clicked button and make it active
    buttons.forEach(btn => {
        if (btn.textContent.includes('Összes') && category === 'all') btn.classList.add('active');
        if (btn.textContent.includes('Kisebb') && category === 'minor') btn.classList.add('active');
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

function exportToCSV() {
    const table = document.getElementById('btkTable');
    let csv = 'sep=,\n'; // Excel separator hint
    
    // Header
    const headers = ['Súlyosság', 'Rövidítés', 'Bűncselekmény megnevezése', 'Átlagos Bírság (USD)', 'Kiszabható börtönbüntetés (perc)', 'Magyarázat'];
    csv += headers.join(',') + '\n';
    
    // Data rows
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        if (row.style.display !== 'none' && !row.classList.contains('category') && !row.classList.contains('corruption')) {
            const cols = row.querySelectorAll('td');
            const rowData = [];
            
            cols.forEach((col, index) => {
                let text = col.textContent.trim();
                
                // Handle severity indicator
                if (index === 0) {
                    const indicator = col.querySelector('.severity-indicator');
                    if (indicator && indicator.classList.contains('severity-low')) text = 'Alacsony';
                    else if (indicator && indicator.classList.contains('severity-medium')) text = 'Közepes';
                    else if (indicator && indicator.classList.contains('severity-high')) text = 'Magas';
                    else if (indicator && indicator.classList.contains('severity-extreme')) text = 'Rendkívüli';
                }
                
                // Escape commas and quotes
                if (text.includes(',') || text.includes('"') || text.includes('\n')) {
                    text = '"' + text.replace(/"/g, '""') + '"';
                }
                rowData.push(text);
            });
            csv += rowData.join(',') + '\n';
        }
    });
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8-sig;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'FiveM_ILE_BTK_Reszletes.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Load saved theme from sessionStorage
    const savedTheme = sessionStorage.getItem('theme');
    if (savedTheme && savedTheme === 'dark') {
        toggleTheme();
    }
    
    // Set first filter button as active
    const firstFilterBtn = document.querySelector('.filter-btn');
    if (firstFilterBtn) {
        firstFilterBtn.classList.add('active');
    }
    
    // Initial stats calculation
    updateStats();
});

// Additional utility functions
function copyTableToClipboard() {
    const table = document.getElementById('btkTable');
    const range = document.createRange();
    range.selectNode(table);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    
    try {
        document.execCommand('copy');
        alert('Táblázat másolva a vágólapra!');
    } catch (err) {
        console.error('Másolás sikertelen:', err);
        alert('Másolás sikertelen. Próbálja újra!');
    }
    
    window.getSelection().removeAllRanges();
}

function printTable() {
    const printWindow = window.open('', '_blank');
    const tableHTML = document.documentElement.outerHTML;
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>FiveM BTK - Nyomtatás</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #34495e; color: white; }
                .category { background-color: #3498db; color: white; font-weight: bold; text-align: center; }
                .corruption { background-color: #e74c3c; color: white; }
            </style>
        </head>
        <body>
            ${document.querySelector('table').outerHTML}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl+F for search focus
    if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        document.querySelector('.search-box').focus();
    }
    
    // Ctrl+E for export
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        exportToCSV();
    }
    
    // Ctrl+T for theme toggle
    if (e.ctrlKey && e.key === 't') {
        e.preventDefault();
        toggleTheme();
    }
});