'use strict';
// No npm dependencies. Run: node --test tests/security-dom.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');

test('both SVG fallbacks keep filenames as XML text', () => {
    for (const [file, argument] of [
        ['previous_workshop.html', {src: '<g data-test="injection"/> & photo'}],
        ['mars-rover.html', '<g data-test="injection"/> & photo']
    ]) {
        const source = fs.readFileSync(path.join(root, file), 'utf8');
        const match = source.match(/function placeholder\([^)]*\)\s*\{[\s\S]*?\n\s*\}(?=\s*function makeImg)/);
        assert.ok(match, `${file}: placeholder function found`);
        const placeholder = vm.runInNewContext('(' + match[0] + ')');
        const result = decodeURIComponent(placeholder(argument, 0).split(',')[1]);
        assert.ok(result.includes('&lt;g data-test="injection"/&gt; &amp; photo'));
        assert.ok(!result.includes('<g data-test='));
    }
});

test('roster rendering preserves structure and never parses member text', () => {
    class Element {
        constructor(tag) { this.tagName = tag; this.children = []; this.style = {}; this._text = ''; }
        appendChild(child) { this.children.push(child); }
        set textContent(value) { this._text = value; this.children = []; }
        get textContent() { return this._text; }
        set innerHTML(value) { throw new Error('Unsafe HTML parsing is prohibited'); }
    }
    const source = fs.readFileSync(path.join(root, 'mars-rover.js'), 'utf8');
    const start = source.indexOf('function openTeamModal(');
    const end = source.indexOf('function closeTeamModal(', start);
    const grid = new Element('div');
    const memberName = '<img src=x onerror=alert(1)> & Test';
    const sandbox = {
        teamData: {test: {title: 'Team', leader: {name: 'Leader', img: 'ARIF.jpg'}, members: [{name: memberName, img: 'AMIT.webp'}]}, empty: {title: 'Empty', leader: {name: 'Leader', img: 'ARIF.jpg'}, members: []}},
        modalTeamName: new Element('h3'), modalLeaderName: new Element('span'),
        modalLeaderAvatar: new Element('div'), modalMemberGrid: grid,
        modal: {classList: {add() {}}}, orbitRing: {style: {}},
        document: {body: {style: {}}, createElement: tag => new Element(tag)}
    };
    vm.createContext(sandbox);
    vm.runInContext(source.slice(start, end), sandbox);
    sandbox.openTeamModal('test');
    assert.equal(grid.children.length, 1);
    assert.equal(grid.children[0].className, 'member');
    const [avatar, name] = grid.children[0].children;
    assert.equal(avatar.className, 'member-avatar');
    assert.equal(avatar.style.backgroundImage, "url('AMIT.webp')");
    assert.equal(name.className, 'member-name');
    assert.equal(name.textContent, memberName);
    sandbox.openTeamModal('empty');
    assert.equal(grid.children.length, 0);
});
