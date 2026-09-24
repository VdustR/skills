# Decision Tree

Ask:

1. Is the source text misspelled? Correct it.
2. Is there a canonical product, API, person, or domain spelling? Use that form.
3. Is the term reused and meaningful to repository readers? Add it to the
   narrowest repository dictionary. Search first: if a dictionary already
   lists it, add nothing; if local directives in other files already list it,
   it is reused, so add it and delete those directives.
4. Is it an intentional one-off token? Use a local directive. A repository
   convention of local directives covers one-off tokens only; it does not make
   a recurring term local.
5. Is the content generated, encoded, or structurally unsuitable for spelling
   checks? Use a narrow ignore pattern or exclude the generated source.

Avoid case variants that conceal inconsistent naming. Do not add random hashes,
test noise, URLs, or generated identifiers to a dictionary. If the diagnostic
comes only from an editor and the repository has no cspell configuration,
report that boundary instead of inventing project policy.
