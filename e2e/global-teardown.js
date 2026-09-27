import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

// La suite corre contra la BD de la app, no una de test: los DELETE de cada
// spec son soft delete y las filas se acumulan. Este teardown las elimina al
// terminar para que la proxima corrida arranque desde el seed y no haya
// properties sueltas que rompan los conteos que los specs assertan.
//
// Nunca debe hacer fallar la corrida: si MySQL no esta disponible se avisa
// y se sale con 0.

const MYSQL_BIN = process.env.MYSQL_BIN || 'C:/xampp/mysql/bin/mysql.exe';
const DB = process.env.E2E_DB_NAME || 'sistema_alquiler_db';
const USER = process.env.MYSQL_USER || 'root';
const PASSWORD = process.env.MYSQL_PASSWORD || '';

// Solo estos prefijos los genera la suite. Importante: la propiedad seed 12
// ("Monoambiente centrico Parana") pertenece a e2e.admin, asi que nunca hay
// que borrar por usuario_id.
const TITULOS_E2E = ["Depto E2E%", "Propiedad E2E%", "E2E %"];

const ESQUEMA = 'USE `' + DB + '`';

function correr(mysql) {
    return execFileSync(
        MYSQL_BIN,
        ['-u', USER, ...(PASSWORD ? ['-p' + PASSWORD] : []), '-B', '-N', '-e', mysql],
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
    ).trim();
}

export default async function globalTeardown() {
    if (!existsSync(MYSQL_BIN)) {
        console.log(`\n[teardown] MySQL no encontrado en ${MYSQL_BIN}, se omite la limpieza.`);
        return;
    }

    const titulos = TITULOS_E2E.map(t => `titulo LIKE '${t}'`).join(' OR ');

    // Propiedades a eliminar: las soft-delete de corridas anteriores mas las
    // que quedaron activas porque un test fallo antes de su propio DELETE.
    const props = `(SELECT id FROM propiedades WHERE deleted_at IS NOT NULL OR ${titulos})`;

    const pasos = [
        ['mensajes de consultas', `DELETE FROM mensajes_consultas WHERE consulta_id IN (SELECT id FROM consultas WHERE propiedad_id IN ${props})`],
        ['consultas', `DELETE FROM consultas WHERE propiedad_id IN ${props}`],
        ['favoritos', `DELETE FROM favoritos WHERE propiedad_id IN ${props}`],
        ['reservas', `DELETE FROM reservas WHERE propiedad_id IN ${props}`],
        ['imagenes', `DELETE FROM propiedad_imagenes WHERE propiedad_id IN ${props}`],
        ['servicios', `DELETE FROM propiedad_servicio WHERE propiedad_id IN ${props}`],
        ['propiedades', `DELETE FROM propiedades WHERE id IN ${props}`],
        // Cuentas que crea el test de registro en cada corrida.
        ['logs de usuarios e2e.reg', `DELETE FROM logs_actividad WHERE usuario_id IN (SELECT id FROM usuarios WHERE email LIKE 'e2e.reg.%@test.com')`],
        ['mensajes', `DELETE FROM mensajes_consultas WHERE usuario_id IN (SELECT id FROM usuarios WHERE email LIKE 'e2e.reg.%@test.com')`],
        ['notificaciones', `DELETE FROM notificaciones WHERE usuario_id IN (SELECT id FROM usuarios WHERE email LIKE 'e2e.reg.%@test.com')`],
        ['refresh tokens', `DELETE FROM refresh_tokens WHERE usuario_id IN (SELECT id FROM usuarios WHERE email LIKE 'e2e.reg.%@test.com')`],
        ['usuarios e2e.reg', `DELETE FROM usuarios WHERE email LIKE 'e2e.reg.%@test.com'`]
    ];

    try {
        const resumen = [];
        for (const [nombre, sentencia] of pasos) {
            const cuenta = correr(`${ESQUEMA}; ${sentencia}; SELECT ROW_COUNT();`);
            const fila = Number(cuenta.split('\n').pop());
            if (fila > 0) resumen.push(`${nombre}: ${fila}`);
        }
        console.log(
            resumen.length
                ? `\n[teardown] ${DB} limpiada -> ${resumen.join(', ')}`
                : `\n[teardown] ${DB} ya estaba limpia.`
        );
    } catch (error) {
        console.log(`\n[teardown] No se pudo limpiar ${DB}: ${error.message.split('\n')[0]}`);
    }
}
