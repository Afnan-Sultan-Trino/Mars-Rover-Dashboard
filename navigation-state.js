/* Same-origin, allowlisted view state. No framework or external API. */
(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ArcNavigation = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
    'use strict';
    const pages = ['home.html', 'mars-rover.html', 'sponsor.html',
        'previous_workshop.html', 'School_Community.html', 'droneWorkShop.html',
        'lineFollowing.html', 'ndc.html', 'roboSoccer.html'];
    const routes = Object.create(null);
    routes['/'] = routes['/index'] = routes['/index.html'] = 'home.html';
    pages.forEach(page => {
        routes['/' + page] = page;
        routes['/' + page.replace(/\.html$/, '')] = page;
    });
    function normalize(input, origin) {
        try {
            const url = new URL(input, origin + '/');
            if (url.origin !== origin || url.username || url.password) return null;
            const page = routes[url.pathname];
            if (!page) return null;
            const hash = /^#[A-Za-z0-9_-]*$/.test(url.hash) ? url.hash : '';
            return {page, hash};
        } catch (_) { return null; }
    }
    const storageKey = 'arc.view.v1';
    function validate(state, origin) {
        if (!state || typeof state.page !== 'string' ||
            (state.hash !== undefined && typeof state.hash !== 'string')) return null;
        const route = normalize('/' + state.page + (state.hash || ''), origin);
        if (!route || route.page !== state.page || route.hash !== (state.hash || '')) return null;
        return {
            ...route,
            scrollY: Number.isFinite(state.scrollY) ? Math.max(0, Math.min(10000000, state.scrollY)) : 0,
            title: typeof state.title === 'string' ? state.title.slice(0, 200) : ''
        };
    }
    function read(storage, origin) {
        try { return validate(JSON.parse(storage.getItem(storageKey)), origin); }
        catch (_) { return null; }
    }
    function save(storage, state, origin) {
        const checked = validate(state, origin);
        if (!checked) return false;
        try { storage.setItem(storageKey, JSON.stringify(checked)); return true; }
        catch (_) { return false; }
    }
    return Object.freeze({normalize, read, save, sanitize: validate});
});
