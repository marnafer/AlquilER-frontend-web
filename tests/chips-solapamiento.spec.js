import { test, expect } from '@playwright/test';

/**
 * Regresion: en el detalle de propiedad, el chip de categoria y el de estado
 * (Disponible / Alquilada) deben quedar uno al lado del otro dentro de
 * .detalle-chips, sin superponerse.
 *
 * El bug: .propiedad-categoria hereda position:absolute de la regla global de
 * la tarjeta, mientras .detalle-chips .propiedad-badge lo descargaba con
 * position:static. La categoria se salia del flex y caeria sobre el badge.
 */
const IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

for (const id of IDS) {
  test(`los chips no se superponen en /propiedades/${id}`, async ({ page }) => {
    const errores = [];
    page.on('pageerror', (e) => errores.push(String(e)));

    await page.goto(`/propiedades/${id}`, { waitUntil: 'networkidle' });

    // Si la propiedad no existe, la pagina cae en NotFound: no hay nada que medir.
    const chips = page.locator('.detalle-chips .propiedad-categoria');
    const total = await chips.count();
    if (total === 0) {
      test.skip(true, `la propiedad ${id} no existe o no tiene categoria`);
    }

    await page.waitForSelector('.detalle-chips .propiedad-categoria', { timeout: 15000 });

    const m = await page.evaluate(() => {
      const cat = document.querySelector('.detalle-chips .propiedad-categoria');
      const badge = document.querySelector('.detalle-chips .propiedad-badge');
      if (!cat || !badge) return null;
      const c = cat.getBoundingClientRect();
      const b = badge.getBoundingClientRect();
      return {
        cat: { x: c.x, right: c.right, y: c.y, bottom: c.bottom, w: c.width, pos: getComputedStyle(cat).position },
        badge: { x: b.x, right: b.right, y: b.y, bottom: b.bottom, w: b.width, pos: getComputedStyle(badge).position },
        img: (() => {
          const i = document.querySelector('.propiedad-detalle-imagen').getBoundingClientRect();
          return { w: i.width, h: i.height };
        })(),
      };
    });

    expect(m, 'no se pudieron medir los chips').not.toBeNull();

    // 1. Ninguno debe seguir siendo absolute: si lo es, se sale del flex.
    expect(m.cat.pos, 'la categoria debe ser static dentro de .detalle-chips').toBe('static');
    expect(m.badge.pos, 'el badge debe ser static dentro de .detalle-chips').toBe('static');

    // 2. No deben cruzarse en ningun eje.
    const solapaX = m.cat.x < m.badge.right && m.badge.x < m.cat.right;
    const solapaY = m.cat.y < m.badge.bottom && m.badge.y < m.cat.bottom;
    expect(solapaX && solapaY, `choque: cat ${m.cat.x}..${m.cat.right} / badge ${m.badge.x}..${m.badge.right}`).toBe(false);

    // 3. Deben compartir la misma linea vertical (mismo top, mismo bottom).
    expect(Math.abs(m.cat.y - m.badge.y), 'los chips deben alinearse en la misma fila').toBeLessThanOrEqual(1);
    expect(Math.abs(m.cat.bottom - m.badge.bottom), 'los chips deben tener la misma altura de fila').toBeLessThanOrEqual(1);

    // 4. Los dos deben caber dentro de la imagen.
    expect(m.cat.right).toBeLessThanOrEqual(m.img.w + m.cat.x);
    expect(errores).toEqual([]);
  });
}

test('el chip de estado aparece en todas las tarjetas del listado', async ({ page }) => {
  await page.goto('/propiedades', { waitUntil: 'networkidle' });
  await page.waitForSelector('.propiedad-card');

  const r = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.propiedad-card')];
    return {
      total: cards.length,
      sinBadge: cards.filter((c) => !c.querySelector('.propiedad-badge')).length,
      catYbadgeY: cards
        .map((c) => {
          const cat = c.querySelector('.propiedad-categoria');
          const badge = c.querySelector('.propiedad-badge');
          if (!cat || !badge) return null;
          return { catY: Math.round(cat.getBoundingClientRect().y), badgeY: Math.round(badge.getBoundingClientRect().y) };
        })
        .filter(Boolean),
    };
  });

  console.log(`\n  tarjetas: ${r.total}, sin badge: ${r.sinBadge}`);
  expect(r.total).toBeGreaterThan(0);
  expect(r.sinBadge).toBe(0);

  // En el listado el badge va abajo a la derecha y la categoria arriba a la
  // izquierda: nunca en la misma fila.
  const mismaFila = r.catYbadgeY.filter((x) => Math.abs(x.catY - x.badgeY) <= 1).length;
  console.log(`  tarjetas con categoria y badge en la misma fila: ${mismaFila}`);
  expect(mismaFila).toBe(0);
});