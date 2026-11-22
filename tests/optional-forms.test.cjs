'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');

function element() {
    const classes = new Set();
    return {handlers: {}, style: {}, scrollHeight: 250, offsetWidth: 1, value: '', checked: false,
        classList: {add(c) {classes.add(c);}, remove(c) {classes.delete(c);}, contains(c) {return classes.has(c);}, toggle(c, on) {if (on) classes.add(c); else classes.delete(c);}},
        addEventListener(type, handler) {this.handlers[type] = handler;},
        reset() {this.wasReset = true;}};
}
function home(withForm) {
    const ids = Object.fromEntries(['textBlock1', 'textBlock2', 'textBlock3', 'textBlock4', 'textSlideshow', 'prevSlide', 'nextSlide'].map(id => [id, element()]));
    if (withForm) ids.contactForm = element();
    const slides = Array.from({length: 4}, element);
    const timers = [];
    const alerts = [];
    const context = {document: {getElementById: id => ids[id] || null, querySelectorAll: s => s === '.slide' ? slides : []},
        window: {addEventListener() {}}, setTimeout: fn => timers.push(fn), setInterval: () => 1, clearInterval() {}, alert: value => alerts.push(value)};
    vm.runInNewContext(fs.readFileSync(path.join(root, 'script.js'), 'utf8'), context);
    return {ids, slides, timers, alerts};
}

test('home initializes without the disabled contact form and carousel still works', () => {
    const app = home(false);
    app.timers.splice(0).forEach(fn => fn());
    app.ids.nextSlide.handlers.click();
    assert.equal(app.slides[1].classList.contains('active'), true);
});

test('an enabled contact demo never claims delivery or erases the visitor message', () => {
    const app = home(true);
    let prevented = false;
    app.ids.contactForm.handlers.submit.call(app.ids.contactForm, {preventDefault() {prevented = true;}});
    assert.equal(prevented, true);
    assert.equal(app.ids.contactForm.wasReset, undefined);
    assert.match(app.alerts[0], /not (?:been )?sent/i);
});

test('sponsor script safely skips an entirely disabled form', () => {
    assert.doesNotThrow(() => vm.runInNewContext(fs.readFileSync(path.join(root, 'sponsor.js'), 'utf8'), {
        document: {getElementById: () => null, querySelectorAll: () => []}
    }));
});

function sponsor() {
    const ids = Object.fromEntries(['sponsorForm', 'orgName', 'contactPerson', 'email', 'phone', 'message', 'agreeCheck', 'agreementBox', 'submitSponsor'].map(id => [id, element()]));
    ids.orgName.value = 'Audit Organisation';
    ids.contactPerson.value = 'Audit Contact';
    ids.email.value = 'audit@example.invalid';
    ids.agreeCheck.checked = true;
    let valid = true;
    let validityChecks = 0;
    ids.sponsorForm.reportValidity = () => {validityChecks++; return valid;};
    const tier = element(); tier.dataset = {tier: 'bronze'};
    const alerts = [];
    vm.runInNewContext(fs.readFileSync(path.join(root, 'sponsor.js'), 'utf8'), {
        document: {getElementById: id => ids[id] || null, querySelectorAll: s => s === '.tier-card' ? [tier] : []},
        alert: value => alerts.push(value)
    });
    tier.handlers.click.call(tier);
    return {ids, alerts, invalidate() {valid = false;}, checks() {return validityChecks;}};
}

test('restored sponsor form invokes native validity before accepting input', () => {
    const app = sponsor(); app.invalidate();
    app.ids.submitSponsor.handlers.click({preventDefault() {}});
    assert.equal(app.checks(), 1);
    assert.deepEqual(app.alerts, []);
});

test('restored sponsor agreement leaves label activation to the browser', () => {
    const app = sponsor(); app.ids.agreeCheck.checked = false;
    app.ids.agreementBox.handlers.click({target: {tagName: 'STRONG', closest: () => ({tagName: 'LABEL'})}});
    assert.equal(app.ids.agreeCheck.checked, false, 'Parent must not toggle before native label activation');
});

test('restored sponsor demo discloses non-delivery for click and Enter submission', () => {
    const app = sponsor();
    app.ids.submitSponsor.handlers.click({preventDefault() {}});
    assert.match(app.alerts[0], /not (?:been )?sent/i);
    assert.equal(typeof app.ids.sponsorForm.handlers.submit, 'function');
    let prevented = false;
    app.ids.sponsorForm.handlers.submit({preventDefault() {prevented = true;}});
    assert.equal(prevented, true);
    assert.match(app.alerts[1], /not (?:been )?sent/i);
});

test('sponsor script safely skips partially restored controls', () => {
    const onlyButton = element();
    assert.doesNotThrow(() => vm.runInNewContext(fs.readFileSync(path.join(root, 'sponsor.js'), 'utf8'), {
        document: {getElementById: id => id === 'submitSponsor' ? onlyButton : null, querySelectorAll: () => []}
    }));
    assert.equal(onlyButton.handlers.click, undefined);
});
