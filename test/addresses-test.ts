"use strict";

const assert = require("assert");

const { parse } = require("../lib/index.js");

function _check(address: string, dot?: string, quote?: string, name?: string, addr?: string) {
    const a = parse(address);
    assert.equal(a.localPart.DotString, dot);
    assert.equal(a.localPart.QuotedString, quote);
    assert.equal(a.domainPart.DomainName, name);
    assert.equal(a.domainPart.AddressLiteral, addr);
}

// <https://en.wikipedia.org/wiki/Email_address#Examples>

describe("good addresses pass", function () {
    it("simple@example.com", function () {
        _check("simple@example.com", "simple", undefined, "example.com", undefined);
    });
    it("very.common@example.com", function () {
        _check("very.common@example.com", "very.common", undefined, "example.com", undefined);
    });
    it("disposable.style.email.with+symbol@example.com", function () {
        _check(
            "disposable.style.email.with+symbol@example.com",
            "disposable.style.email.with+symbol",
            undefined,
            "example.com",
            undefined
        );
    });
    it("one-letter local-part", function () {
        _check("x@example.com", "x", undefined, "example.com", undefined);
    });
    it("local domain name with no TLD", function () {
        _check("admin@mailserver1", "admin", undefined, "mailserver1", undefined);
    });
    it("space between the quotes", function () {
        _check('" "@example.org', undefined, '" "', "example.org", undefined);
    });
    it("quoted double dot", function () {
        _check('"john..doe"@example.org', undefined, '"john..doe"', "example.org", undefined);
    });
    it("bangified host route used for uucp mailers", function () {
        _check("mailhost!username@example.org", "mailhost!username", undefined, "example.org", undefined);
    });
    it("% escaped mail route to user@example.com via example.org", function () {
        _check("user%example.com@example.org", "user%example.com", undefined, "example.org", undefined);
    });
    it("local part ending with non-alphanumeric character from the list of allowed printable characters", function () {
        _check("user-@example.org", "user-", undefined, "example.org", undefined);
    });
    it('address literal to the right of the "@" sign', function () {
        _check("simple@[127.0.0.1]", "simple", undefined, undefined, "[127.0.0.1]");
    });
    it("Unicode UTF-8", function () {
        _check("我買@屋企.香港", "我買", undefined, "屋企.香港", undefined);
    });

});
