// Servidor SMTP mínimo para los E2E: acepta la conversación y descarta el
// mensaje. Permite correr el backend con APP_ENV=development (cookies no
// Secure sobre http://127.0.0.1) y que el registro de usuarios complete el
// envío del correo de verificación sin necesitar un relay real.
const net = require('node:net');

const HOST = process.env.SMTP_HOST || '127.0.0.1';
const PORT = Number(process.env.SMTP_PORT || 1025);

const server = net.createServer((socket) => {
    socket.setEncoding('utf8');
    socket.write('220 alquiler-e2e ESMTP\r\n');

    let buffer = '';
    let enDatos = false;

    socket.on('data', (chunk) => {
        buffer += chunk;

        let corte;
        while ((corte = buffer.indexOf('\r\n')) !== -1) {
            const linea = buffer.slice(0, corte);
            buffer = buffer.slice(corte + 2);

            if (enDatos) {
                if (linea === '.') {
                    enDatos = false;
                    socket.write('250 2.0.0 Mensaje aceptado\r\n');
                }
                continue;
            }

            const comando = linea.toUpperCase();

            if (comando.startsWith('EHLO')) {
                socket.write('250-alquiler-e2e\r\n250 OK\r\n');
            } else if (comando.startsWith('HELO')) {
                socket.write('250 alquiler-e2e\r\n');
            } else if (comando.startsWith('MAIL FROM')) {
                socket.write('250 2.1.0 OK\r\n');
            } else if (comando.startsWith('RCPT TO')) {
                socket.write('250 2.1.5 OK\r\n');
            } else if (comando.startsWith('DATA')) {
                enDatos = true;
                socket.write('354 Finaliza con <CRLF>.<CRLF>\r\n');
            } else if (comando.startsWith('RSET')) {
                socket.write('250 2.0.0 OK\r\n');
            } else if (comando.startsWith('NOOP')) {
                socket.write('250 2.0.0 OK\r\n');
            } else if (comando.startsWith('QUIT')) {
                socket.write('221 2.0.0 Bye\r\n');
                socket.end();
            } else {
                socket.write('250 2.0.0 OK\r\n');
            }
        }
    });

    socket.on('error', () => socket.destroy());
});

server.listen(PORT, HOST, () => {
    console.log(`SMTP E2E escuchando en ${HOST}:${PORT}`);
});
