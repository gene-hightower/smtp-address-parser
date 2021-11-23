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
 * Apply Gmail style addreess local-part normalization rules, strip
 * "+something" and remove interior "."s in a dotString. Fold case.
 */
export function normalize_dot_string(dot_string: string) {
    const tagless = (function () {
        const plus_loc = dot_string.indexOf("+");
        if (plus_loc === -1) {
            return dot_string;
        }
        return dot_string.substr(0, plus_loc);
    })();
    const dotless = tagless.replace(/\./g, "");
    return dotless.toLowerCase();
}

/**
 * Apply Gmail style address normalization rules, strip "+something"
 * and remove interior "."s in a dotString. Fold case.
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
        return normalize_dot_string(a.localPart.DotString);
    })();
    return `${local}@${domain}`;
}

/**
 * Apply canonicalization rules to quoted string.
 */
export function canonicalize_quoted_string(quoted_string: string) {
    const unquoted = quoted_string.substr(1).substr(0, quoted_string.length - 2);
    const unescaped = unquoted.replace(/(?:\\(.))/g, "$1");
    const reescaped = unescaped.replace(/(?:(["\\]))/g, "\\$1");
    return `"${reescaped}"`; // re-quote
}

/**
 * Apply a canonicalization consistent with standards to support
 * comparison as a string.
 */
export function canonicalize(address: string) {
    const a = parse(address);
    const domain = (function () {
        if (a.domainPart.AddressLiteral) {
            return a.domainPart.AddressLiteral;
        }
        return a.domainPart.DomainName.toLowerCase();
    })();
    const local = (function () {
        if (a.localPart.QuotedString) {
            return canonicalize_quoted_string(a.localPart.QuotedString);
        }
        return a.localPart.DotString;
    })();
    return `${local}@${domain}`;
}
