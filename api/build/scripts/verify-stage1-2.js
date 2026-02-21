/**
 * Verify Stage 1 + Stage 2. Run: npx tsx scripts/verify-stage1-2.ts
 * Requires: Postgres up, API running (npx tsx bin/server.ts)
 */
const API = 'http://127.0.0.1:3333';
let failed = 0;
async function check(name, fn) {
    try {
        const ok = await fn();
        console.log(ok ? `✅ ${name}` : `❌ ${name}`);
        if (!ok)
            failed++;
    }
    catch (e) {
        console.log(`❌ ${name}`, e.message);
        failed++;
    }
}
async function main() {
    console.log('--- Stage 1: API ---');
    await check('Health', async () => {
        const r = await fetch(`${API}/api/health`);
        const j = await r.json();
        return r.ok && j.ok === true;
    });
    await check('GET /api/menu (items + menuVersion)', async () => {
        const r = await fetch(`${API}/api/menu`);
        const j = await r.json();
        return r.ok && Array.isArray(j.items) && typeof j.menuVersion === 'number';
    });
    let ticketId;
    await check('POST /api/tickets (create)', async () => {
        const r = await fetch(`${API}/api/tickets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ menuItemId: 6, batchSize: '1', source: 'foh' }),
        });
        const j = await r.json();
        ticketId = j.id;
        return r.status === 201 && j.state === 'created' && j.station;
    });
    await check('POST /api/tickets/:id/start', async () => {
        const r = await fetch(`${API}/api/tickets/${ticketId}/start`, { method: 'POST' });
        const j = await r.json();
        return r.ok && j.state === 'started' && j.startedAt;
    });
    await check('POST /api/tickets/:id/complete', async () => {
        const r = await fetch(`${API}/api/tickets/${ticketId}/complete`, { method: 'POST' });
        const j = await r.json();
        return r.ok && j.state === 'completed';
    });
    await check('GET /api/tickets?station=stirfry (ordering)', async () => {
        const r = await fetch(`${API}/api/tickets?station=stirfry`);
        const j = await r.json();
        if (!Array.isArray(j) || j.length < 2)
            return true;
        const seqs = j.map((t) => t.stationSeq);
        return seqs[0] >= seqs[1];
    });
    await check('PATCH /api/menu (version bump)', async () => {
        const r1 = await fetch(`${API}/api/menu`);
        const j1 = await r1.json();
        const v1 = j1.menuVersion;
        const r2 = await fetch(`${API}/api/menu/${j1.items[0].id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: j1.items[0].title }),
        });
        await r2.json();
        const r3 = await fetch(`${API}/api/menu`);
        const j3 = await r3.json();
        return j3.menuVersion === v1 + 1;
    });
    console.log('\n--- Stage 2: Socket.IO ---');
    const { io } = await import('socket.io-client');
    await check('Socket connect + join + snapshot', async () => {
        return new Promise((resolve) => {
            const s = io(API, { autoConnect: true });
            s.on('connect', () => s.emit('join', ['stirfry']));
            s.on('snapshot', (d) => {
                const ok = d && Array.isArray(d.tickets) && typeof d.menuVersion === 'number' && typeof d.serverNowMs === 'number';
                s.disconnect();
                resolve(ok);
            });
            s.on('connect_error', () => {
                s.disconnect();
                resolve(false);
            });
            setTimeout(() => {
                s.disconnect();
                resolve(false);
            }, 5000);
        });
    });
    await check('ticket_created broadcast', async () => {
        return new Promise((resolve) => {
            const s = io(API);
            s.on('connect', () => s.emit('join', ['fryer']));
            s.on('ticket_created', (d) => {
                const ok = d && d.station === 'fryer';
                s.disconnect();
                resolve(ok);
            });
            setTimeout(async () => {
                await fetch(`${API}/api/tickets`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ menuItemId: 1, batchSize: '1', source: 'foh' }),
                });
            }, 500);
            setTimeout(() => {
                s.disconnect();
                resolve(false);
            }, 5000);
        });
    });
    await check('timer_started + ticket_completed broadcast', async () => {
        return new Promise(async (resolve) => {
            const s = io(API);
            let gotStart = false;
            let gotComplete = false;
            s.on('connect', () => s.emit('join', ['sides']));
            s.on('timer_started', () => { gotStart = true; });
            s.on('ticket_completed', () => { gotComplete = true; });
            await new Promise((r) => setTimeout(r, 300));
            const cr = await fetch(`${API}/api/tickets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ menuItemId: 14, batchSize: '1', source: 'foh' }),
            });
            const ticket = await cr.json();
            await new Promise((r) => setTimeout(r, 300));
            await fetch(`${API}/api/tickets/${ticket.id}/start`, { method: 'POST' });
            await new Promise((r) => setTimeout(r, 300));
            await fetch(`${API}/api/tickets/${ticket.id}/complete`, { method: 'POST' });
            await new Promise((r) => setTimeout(r, 500));
            s.disconnect();
            resolve(gotStart && gotComplete);
        });
    });
    await check('menu_updated broadcast', async () => {
        return new Promise(async (resolve) => {
            const s = io(API);
            s.on('menu_updated', (d) => {
                const ok = d && typeof d.version === 'number';
                s.disconnect();
                resolve(ok);
            });
            await new Promise((r) => setTimeout(r, 300));
            const r = await fetch(`${API}/api/menu`);
            const j = await r.json();
            await fetch(`${API}/api/menu/${j.items[0].id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: j.items[0].title }),
            });
            setTimeout(() => {
                s.disconnect();
                resolve(false);
            }, 3000);
        });
    });
    console.log('\n' + (failed === 0 ? 'All checks passed.' : `${failed} check(s) failed.`));
    process.exit(failed);
}
main();
export {};
