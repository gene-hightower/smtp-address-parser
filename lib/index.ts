'use strict';

// const punycode = require('punycode');
const nearley  = require('nearley');

import { default as myGrammar } from './grammar';
myGrammar.ParserStart = 'Mailbox';
const grammar = nearley.Grammar.fromCompiled(myGrammar);

// <https://tools.ietf.org/html/rfc5321#section-4.1.2>

export function parse(address: string) {
    const parser = new nearley.Parser(grammar);
    parser.feed(address);

    if (parser.results.length !== 1) {
        throw new Error("address parsing failed: ambiguous grammar");
    }

    return parser.results[0];
}
