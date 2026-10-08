import { useEffect } from 'react';

/**
 * Observa todos los elementos con la clase `.reveal` dentro del documento
 * y les agrega `.reveal-visible` cuando entran en viewport.
 * Se puede llamar una sola vez (por ejemplo en App.jsx) o en cada página.
 */
export function useScrollReveal() {
    useEffect(() => {
        // Si el usuario prefiere menos movimiento, mostramos todo directo
        const prefiereReducido = window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        ).matches;

        if (prefiereReducido) {
            document
                .querySelectorAll('.reveal')
                .forEach(el => el.classList.add('reveal-visible'));
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('reveal-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.15,
                rootMargin: '0px 0px -50px 0px',
            }
        );

        // Observamos lo que ya existe
        const elementos = document.querySelectorAll('.reveal:not(.reveal-visible)');
        elementos.forEach((el) => observer.observe(el));

        // Por si el contenido se carga después (fetch async)
        const mutation = new MutationObserver(() => {
            document
                .querySelectorAll('.reveal:not(.reveal-visible)')
                .forEach((el) => observer.observe(el));
        });
        mutation.observe(document.body, { childList: true, subtree: true });

        return () => {
            observer.disconnect();
            mutation.disconnect();
        };
    }, []);
}