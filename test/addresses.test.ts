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
    it('address in quoted local-part "john.doe@example.org"@example.org', function () {
        _check('"john.doe@example.org"@example.org', undefined, '"john.doe@example.org"', "example.org", undefined);
    });
    it("escaped quoted pair", function () {
        _check('"john\\@doe"@example.org', undefined, '"john\\@doe"', "example.org", undefined);
    });
    it("escaped quoted", function () {
        _check('"john\\"doe"@example.org', undefined, '"john\\"doe"', "example.org", undefined);
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
    it('IPv6 address literal to the right of the "@" sign', function () {
        _check("simple@[IPv6:::1]", "simple", undefined, undefined, "[IPv6:::1]");
    });
    it('Another IPv6 address literal', function () {
        _check("simple@[IPv6:68:1c:a2:12:4a:e5]", "simple", undefined, undefined, "[IPv6:68:1c:a2:12:4a:e5]");
    });
    it("Unicode UTF-8", function () {
        _check("我買@屋企.香港", "我買", undefined, "屋企.香港", undefined);
    });
    it("#user@example.com", function () {
        _check("#user@example.com", "#user", undefined, "example.com", undefined);
    });
    it('General address literal', function () {
        _check("simple@[tag:Can-Be-Anything]", "simple", undefined, undefined, "[tag:Can-Be-Anything]");
    });
});

describe("bad addresses fail", function () {
    it('badly escaped quoted "john\\\\"doe"@example.org', function () {
        assert.throws(function () {
            parse('"john\\\\"doe"@example.org');
        });
    });
    it("bogus address literal [300.0.0.1]", function () {
        assert.throws(function () {
            parse("user@[300.0.0.1]");
        });
    });
    it("bogus address literal [127.0.0.0.1]", function () {
        assert.throws(function () {
            parse("user@[127.0.0.0.1]");
        });
    });
    it("bogus address literal [127.00.0.1]", function () {
        assert.throws(function () {
            parse("user@[127.00.0.1]");
        });
    });
    it("bogus address literal [127.0.1]", function () {
        assert.throws(function () {
            parse("user@[127.0.1]");
        });
    });
    it("user@example.com#", function () {
        assert.throws(function () {
            parse("user@example.com#");
        });
    });
    it("user@example.com.", function () {
        assert.throws(function () {
            parse("user@example.com.");
        });
    });
    it("foo bar@example.com", function () {
        assert.throws(function () {
            parse("foo bar@example.com");
        });
    });
    it("double dot john..doe@example.com", function () {
        assert.throws(function () {
            parse("john..doe@example.com");
        });
    });
    it("brackets <john.doe@example.com>", function () {
        assert.throws(function () {
            parse("<john.doe@example.com>");
        });
    });
    // From examples from <https://en.wikipedia.org/wiki/Email_address#Examples>
    // no @ character
    it("Abc.example.com", function () {
        assert.throws(function () {
            parse("Abc.example.com");
        });
    });
    // only one @ is allowed outside quotation marks
    it("A@b@c@example.com", function () {
        assert.throws(function () {
            parse("A@b@c@example.com");
        });
    });
    // none of the special characters in this local-part are allowed outside quotation marks
    it('a"b(c)d,e:f;g<h>i[jk]l@example.com', function () {
        assert.throws(function () {
            parse('a"b(c)d,e:f;g<h>i[jk]l@example.com');
        });
    });
    // quoted strings must be the only element making up the local-part
    it('just"not"right@example.com', function () {
        assert.throws(function () {
            parse('just"not"right@example.com');
        });
    });
    // even if escaped (preceded by a backslash), spaces, quotes, and backslashes must still be contained by quotes
    it('this\\ still\\"not\\allowed@example.com', function () {
        assert.throws(function () {
            parse('this\\ still\\"not\\allowed@example.com');
        });
    });
    // Underscore is not allowed in domain part
    it("i_like_underscore@but_its_not_allowed_in_this_part.example.com", function () {
        assert.throws(function () {
            parse("i_like_underscore@but_its_not_allowed_in_this_part.example.com");
        });
    });
});
