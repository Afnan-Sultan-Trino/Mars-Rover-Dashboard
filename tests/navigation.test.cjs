'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const file = path.join(__dirname, '..', 'navigation-state.js');

test('normalizes legacy page links to allowlisted view filenames', () => {
    assert.ok(fs.existsSync(file), 'Domain-only navigation state module must exist');
    const navigation = require(file);
    const origin = 'https://www.aiubroboticcrew.com';
    assert.deepEqual(navigation.normalize('/mars-rover#home', origin), {page: 'mars-rover.html', hash: '#home'});
    assert.deepEqual(navigation.normalize('/index.html#about', origin), {page: 'home.html', hash: '#about'});
    assert.deepEqual(navigation.normalize('/', origin), {page: 'home.html', hash: ''});
});

test('session state restores the view and scroll position in the same tab', () => {
    const navigation = require(file);
    const origin = 'https://www.aiubroboticcrew.com';
    const values = new Map();
    const storage = {getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value)};
    assert.equal(typeof navigation.save, 'function');
    assert.equal(navigation.save(storage, {page: 'mars-rover.html', hash: '#teams', scrollY: 1234, title: 'ARC Rover'}, origin), true);
    assert.deepEqual(navigation.read(storage, origin), {page: 'mars-rover.html', hash: '#teams', scrollY: 1234, title: 'ARC Rover'});
});

test('external URLs and malformed session routes cannot select a view', () => {
    const navigation = require(file);
    const origin = 'https://www.aiubroboticcrew.com';
    for (const input of ['https://attacker.invalid/mars-rover.html', 'javascript:alert(1)', '/unknown.html', '/.git/config', 'https://user:password@www.aiubroboticcrew.com/mars-rover.html']) {
        assert.equal(navigation.normalize(input, origin), null, input);
    }
    for (const state of [{page: '../mars-rover.html'}, {page: 'https://attacker.invalid/'}, {page: 'home.html', hash: '#<img>'}]) {
        assert.equal(navigation.sanitize(state, origin), null);
    }
});

test('unavailable or corrupt session storage degrades without throwing', () => {
    const navigation = require(file);
    const origin = 'https://www.aiubroboticcrew.com';
    const unavailable = {getItem() {throw new Error('disabled');}, setItem() {throw new Error('disabled');}};
    assert.equal(navigation.read(unavailable, origin), null);
    assert.equal(navigation.read({getItem: () => '{invalid'}, origin), null);
    assert.equal(navigation.save(unavailable, {page: 'home.html', hash: ''}, origin), false);
});

test('the outgoing view cannot overwrite its destination during immediate refresh', () => {
    const navigation = require(file);
    const origin = 'https://www.aiubroboticcrew.com';
    const values = new Map();
    const storage = {getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value)};
    const windowEvents = {}, documentEvents = {};
    let assigned;
    const window = {ArcNavigation: navigation, sessionStorage: storage, self: {}, top: {},
        parent: {postMessage() {}}, scrollY: 100,
        location: {origin, href: origin + '/home.html', pathname: '/home.html', hash: '', assign: value => {assigned = value;}},
        addEventListener: (type, callback) => {windowEvents[type] = callback;}};
    const document = {readyState: 'loading', title: 'ARC', addEventListener: (type, callback) => {documentEvents[type] = callback;}};
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'view-navigation.js'), 'utf8'), {window, document, URL});
    const anchor = {href: origin + '/mars-rover#home', target: '', hasAttribute: () => false};
    let prevented = false;
    documentEvents.click({button: 0, target: {closest: () => anchor}, preventDefault() {prevented = true;}});
    windowEvents.pagehide();
    assert.equal(prevented, true);
    assert.equal(assigned, '/mars-rover.html#home');
    assert.equal(navigation.read(storage, origin).page, 'mars-rover.html');
    assert.equal(navigation.read(storage, origin).hash, '#home');
});
