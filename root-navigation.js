/* Domain-only top-level address; preserve the existing pages in one trusted frame. */
(function () {
    'use strict';
    const navigation = window.ArcNavigation;
    const origin = window.location.origin;
    if (window.self !== window.top) {
        // Legacy links to index.html inside a view must not create nested shells.
        window.location.replace('/home.html' + window.location.hash);
        return;
    }
    let storage = null;
    try { storage = window.sessionStorage; } catch (_) { /* safe home fallback */ }
    let state = navigation.read(storage, origin);
    if (window.location.pathname !== '/' || window.location.hash) {
        const legacy = navigation.normalize('/' + window.location.hash, origin);
        state = {...legacy, scrollY: 0, title: ''};
    }
    state = state || {page: 'home.html', hash: '', scrollY: 0, title: ''};
    navigation.save(storage, state, origin);
    window.history.replaceState(null, '', '/');
    const frame = document.getElementById('arcPage');
    if (state.title) document.title = state.title;
    window.addEventListener('message', function (event) {
        if (event.origin !== origin || event.source !== frame.contentWindow ||
            !event.data || event.data.type !== 'arc:view') return;
        const checked = navigation.sanitize(event.data.state, origin);
        if (!checked) return;
        // Children persist their own state. Never overwrite a newer destination
        // with a queued message from an outgoing document in the same frame.
        let current;
        try { current = navigation.normalize(frame.contentWindow.location.href, origin); }
        catch (_) { return; } // Ignore stale messages if a frame is navigating away.
        if (!current || current.page !== checked.page) return;
        const title = checked.title;
        if (title) {
            document.title = title;
            frame.title = title;
        }
    });
    frame.src = '/' + state.page + state.hash;
})();
