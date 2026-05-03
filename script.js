document.addEventListener('DOMContentLoaded', function () {
    const toggleButton = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.site-nav');

    if (!toggleButton || !nav) {
        return;
    }

    toggleButton.addEventListener('click', function () {
        const expanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', String(!expanded));
        this.classList.toggle('active');
        nav.classList.toggle('open');
    });

    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function () {
            if (nav.classList.contains('open')) {
                nav.classList.remove('open');
                toggleButton.classList.remove('active');
                toggleButton.setAttribute('aria-expanded', 'false');
            }
        });
    });

    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('click', () => {
            const isExpanded = card.classList.contains('expanded');
            productCards.forEach(other => other.classList.remove('expanded'));
            if (!isExpanded) {
                card.classList.add('expanded');
            }
        });
    });

    const visionCard = document.querySelector('.vision-card');
    if (visionCard) {
        visionCard.addEventListener('click', () => {
            visionCard.classList.toggle('pop');
        });
        visionCard.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                visionCard.classList.toggle('pop');
            }
        });
    }
});