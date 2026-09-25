# Dharmam contributions

The library contains ten owner-supplied chapters. Titles follow the supplied
contents screenshots; verse text, numbering, and Malayalam explanations follow
the owner's messages. Each new verse has its own explanation block.

| Chapter | Title | Supplied verses | Passage groups |
| --- | --- | --- | --- |
| 6 | ഗുരുവാച | 26–32 | 7 |
| 7 | ജാതി മത ദൈവ വിചാരം | 33 | 1 |
| 8 | ജാതി നിരൂപണം | 34–43 | 10 |
| 9 | മതനിരൂപണം | 44–60 | 17 |
| 10 | ഏകദൈവവിചാരം | 61–66 (62 supplied twice) | 7 |

The first five chapters are unchanged. Chapters 4 and 5 retain the identical
verses 11–13 as previously confirmed by the owner. Verses 14–25 have not been
provided; the sixth chapter begins at 26 without renumbering or invented text.
Chapter 10 retains both occurrences of verse 62 and its explanation as supplied.

The seed is `packages/library/data/dharmam.json`. The admin service's
`db:setup` pre-deploy step inserts the five new chapter IDs and their original
source snapshots while preserving existing database records and edits. Both
interfaces load chapters from PostgreSQL, so this content update requires no
reader interface change. The existing live verifier checks every supplied
chapter against the seed and all 60 krithis against their source checksums.
