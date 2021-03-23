# smtp-address-parser

Parse an SMTP (RFC-5321) address.

[![https://nodei.co/npm/smtp-address-parser.png?downloads=true&downloadRank=true&stars=true](https://nodei.co/npm/smtp-address-parser.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/smtp-address-parser)

## Some notes

Length limitations are not checked.

Technically a local-part of a Mailbox address is limited to 64 octets
or less, see: <https://tools.ietf.org/html/rfc5321#section-4.5.3.1.1>

Also, domain names are limited to 255 octets, see:
<https://tools.ietf.org/html/rfc5321#section-4.5.3.1.2>

And individual labels within a domain name are limited to 63
octets or less, see:
<https://tools.ietf.org/html/rfc1035> section 2.3.4. Size limits
