"use strict";

// const punycode = require('punycode');
const nearley = require("nearley");

import { default as myGrammar } from "./grammar";
myGrammar.ParserStart = "Mailbox";
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

/**
 * Apply common address normalization rules, strip "+something" and
 * remove interior "."s in a dotString. Fold case.
 */
export function normalize(address: string) {
    const a = parse(address);
    const domain = (function () {
        if (a.domainPart.AddressLiteral) return a.domainPart.AddressLiteral;
        return a.domainPart.DomainName.toLowerCase();
    })();
    const local = (function () {
        if (a.localPart.QuotedString) {
            // Should normalize quoted string.
            return a.localPart.QuotedString;
        }
        const tagless = (function () {
            const plus_loc = a.localPart.DotString.indexOf("+");
            if (plus_loc === -1) {
                return a.localPart.DotString;
            }
            return a.localPart.DotString.substr(0, plus_loc);
        })();
        const dotless = tagless.replace(/\./g, "");
        return dotless.toLowerCase();
    })();
    return `${local}@${domain}`;
}
