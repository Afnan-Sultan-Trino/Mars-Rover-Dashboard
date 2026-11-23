/* Keep native page layouts/scripts isolated while the parent address stays '/'. */
(function () {
    'use strict';
    const navigation = window.ArcNavigation;
    const origin = window.location.origin;
    const route = navigation.normalize(window.location.href, origin);
    if (!route) return;
    let storage = null;
    try { storage = window.sessionStorage; } catch (_) { /* storage can be disabled */ }
    if (window.self === window.top) {
        // Old bookmarks still select their page, then show only the main domain.
        // If storage is unavailable, keep the usable direct page rather than lose it.
        if (navigation.save(storage, {...route, scrollY: 0, title: document.title}, origin)) {
            window.location.replace('/');
        }
        return;
    }
    const saved = navigation.read(storage, origin);
    let leaving = false;
    function remember() {
        if (leaving) return;
        const state = {...route, hash: window.location.hash,
            scrollY: window.scrollY, title: document.title};
        const checked = navigation.sanitize(state, origin);
        if (!checked) return;
        navigation.save(storage, checked, origin);
        window.parent.postMessage({type: 'arc:view', state: checked}, origin);
    }
    function ready() {
        remember();
        window.addEventListener('load', function () {
            if (saved && saved.page === route.page && saved.hash === route.hash && saved.scrollY > 0) {
                window.scrollTo({top: saved.scrollY, behavior: 'instant'});
            }
            remember();
        }, {once: true});
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, {once: true});
    else ready();
    window.addEventListener('scroll', remember, {passive: true});
    window.addEventListener('hashchange', remember);
    window.addEventListener('pagehide', remember);
    window.addEventListener('pageshow', function () { leaving = false; remember(); });
    window.addEventListener('beforeunload', remember);
    document.addEventListener('click', function (event) {
        if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey ||
            event.shiftKey || event.altKey) return;
        const anchor = event.target.closest && event.target.closest('a[href]');
        if (!anchor || anchor.hasAttribute('download') || anchor.target === '_blank') return;
        const destination = navigation.normalize(anchor.href, origin);
        if (!destination) {
            // Ordinary external pages cannot be embedded by the shell's self-only CSP.
            const external = new URL(anchor.href, window.location.href);
            if (/^https?:$/.test(external.protocol) && external.origin !== origin && !anchor.target) {
                event.preventDefault();
                window.open(external.href, '_blank', 'noopener,noreferrer');
            }
            return;
        }
        const url = new URL(anchor.href);
        if (destination.page === route.page && url.pathname === window.location.pathname) return;
        event.preventDefault();
        remember();
        leaving = true;
        // Persist the destination before loading it, so even an immediate refresh
        // cannot restore the previous page. The outgoing view must not overwrite it.
        navigation.save(storage, {...destination, scrollY: 0, title: ''}, origin);
        window.location.assign('/' + destination.page + destination.hash);
    }, true);
})();
