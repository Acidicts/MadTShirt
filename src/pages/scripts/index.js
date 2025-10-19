function initBoxNavigation(selector = '.box') {
    const boxes = document.querySelectorAll(selector);
    if (!boxes.length) return;

    boxes.forEach(box => {
        if (!box.id) return;

        if (!box.hasAttribute('tabindex')) box.setAttribute('tabindex', '0');
        box.style.cursor = 'pointer';

        const navigate = () => {
            const id = box.id.trim();
            if (!id) return;
            window.location.pathname = `/${id}`;
        };

        box.addEventListener('click', navigate);
        box.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate();
            }
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initBoxNavigation());
} else {
    initBoxNavigation();
}