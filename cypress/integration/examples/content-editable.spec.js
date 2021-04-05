/// <reference types="cypress" />
import 'cypress-iframe'

context('Actions', () => {
    before(() => {
        cy.clearCookies();
        cy.login('<your_email>', '<your_password>');
        cy.wait(30000);
    });

    beforeEach(() => {
        cy.frameLoaded('iframe[src*="https://editor.ws-platformqa.net"]');
        cy.enter('iframe[src*="https://editor.ws-platformqa.net"]').then(getBody => {
            getBody().find('iframe').its('0.contentDocument.body').then(cy.wrap)
                .find('ws-text').children().eq(0).click()
                .type('Test')
                .type('{selectAll}{backspace}')
                .type('{backspace}')
        });
    });

    // it.only('it should focus element', () => {
    //     cy.frameLoaded('iframe[src*="https://editor.ws-platformqa.net"]');
    //     cy.enter('iframe[src*="https://editor.ws-platformqa.net"]').then(getBody => {
    //         getBody().find('iframe').its('0.contentDocument.body').then(cy.wrap)
    //             .find('ws-text').children().eq(0).click()
    //             .setSelection({
    //                 anchorQuery: 'h2 > u',
    //                 anchorOffset: 0,
    //                 focusQuery: 'h2 > u',
    //                 focusOffset: 7
    //             })
    //             .type('{backspace}')
    //             .type('selectAll')
    //             .paste({ pastePayload: '<ul><li>item 1</li><li>item 2</li></ul>', pasteType: 'text/html' })
    //     });
    // });

    it('Select all text with cmd+A and delete it with Backspace key', () => {
        cy.frameLoaded('iframe[src*="https://editor.ws-platformqa.net"]');
        cy.enter('iframe[src*="https://editor.ws-platformqa.net"]').then(getBody => {
            getBody().find('iframe').its('0.contentDocument.body').then(cy.wrap)
                .find('ws-text').children().eq(0).click()
                .type('Test')
                .type('{selectAll}{backspace}')
                .should(($heading) => {
                    const $contentEditable = $heading.closest('[contenteditable]');
                    expect($contentEditable[0].children.length).to.equal(1)
                    expect($heading[0].innerText).to.equal('\n')
                })
        });
    });


    it('Select all text using mouse and delete it with Backspace key', () => {
        cy.frameLoaded('iframe[src*="https://editor.ws-platformqa.net"]');
        cy.enter('iframe[src*="https://editor.ws-platformqa.net"]').then(getBody => {
            getBody().find('iframe').its('0.contentDocument.body').then(cy.wrap)
                .find('ws-text').children().eq(0).click()
                .type('{backspace}Test', {delay: 100})
                .setSelection('Test')
                .type('{backspace}')
                .should(($heading) => {
                    const $contentEditable = $heading.closest('[contenteditable]');
                    expect($contentEditable[0].children.length).to.equal(1)
                    expect($heading[0].innerText).to.equal('\n')
                })
        });
    });

    it('Select all text using CMD+A keys and make it bold using dedicate control pane trigger', () => {
        cy.frameLoaded('iframe[src*="https://editor.ws-platformqa.net"]');

        cy.enter('iframe[src*="https://editor.ws-platformqa.net"]').then(getBody => {
            getBody().find('iframe').its('0.contentDocument.body').then(cy.wrap)
                .find('ws-text').children().eq(0).click()
                .type('Test')
                .type('{selectAll}');

            getBody().find('.ws-control-pane')
                .find('#text-bold').as('bold-trigger').click();

            getBody().find('iframe').its('0.contentDocument.body').then(cy.wrap)
                .find('ws-text')
                .should(($node) => {
                    const $heading = $node[0].firstElementChild;
                    expect($heading.firstElementChild.nodeName).to.equal('B');
                });
        });

    });

    it('Select all text using CMD+A keys and make it bold using CMD+B', () => {
        cy.frameLoaded('iframe[src*="https://editor.ws-platformqa.net"]');

        cy.enter('iframe[src*="https://editor.ws-platformqa.net"]').then(getBody => {
            getBody().find('iframe').its('0.contentDocument.body').then(cy.wrap)
                .find('ws-text').children().eq(0).click()
                .type('Test', )
                .type('{selectAll}')
                .type('{cmd+b}');

            getBody().find('iframe').its('0.contentDocument.body').then(cy.wrap)
                .find('ws-text')
                .should(($node) => {
                    const $heading = $node[0].firstElementChild;
                    expect($heading.firstElementChild.nodeName).to.equal('B');
                });
        });

    });


    it('Create list using dedicate control pane trigger', () => {
        cy.frameLoaded('iframe[src*="https://editor.ws-platformqa.net"]');

        cy.enter('iframe[src*="https://editor.ws-platformqa.net"]').then(getBody => {
            getBody().find('iframe').its('0.contentDocument.body').then(cy.wrap)
                .find('ws-text').children().eq(0).click()
                .type('Item 1', )
                .type('{enter}');

            getBody().find('iframe').its('0.contentDocument.body').then(cy.wrap)
                .find('ws-text').children().eq(1)
                .type('Item 2{enter}');

            getBody().find('iframe').its('0.contentDocument.body').then(cy.wrap).find('ws-text').children().eq(2)
                .type('Item 3');

            getBody().find('iframe').its('0.contentDocument.body').then(cy.wrap).find('ws-text').setSelection('Item 1', 'Item 3');

            cy.wait(200);
            getBody().find('.ws-control-pane')
                .find('#text-bullet-list').click();

            getBody().find('iframe').its('0.contentDocument.body').then(cy.wrap)
                .find('ws-text')
                .should(($node) => {
                    const $list = $node[0].firstElementChild;
                    expect($list.nodeName).to.equal('UL');
                    expect($list.children.length).to.equal(3);
                });
        });

    });


    it('Create list using keyboard shortcut "1."', () => {
        cy.frameLoaded('iframe[src*="https://editor.ws-platformqa.net"]');

        cy.enter('iframe[src*="https://editor.ws-platformqa.net"]').then(getBody => {
            getBody().find('iframe').its('0.contentDocument.body').then(cy.wrap)
                .find('ws-text').children().eq(0).click()
                .type('{rightArrow}{backspace}')
                .type('1. ', {delay: 500} );

            getBody().find('iframe').its('0.contentDocument.body').then(cy.wrap)
                .find('ws-text')
                .should(($node) => {
                    const $list = $node[0].firstElementChild;
                    expect($list.nodeName).to.equal('OL');
                });
        });

    });

    it('User can paste list', () => {
        cy.frameLoaded('iframe[src*="https://editor.ws-platformqa.net"]');

        cy.enter('iframe[src*="https://editor.ws-platformqa.net"]').then(getBody => {
            getBody().find('iframe').its('0.contentDocument.body').then(cy.wrap)
                .find('ws-text').children().eq(0).click()
                .type('{rightArrow}{backspace}')
                .type('1. ', {delay: 500} );

            getBody().find('iframe').its('0.contentDocument.body').then(cy.wrap)
                .find('ws-text')
                .should(($node) => {
                    const $list = $node[0].firstElementChild;
                    expect($list.nodeName).to.equal('OL');
                });
        });
    });

});
