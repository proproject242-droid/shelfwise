/* Shelfwise – Smart Library. Plain HTML/CSS/JS, no build step.
   Data is stored in the browser (localStorage). Logins are a demo: see README. */
const D = 864e5, KEY = 'shelfwise2', MAXLOAN = 3, $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const GC = { Fiction: '#2f6f6b', Science: '#3b5ba9', History: '#8a5a2b', Technology: '#5b3e96', Fantasy: '#8e2c48', Wellbeing: '#a9661c' };
const GENRES = Object.keys(GC);

function seed() {
  const n = Date.now(), P = 'student123';
  return {
    books: [[1, 'Sapiens', 'Yuval Noah Harari', 'History', 2], [2, 'The Alchemist', 'Paulo Coelho', 'Fiction', 2], [3, 'A Brief History of Time', 'Stephen Hawking', 'Science', 1], [4, 'Clean Code', 'Robert C. Martin', 'Technology', 2], [5, 'The Hobbit', 'J.R.R. Tolkien', 'Fantasy', 2], [6, 'Wings of Fire', 'A.P.J. Abdul Kalam', 'History', 3], [7, 'Dune', 'Frank Herbert', 'Fantasy', 1], [8, 'Atomic Habits', 'James Clear', 'Wellbeing', 3], [9, 'Cosmos', 'Carl Sagan', 'Science', 2], [10, 'Ponniyin Selvan', 'Kalki Krishnamurthy', 'Fiction', 2], [11, 'Introduction to Algorithms', 'T. H. Cormen', 'Technology', 1], [12, 'India After Gandhi', 'Ramachandra Guha', 'History', 1], [13, 'The Selfish Gene', 'Richard Dawkins', 'Science', 2], [14, 'Deep Work', 'Cal Newport', 'Wellbeing', 2], [15, 'Gitanjali', 'Rabindranath Tagore', 'Fiction', 1]].map(([id, t, a, g, c]) => ({ id, t, a, g, c })),
    users: [
      { id: 'admin', n: 'Head Librarian', role: 'admin', pw: 'admin123' },
      { id: 'staff', n: 'Library Staff', role: 'staff', pw: 'staff123' },
      { id: 'S-101', n: 'Priya S.', role: 'student', pw: P }, { id: 'S-102', n: 'Arjun K.', role: 'student', pw: P },
      { id: 'S-103', n: 'Meera R.', role: 'student', pw: P }, { id: 'S-104', n: 'Karthik V.', role: 'student', pw: P }],
    loans: [
      { b: 1, m: 'S-101', out: n - 20 * D, due: n - 6 * D, ret: null }, { b: 9, m: 'S-101', out: n - 9 * D, due: n + 5 * D, ret: null },
      { b: 4, m: 'S-102', out: n - 5 * D, due: n + 9 * D, ret: null }, { b: 7, m: 'S-103', out: n - 12 * D, due: n + 2 * D, ret: null },
      { b: 8, m: 'S-104', out: n - 3 * D, due: n + 11 * D, ret: null }, { b: 5, m: 'S-102', out: n - 40 * D, due: n - 26 * D, ret: n - 27 * D }],
    log: []
  };
}
let S; try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) { }
if (!S || !S.users) S = seed();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } };

/* ---------- helpers ---------- */
const bk = id => S.books.find(b => b.id == id), U = id => S.users.find(u => u.id === id) || { n: 'Unknown member' };
const act = () => S.loans.filter(l => !l.ret), avail = b => b.c - act().filter(l => l.b === b.id).length;
const late = l => Math.max(0, Math.ceil(((l.ret || Date.now()) - l.due) / D)), fine = l => late(l) * 5;
const fmt = t => new Date(t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
const mine = id => act().filter(l => l.m === id), owed = id => mine(id).reduce((s, l) => s + fine(l), 0);
const students = () => S.users.filter(u => u.role === 'student');
const note = m => { S.log.unshift({ t: Date.now(), m }); S.log = S.log.slice(0, 30); };
const ago = t => { const s = (Date.now() - t) / 1000; return s < 60 ? 'just now' : s < 3600 ? Math.floor(s / 60) + ' min ago' : s < 86400 ? Math.floor(s / 3600) + ' h ago' : fmt(t); };
const empty = t => `<div class="empty">${t}</div>`;
const cs = b => `style="--c:${GC[b.g] || '#2f6f6b'}${b.img ? `;background-image:linear-gradient(#0000 35%,#000c),url('${esc(b.img)}');background-size:cover;background-position:center` : ''}"`;
function status(l) { const d = late(l); if (d) return `<span class="badge bad">${d} day${d > 1 ? 's' : ''} late</span>`; const left = Math.ceil((l.due - Date.now()) / D); return `<span class="badge ${left <= 2 ? 'mid' : ''}">Due in ${left} day${left !== 1 ? 's' : ''}</span>`; }
function toast(t, ms = 2400) { const e = $('#toast'); e.textContent = t; e.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.remove('show'), ms); }
const dlg = html => { const d = $('#dlg'); d.innerHTML = html; d.showModal(); };

/* ---------- session ---------- */
let me = null, view = 'dash', q = '', gen = 'All', lm = 'student';
try { const u = U(sessionStorage.getItem('sw_me')); if (u.role) me = u; } catch (e) { }
const staff = () => me && me.role !== 'student';
function signIn(u) { me = u; try { sessionStorage.setItem('sw_me', u.id); } catch (e) { } view = 'dash'; render(); }

/* ---------- login ---------- */
function loginView() {
  $('#shell').hidden = true; const L = $('#login'); L.hidden = false;
  const sp = [90, 130, 105, 150, 115, 140, 100].map((h, i) => `<i style="--h:${h}px;--c:${Object.values(GC)[i % 6]}"></i>`).join('');
  L.innerHTML = `<div class="lwrap"><div class="lhero"><h1>Shelfwise</h1><p>Find it, borrow it, return it. One smart library for students and staff.</p><div class="lspines">${sp}</div></div>
  <form class="lcard" id="lf" autocomplete="off"><h2>${lm === 'reg' ? 'Create a student account' : 'Sign in'}</h2>
  ${lm === 'reg' ? '' : `<div class="seg"><button type="button" class="chip ${lm === 'student' ? 'on' : ''}" data-lm="student">Student</button><button type="button" class="chip ${lm === 'staff' ? 'on' : ''}" data-lm="staff">Staff &amp; admin</button></div>`}
  ${lm === 'reg' ? '<label for="ln">Full name</label><input id="ln" required>' : `<label for="lid">${lm === 'student' ? 'Student ID' : 'Username'}</label><input id="lid" required placeholder="${lm === 'student' ? 'S-101' : 'staff'}">`}
  <label for="lpw">Password</label><input id="lpw" type="password" required><div class="note" id="lerr"></div>
  <button class="btn acc" style="width:100%;margin-top:16px">${lm === 'reg' ? 'Create account' : 'Sign in'}</button>
  ${lm === 'student' ? '<p class="alt">New here? <button type="button" class="lnk" data-lm="reg">Create a student account</button></p>' : lm === 'reg' ? '<p class="alt"><button type="button" class="lnk" data-lm="student">Back to sign in</button></p>' : ''}
  <p class="demo">Demo logins<br>Student: S-101 / student123<br>Staff: staff / staff123<br>Admin: admin / admin123</p></form></div>`;
}

/* ---------- views ---------- */
const shelf = () => `<section class="shelf"><h2>The shelf</h2><p>Faded spines are out on loan. Tap one for details.</p><div class="row">${S.books.map(b => `<button class="spine ${avail(b) ? '' : 'out'}" style="--h:${150 + (b.id * 37 % 55)}px;--c:${GC[b.g] || '#2f6f6b'}" data-open="${b.id}" aria-label="${esc(b.t)}">${esc(b.t)}</button>`).join('')}</div></section>`;

function loanRow(l, showWho) {
  const i = S.loans.indexOf(l);
  return `<div class="li"><div>${esc(bk(l.b).t)}<small>${showWho ? esc(U(l.m).n) + ' · ' : ''}out ${fmt(l.out)} · due ${fmt(l.due)}</small></div><div class="r">${status(l)}${fine(l) ? `<b>₹${fine(l)}</b>` : ''}${staff() ? `<button class="btn" data-ret="${i}">Mark returned</button>` : (!l.renewed && !late(l) ? `<button class="btn ghost" data-renew="${i}">Renew</button>` : '')}</div></div>`;
}

function dash() { return staff() ? dashStaff() : dashStudent(); }
function dashStaff() {
  const o = act(), over = o.filter(l => late(l)), f = o.reduce((s, l) => s + fine(l), 0);
  return `<div class="top"><div><h1>Library overview</h1><p>Updates appear here live as books are lent and returned.</p></div><button class="btn acc" data-go="cat">Lend a book</button></div>
  <div class="stats"><div class="stat"><b>${S.books.length}</b><span>Titles</span></div><div class="stat"><b>${o.length}</b><span>Books on loan</span></div><div class="stat ${over.length ? 'warn' : ''}"><b>${over.length}</b><span>Overdue</span></div><div class="stat ${f ? 'warn' : ''}"><b>₹${f}</b><span>Fines pending</span></div></div>
  ${shelf()}<div class="cols"><div class="card"><h2>Due soonest</h2>${[...o].sort((a, b) => a.due - b.due).slice(0, 5).map(l => `<div class="li"><div>${esc(bk(l.b).t)}<small>${esc(U(l.m).n)} · due ${fmt(l.due)}</small></div>${status(l)}</div>`).join('') || empty('No books are out right now.')}</div>
  <div class="card"><h2>Live activity</h2>${S.log.slice(0, 6).map(x => `<div class="li"><div>${esc(x.m)}</div><small>${ago(x.t)}</small></div>`).join('') || empty('Activity shows up here as books are lent and returned.')}</div></div>`;
}
function rec() {
  const read = new Set(S.loans.filter(l => l.m === me.id).map(l => (bk(l.b) || {}).g)), held = new Set(mine(me.id).map(l => l.b));
  let r = S.books.filter(b => read.has(b.g) && avail(b) && !held.has(b.id));
  if (r.length < 3) r = r.concat(S.books.filter(b => avail(b) && !held.has(b.id) && !r.includes(b)));
  return r.slice(0, 3);
}
function dashStudent() {
  const m = mine(me.id), f = owed(me.id), over = m.filter(l => late(l)).length;
  return `<div class="top"><div><h1>Hello, ${esc(me.n.split(' ')[0])}</h1><p>You can borrow up to ${MAXLOAN} books at a time.</p></div><button class="btn acc" data-go="cat">Browse books</button></div>
  <div class="stats"><div class="stat"><b>${m.length}/${MAXLOAN}</b><span>Books borrowed</span></div><div class="stat ${over ? 'warn' : ''}"><b>${over}</b><span>Overdue</span></div><div class="stat ${f ? 'warn' : ''}"><b>₹${f}</b><span>Fines pending</span></div><div class="stat"><b>${S.books.filter(b => avail(b)).length}</b><span>Titles available</span></div></div>
  ${shelf()}<div class="cols"><div class="card"><h2>My books</h2>${m.map(l => loanRow(l, false)).join('') || empty('You have no books yet. Browse the catalogue to borrow one.')}</div>
  <div class="card"><h2>Suggested for you</h2>${rec().map(b => `<div class="li"><div>${esc(b.t)}<small>${esc(b.a)}</small></div><button class="btn ghost" data-open="${b.id}">View</button></div>`).join('') || empty('Nothing to suggest yet.')}</div></div>`;
}

function cat() {
  return `<div class="top"><div><h1>Catalogue</h1><p>${S.books.length} titles in the library.</p></div>${staff() ? '<button class="btn acc" id="addb">Add a book</button>' : ''}</div>
  <div class="tools"><input id="q" type="search" placeholder="Search by title or author" value="${esc(q)}" aria-label="Search books"></div>
  <div class="chips">${['All', ...GENRES].map(g => `<button class="chip ${g === gen ? 'on' : ''}" data-gen="${g}">${g}</button>`).join('')}</div><div class="grid" id="grid"></div>`;
}
function drawGrid() {
  const L = S.books.filter(b => (gen === 'All' || b.g === gen) && (b.t + ' ' + b.a).toLowerCase().includes(q.toLowerCase()));
  $('#grid').innerHTML = L.map(b => { const a = avail(b); return `<article class="book"><div class="cover" ${cs(b)}><span>${b.g}</span><h3>${esc(b.t)}</h3></div><div class="bb"><small>${esc(b.a)}</small><span class="badge ${a ? '' : 'bad'}">${a ? `${a} of ${b.c} available` : 'All copies out'}</span><div class="acts2"><button class="btn" data-borrow="${b.id}" ${a ? '' : 'disabled'}>${staff() ? 'Lend' : 'Borrow'}</button>${staff() ? `<button class="btn ghost" data-del="${b.id}">Remove</button>` : ''}</div></div></article>`; }).join('') || '<div class="empty" style="grid-column:1/-1">No books match. Try a different title, author or genre.</div>';
}

function loansV() {
  const o = act().filter(l => staff() || l.m === me.id).sort((a, b) => a.due - b.due);
  const h = S.loans.filter(l => l.ret && (staff() || l.m === me.id)).sort((a, b) => b.ret - a.ret).slice(0, 6);
  return `<div class="top"><div><h1>${staff() ? 'Loans' : 'My loans'}</h1><p>Fines are ₹5 per day late.${staff() ? '' : ' You can renew a book once for 7 more days.'}</p></div></div>
  <div class="card" style="margin-bottom:18px"><h2>On loan (${o.length})</h2>${o.map(l => loanRow(l, staff())).join('') || empty('No books on loan.')}</div>
  <div class="card"><h2>Recently returned</h2>${h.map(l => `<div class="li"><div>${esc(bk(l.b).t)}<small>${staff() ? esc(U(l.m).n) + ' · ' : ''}returned ${fmt(l.ret)}</small></div>${fine(l) ? `<span class="badge bad">Fine ₹${fine(l)}</span>` : '<span class="badge">On time</span>'}</div>`).join('') || empty('Returned books will appear here.')}</div>`;
}

function people() {
  const lab = { admin: 'Admin', staff: 'Staff', student: 'Student' };
  return `<div class="top"><div><h1>People</h1><p>Members with an overdue book can’t borrow until they return it.</p></div><button class="btn acc" id="addm">Add ${me.role === 'admin' ? 'a person' : 'a student'}</button></div>
  <div class="mem">${S.users.map(u => { const l = mine(u.id).length, f = owed(u.id); return `<div class="card"><div class="av">${esc(u.n[0])}</div><h3>${esc(u.n)}</h3><small style="color:var(--mute)">${esc(u.id)}</small><div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap"><span class="badge mid">${lab[u.role]}</span>${u.role === 'student' ? `<span class="badge">${l} on loan</span>` : ''}${f ? `<span class="badge bad">₹${f} fine</span>` : ''}</div></div>`; }).join('')}</div>`;
}

/* ---------- discover (live data from Open Library) ---------- */
let disc = { q: '', g: 'Fiction', res: null, busy: false, err: '' };
function discV() {
  return `<div class="top"><div><h1>Discover books</h1><p>Search millions of real titles from Open Library${staff() ? ' and add them to your catalogue' : ''}.</p></div></div>
  <div class="tools"><input id="dq" type="search" placeholder="Search any title, author or topic" value="${esc(disc.q)}" aria-label="Search Open Library"><button class="btn" id="dgo">Search</button></div>
  <div class="chips">${GENRES.map(g => `<button class="chip ${!disc.q && g === disc.g ? 'on' : ''}" data-dg="${g}">${g}</button>`).join('')}</div>
  ${staff() ? `<div class="tools"><label for="dgen" style="align-self:center;color:var(--mute)">Add as genre</label><select id="dgen" style="width:auto">${GENRES.map(g => `<option ${g === disc.g ? 'selected' : ''}>${g}</option>`).join('')}</select></div>` : ''}
  <div class="grid" id="dres"></div>`;
}
function drawDisc() {
  const el = $('#dres'); if (!el) return; const full = 'style="grid-column:1/-1"';
  if (disc.busy) { el.innerHTML = `<div class="empty" ${full}>Searching Open Library…</div>`; return; }
  if (disc.err) { el.innerHTML = `<div class="empty" ${full}>${disc.err}</div>`; return; }
  if (!disc.res) { el.innerHTML = `<div class="empty" ${full}>Pick a genre or type a search to see real books.</div>`; return; }
  el.innerHTML = disc.res.map((d, i) => `<article class="book"><div class="cover" ${cs({ g: disc.g, img: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : '' })}><span>${d.first_publish_year || ''}</span><h3>${esc(d.title)}</h3></div><div class="bb"><small>${esc((d.author_name || ['Unknown author'])[0])}</small>${staff() ? `<button class="btn" data-ol="${i}">Add to library</button>` : `<a class="btn ghost" href="https://openlibrary.org${esc(d.key)}" target="_blank" rel="noopener">Read about it</a>`}</div></article>`).join('') || `<div class="empty" ${full}>No results. Try a different search.</div>`;
}
async function search(query) {
  disc.busy = true; disc.err = ''; drawDisc();
  try {
    const r = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=12&sort=rating&fields=key,title,author_name,first_publish_year,cover_i`);
    if (!r.ok) throw new Error('bad status'); disc.res = (await r.json()).docs;
  } catch (e) { disc.err = 'Couldn’t reach Open Library. Check your internet connection and search again.'; disc.res = null; }
  disc.busy = false; if (view === 'disc') drawDisc();
}
function addOL(i) {
  const d = disc.res[i], a = (d.author_name || ['Unknown author'])[0];
  if (S.books.some(b => b.t.toLowerCase() === d.title.toLowerCase() && b.a === a)) { toast('That book is already in the catalogue'); return; }
  S.books.push({ id: Math.max(0, ...S.books.map(b => b.id)) + 1, t: d.title, a, g: $('#dgen').value, c: 2, y: d.first_publish_year, img: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : '' });
  note(`${me.n} added “${d.title}” to the catalogue`); save(); toast('Added with 2 copies');
}

/* ---------- lending ---------- */
function borrowForm(id) {
  const b = bk(id), a = avail(b);
  dlg(`<h2>${esc(b.t)}</h2><p style="margin:0;color:var(--mute)">${esc(b.a)} · ${b.g}<br>${a ? `${a} of ${b.c} copies available` : 'All copies are out right now.'}</p>
  ${a ? `${staff() ? `<label for="bm">Lend to</label><select id="bm">${students().map(m => `<option value="${m.id}">${esc(m.n)} (${m.id})</option>`).join('')}</select>` : `<p style="margin:12px 0 0">Borrowing as <b>${esc(me.n)}</b></p>`}
  <label for="bd">Loan period</label><select id="bd"><option value="7">7 days</option><option value="14" selected>14 days</option><option value="21">21 days</option></select><div class="note" id="err"></div>` : ''}
  <div class="acts"><button class="btn ghost" data-close>Close</button>${a ? `<button class="btn" data-do="${id}">Confirm</button>` : ''}</div>`);
}
function doBorrow(id) {
  const m = staff() ? $('#bm').value : me.id, days = +$('#bd').value, name = U(m).n, err = t => { $('#err').textContent = t; };
  if (mine(m).some(l => late(l))) return err(`${name} has an overdue book. Return it first.`);
  if (mine(m).length >= MAXLOAN) return err(`${name} already has ${MAXLOAN} books. Return one to borrow another.`);
  if (mine(m).some(l => l.b === id)) return err('This member already has a copy of this book.');
  if (avail(bk(id)) < 1) return err('The last copy was just taken. Pick another book.');
  S.loans.push({ b: id, m, out: Date.now(), due: Date.now() + days * D, ret: null });
  note(`${name} borrowed “${bk(id).t}”`); save(); $('#dlg').close(); toast(`Done. Due ${fmt(Date.now() + days * D)}`); render();
}

/* ---------- render ---------- */
function render() {
  if (!me) { loginView(); return; }
  $('#login').hidden = true; $('#shell').hidden = false;
  const tabs = staff() ? [['dash', '🏠', 'Overview'], ['cat', '📚', 'Catalogue'], ['loans', '🔖', 'Loans'], ['mem', '👥', 'People'], ['disc', '🌐', 'Discover']] : [['dash', '🏠', 'Home'], ['cat', '📚', 'Catalogue'], ['loans', '🔖', 'My loans'], ['disc', '🌐', 'Discover']];
  $('#nav').innerHTML = `<div class="brand">Shelfwise<small>${staff() ? 'Staff portal' : 'Student portal'}</small></div>` + tabs.map(([v, i, t]) => `<button class="tab ${v === view ? 'on' : ''}" data-v="${v}"><span>${i}</span>${t}</button>`).join('');
  $('#main').innerHTML = `<div class="who"><span class="badge mid">${{ admin: 'Admin', staff: 'Staff', student: 'Student' }[me.role]}</span><b>${esc(me.n)}</b><span class="sp"></span><button class="btn ghost" id="theme">Theme</button><button class="btn ghost" id="out">Log out</button></div>` + ({ dash, cat, loans: loansV, mem: people, disc: discV }[view])();
  if (view === 'cat') drawGrid();
  if (view === 'disc') { drawDisc(); if (!disc.res && !disc.busy && !disc.err) search('subject:' + disc.g.toLowerCase()); }
}

/* ---------- events ---------- */
document.addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t) return; const d = t.dataset;
  if (d.lm) { lm = d.lm; render(); }
  else if (d.v) { view = d.v; render(); scrollTo(0, 0); }
  else if (d.go) { view = d.go; render(); scrollTo(0, 0); }
  else if (d.open || d.borrow) borrowForm(+(d.open || d.borrow));
  else if (d.gen) { gen = d.gen; render(); }
  else if (d.close !== undefined) $('#dlg').close();
  else if (d.do) doBorrow(+d.do);
  else if (d.ret) { const l = S.loans[+d.ret], f = fine(l); l.ret = Date.now(); note(`${U(l.m).n} returned “${bk(l.b).t}”`); save(); toast(f ? `Returned. Collect a fine of ₹${f}` : 'Returned. Thank you!'); render(); }
  else if (d.renew) { const l = S.loans[+d.renew]; l.renewed = true; l.due += 7 * D; note(`${U(l.m).n} renewed “${bk(l.b).t}”`); save(); toast('Renewed for 7 more days'); render(); }
  else if (d.del) { const b = bk(+d.del); if (act().some(l => l.b === b.id)) toast('Can’t remove a book while copies are on loan'); else dlg(`<h2>Remove this book?</h2><p style="margin:0;color:var(--mute)">“${esc(b.t)}” will be removed from the catalogue.</p><div class="acts"><button class="btn ghost" data-close>Keep it</button><button class="btn" data-delok="${b.id}">Remove book</button></div>`); }
  else if (d.delok) { const b = bk(+d.delok); S.books = S.books.filter(x => x.id !== b.id); note(`${me.n} removed “${b.t}”`); save(); $('#dlg').close(); toast('Book removed'); render(); }
  else if (d.dg) { disc.g = d.dg; disc.q = ''; disc.res = null; render(); }
  else if (d.ol) addOL(+d.ol);
  else if (t.id === 'dgo') { disc.q = $('#dq').value.trim(); if (disc.q) { render(); search(disc.q); } }
  else if (t.id === 'addb') dlg(`<h2>Add a book</h2><label for="nt">Title</label><input id="nt"><label for="na">Author</label><input id="na"><label for="ng">Genre</label><select id="ng">${GENRES.map(g => `<option>${g}</option>`).join('')}</select><label for="nc">Copies</label><input id="nc" type="number" min="1" max="20" value="1"><div class="note" id="err"></div><div class="acts"><button class="btn ghost" data-close>Cancel</button><button class="btn" id="saveb">Save book</button></div>`);
  else if (t.id === 'saveb') { const ti = $('#nt').value.trim(), au = $('#na').value.trim(); if (!ti || !au) { $('#err').textContent = 'Enter both a title and an author.'; return; } S.books.push({ id: Math.max(0, ...S.books.map(b => b.id)) + 1, t: ti, a: au, g: $('#ng').value, c: Math.max(1, +$('#nc').value || 1) }); note(`${me.n} added “${ti}”`); save(); $('#dlg').close(); toast('Book added'); render(); }
  else if (t.id === 'addm') dlg(`<h2>Add ${me.role === 'admin' ? 'a person' : 'a student'}</h2><label for="mn">Full name</label><input id="mn">${me.role === 'admin' ? '<label for="mr">Role</label><select id="mr"><option value="student">Student</option><option value="staff">Staff</option></select>' : ''}<label for="mp">Temporary password</label><input id="mp" value="student123"><div class="note" id="err"></div><div class="acts"><button class="btn ghost" data-close>Cancel</button><button class="btn" id="savem">Save</button></div>`);
  else if (t.id === 'savem') {
    const n = $('#mn').value.trim(), pw = $('#mp').value, role = me.role === 'admin' ? $('#mr').value : 'student';
    if (!n || pw.length < 6) { $('#err').textContent = 'Enter a name and a password of at least 6 characters.'; return; }
    const id = role === 'student' ? 'S-' + (Math.max(100, ...students().map(s => +s.id.slice(2))) + 1) : n.toLowerCase().replace(/[^a-z0-9]/g, '') || 'staff' + S.users.length;
    if (S.users.some(u => u.id === id)) { $('#err').textContent = 'That username is taken. Use a different name.'; return; }
    S.users.push({ id, n, role, pw }); note(`${me.n} added ${n}`); save(); $('#dlg').close(); toast(`Added. Their sign-in ID is ${id}`, 5000); render();
  }
  else if (t.id === 'theme') { const r = document.documentElement, dark = matchMedia('(prefers-color-scheme:dark)').matches, cur = r.dataset.theme || (dark ? 'dark' : 'light'); r.dataset.theme = cur === 'dark' ? 'light' : 'dark'; }
  else if (t.id === 'out') { me = null; try { sessionStorage.removeItem('sw_me'); } catch (x) { } lm = 'student'; render(); }
});
document.addEventListener('submit', e => {
  if (e.target.id !== 'lf') return; e.preventDefault();
  const pw = $('#lpw').value, err = t => { $('#lerr').textContent = t; };
  if (lm === 'reg') {
    const n = $('#ln').value.trim(); if (pw.length < 6) return err('Use a password with at least 6 characters.');
    const u = { id: 'S-' + (Math.max(100, ...students().map(s => +s.id.slice(2))) + 1), n, role: 'student', pw };
    S.users.push(u); note(`${n} joined as a student`); save(); signIn(u); toast(`Welcome! Your student ID is ${u.id}. Use it to sign in next time.`, 7000); return;
  }
  const id = $('#lid').value.trim().toLowerCase(), u = S.users.find(x => x.id.toLowerCase() === id);
  if (!u || u.pw !== pw || (lm === 'student') !== (u.role === 'student')) return err(lm === 'student' ? 'That student ID and password don’t match. Check both and try again.' : 'That username and password don’t match, or this isn’t a staff account.');
  signIn(u);
});
document.addEventListener('input', e => {
  if (e.target.id === 'q') { q = e.target.value; drawGrid(); }
});
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'dq') $('#dgo').click(); });
document.addEventListener('change', e => { if (e.target.id === 'dgen') disc.g = e.target.value; });

/* ---------- live sync: other tabs and browsers windows update instantly ---------- */
const busy = () => $('#dlg').open || /INPUT|SELECT/.test(document.activeElement.tagName);
addEventListener('storage', e => {
  if (e.key !== KEY || !e.newValue) return;
  try { S = JSON.parse(e.newValue); } catch (x) { return; }
  if (me) { const u = S.users.find(x => x.id === me.id); if (u) me = u; }
  if (!busy() && me) render();
});
setInterval(() => { if (me && !busy() && view !== 'disc') render(); }, 60000);
render();
