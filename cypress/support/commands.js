// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add(
    'login',
    (email, password) => {
        cy.log(`Logging in with email: ${email}`);

        cy.request({
            method: 'POST',
            url: `https://www.yolaqa.com/userservice/pb/users/login/`,
            body: {
                email,
                password,
            },
        }).then(({ body, headers }) => {
            const cookies = headers['set-cookie'];
            cookies.forEach(cookie => {
                // parse cookies and do what you need with them
                console.log('cookie: ', cookie);
            });
            cy.visit('/')
        })
    }
);


/* SELECTION commands Usage
* ```
 * // Types "foo" and then selects "fo"
 * cy.get('[contenteditable]')
 *   .type('foo')
 *   .setSelection('fo')
 *
 * // Types "foo", "bar", "baz", and "qux" on separate lines, then selects "foo", "bar", and "baz"
 * cy.get('[contenteditable]')
 *   .type('foo{enter}bar{enter}baz{enter}qux{enter}')
 *   .setSelection('foo', 'baz')
 *
 * // Types "foo" and then sets the cursor before the last letter
 * cy.get('[contenteditable]')
 *   .type('foo')
 *   .setCursorAfter('fo')
 *
 * // Types "foo" and then sets the cursor at the beginning of the word
 * cy.get('[contenteditable]')
 *   .type('foo')
 *   .setCursorBefore('foo')
 *
 * // `setSelection` can alternatively target starting and ending nodes using query strings,
 * // plus specific offsets. The queries are processed via `Element.querySelector`.
 * cy.get('body')
 *   .setSelection({
 *     anchorQuery: 'ul > li > p', // required
 *     anchorOffset: 2 // default: 0
 *     focusQuery: 'ul > li > p:last-child', // default: anchorQuery
 *     focusOffset: 0 // default: 0
 *    })
 */

// Low level command reused by `setSelection` and low level command `setCursor`
Cypress.Commands.add('selection', { prevSubject: true }, (subject, fn) => {
    cy.wrap(subject)
        .trigger('mousedown')
        .then(fn)
        .trigger('mouseup');

    cy.document().trigger('selectionchange');
    return cy.wrap(subject);
});

Cypress.Commands.add('setSelection', { prevSubject: true }, (subject, query, endQuery) => {
    return cy.wrap(subject)
        .selection($el => {
            if (typeof query === 'string') {
                const anchorNode = getTextNode($el[0], query);
                const focusNode = endQuery ? getTextNode($el[0], endQuery) : anchorNode;
                const anchorOffset = anchorNode.wholeText.indexOf(query);
                const focusOffset = endQuery ?
                    focusNode.wholeText.indexOf(endQuery) + endQuery.length :
                    anchorOffset + query.length;
                setBaseAndExtent(anchorNode, anchorOffset, focusNode, focusOffset);
            } else if (typeof query === 'object') {
                const el = $el[0];
                const anchorNode = getTextNode(el.querySelector(query.anchorQuery));
                const anchorOffset = query.anchorOffset || 0;
                const focusNode = query.focusQuery ? getTextNode(el.querySelector(query.focusQuery)) : anchorNode;
                const focusOffset = query.focusOffset || 0;
                setBaseAndExtent(anchorNode, anchorOffset, focusNode, focusOffset);
            }
        });
});

// Low level command reused by `setCursorBefore` and `setCursorAfter`, equal to `setCursorAfter`
Cypress.Commands.add('setCursor', { prevSubject: true }, (subject, query, atStart) => {
    return cy.wrap(subject)
        .selection($el => {
            const node = getTextNode($el[0], query);
            const offset = node.wholeText.indexOf(query) + (atStart ? 0 : query.length);
            const document = node.ownerDocument;
            document.getSelection().removeAllRanges();
            document.getSelection().collapse(node, offset);
        })
    // Depending on what you're testing, you may need to chain a `.click()` here to ensure
    // further commands are picked up by whatever you're testing (this was required for Slate, for example).
});

Cypress.Commands.add('setCursorBefore', { prevSubject: true }, (subject, query) => {
    cy.wrap(subject).setCursor(query, true);
});

Cypress.Commands.add('setCursorAfter', { prevSubject: true }, (subject, query) => {
    cy.wrap(subject).setCursor(query);
});


// Helper functions
function getTextNode(el, match){
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
    if (!match) {
        return walk.nextNode();
    }

    const nodes = [];
    let node;
    while(node = walk.nextNode()) {
        if (node.wholeText.includes(match)) {
            return node;
        }
    }
}

function setBaseAndExtent(...args) {
    const document = args[0].ownerDocument;
    document.getSelection().removeAllRanges();
    document.getSelection().setBaseAndExtent(...args);
}

function paste({ destinationSelector, pastePayload, pasteType = 'text' }) {
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/paste_event
    cy.get(destinationSelector).then($destination => {
        const pasteEvent = Object.assign(new Event('paste', { bubbles: true, cancelable: true }), {
            clipboardData: {
                getData: (type = pasteType) => pastePayload,
            },
        });
        $destination[0].dispatchEvent(pasteEvent);
    });
}

Cypress.Commands.add('paste', { prevSubject: true }, (subject, { pastePayload, pasteType = 'text' }) => {
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/paste_event
    return cy.wrap(subject).then($el => {
        const pasteEvent = Object.assign(new Event('paste', { bubbles: true, cancelable: true }), {
            clipboardData: {
                getData: (type = pasteType) => pastePayload,
            },
        });
        $el[0].dispatchEvent(pasteEvent);
    });
});
