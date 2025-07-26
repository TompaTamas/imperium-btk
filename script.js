let currentFilter = 'all';

function filterByCategory(category) {
    currentFilter = category;
    const cards = document.querySelectorAll('.card');
    const categoryHeaders = document.querySelectorAll('.category-header');
    const buttons = document.querySelectorAll('.filter-btn');

    buttons.forEach(btn => btn.classList.remove('active'));
    buttons.forEach(btn => {
        if (btn.textContent.includes('Összes') && category === 'all') btn.classList.add('active');
        if (btn.textContent.includes('Kisebb') && category === 'low') btn.classList.add('active');
        if (btn.textContent.includes('Közepes') && category === 'medium') btn.classList.add('active');
        if (btn.textContent.includes('Súlyos') && category === 'serious') btn.classList.add('active');
        if (btn.textContent.includes('Korrupció') && category === 'corruption') btn.classList.add('active');
    });

    cards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (category === 'all' || cardCategory === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });

    categoryHeaders.forEach(header => {
        if (category === 'all') {
            header.style.display = 'block';
        } else {
            const nextCards = header.nextElementSibling;
            let shouldShow = false;
            while (nextCards && nextCards.classList.contains('card')) {
                if (nextCards.getAttribute('data-category') === category) {
                    shouldShow = true;
                    break;
                }
                nextCards = nextCards.nextElementSibling;
            }
            header.style.display = shouldShow ? 'block' : 'none';
        }
    });

    updateStats();
}

function searchCards() {
    const input = document.querySelector('.search-box');
    const filter = input.value.toLowerCase();
    const cards = document.querySelectorAll('.card');
    const categoryHeaders = document.querySelectorAll('.category-header');

    cards.forEach(card => {
        const code = card.querySelector('.code').textContent.toLowerCase();
        const name = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('.card-body p:last-child').textContent.toLowerCase();

        if (code.includes(filter) || name.includes(filter) || description.includes(filter)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });

    categoryHeaders.forEach(header => {
        let hasVisibleCards = false;
        let nextSibling = header.nextElementSibling;
        while (nextSibling && nextSibling.classList.contains('card')) {
            if (nextSibling.style.display !== 'none') {
                hasVisibleCards = true;
                break;
            }
            nextSibling = nextSibling.nextElementSibling;
        }
        header.style.display = hasVisibleCards ? 'block' : 'none';
    });

    updateStats();
}

function updateStats() {
    const visibleCards = document.querySelectorAll('.card:not([style*="display: none"])');

    let totalCrimes = 0;
    let totalFines = 0;
    let totalPrison = 0;
    let statePrisonCount = 0;

    visibleCards.forEach(card => {
        totalCrimes++;
        const fine = parseInt(card.querySelector('.fine').textContent.replace(/[\$,]/g, '')) || 0;
        const prison = parseInt(card.querySelector('.prison').textContent.replace(/ perc/g, '')) || 0;

        totalFines += fine;
        totalPrison += prison;

        if (prison > 60) {
            statePrisonCount++;
        }
    });

    document.getElementById('totalCrimes').textContent = totalCrimes;
    document.getElementById('avgFine').textContent = totalCrimes > 0 ? '$' + Math.round(totalFines / totalCrimes).toLocaleString() : '$0';
    document.getElementById('avgPrison').textContent = totalCrimes > 0 ? Math.round(totalPrison / totalCrimes) + ' perc' : '0 perc';
    document.getElementById('statePrisonCount').textContent = statePrisonCount;
}

function toggleNotes(id) {
    const content = document.getElementById(id);
    content.classList.toggle('hidden');
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
