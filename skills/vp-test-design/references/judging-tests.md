# Judging Tests

Worked cases for the two imagined edits in `SKILL.md`. Each case names the
contract first, because the contract decides what counts as behavior.

## Cases

| Contract | Behavior to assert | Implementation to leave alone |
| --- | --- | --- |
| An empty cart never charges the customer. | The payment client receives no call for an empty cart. Pair it with a non-empty cart that produces exactly one charge, so the test shows it can see a call. | Which internal function decided to skip the charge. |
| A failed lookup returns an empty list. | The result is an empty list for an unmatched key, and a one-element list for a matched key. | The query builder's intermediate string. |
| Callers retry on a timeout error type. | A timed-out dependency yields the error type the caller branches on. | The exact error message, unless a user reads it. |
| An external service receives a well-formed payload. | The payload the mocked service receives matches the owning schema, because that service observes it. | The order of private helper calls that assembled it. |
| Two tables must agree on a key. | The invariant holds after the operation, checked through the public read path. | How the write was sequenced. |

A test that restates a prompt string, a constant, or a fixture the test itself
built still passes after the "break the behavior" edit, because it never runs
the code that reads the value. Replace it with a case that drives the code
through its user's interface and derives the expected value from the
requirement.

## Signs of a change-detector test

- The assertion mirrors the implementation line by line.
- The test mocks most of what the code calls and asserts the mocks were called.
- The expected value was pasted from a run of the current code.
- The test needed rewriting after a refactor that changed no observable result.

## Sources

- [Testing on the Toilet: Test Behavior, Not Implementation](https://testing.googleblog.com/2013/08/testing-on-toilet-test-behavior-not.html)
  (Google Testing Blog, 2013) argues that tests should not change when
  user-facing behavior does not.
- [Testing on the Toilet: Change-Detector Tests Considered Harmful](https://testing.googleblog.com/2015/01/testing-on-toilet-change-detector-tests.html)
  (Google Testing Blog, 2015) names the test that fails on an internal change
  and passes on a behavior break.
- [Write tests. Not too many. Mostly integration.](https://kentcdodds.com/blog/write-tests)
  (Kent C. Dodds, 2019, from a 2016 Guillermo Rauch tweet) argues against
  coverage-driven tests and tests of implementation details.
- [The Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)
  (Ham Vocke, on martinfowler.com) covers narrow integration tests, and
  [Contract Test](https://martinfowler.com/bliki/ContractTest.html)
  (Martin Fowler) covers keeping test doubles aligned with real external
  behavior.
- [pstack `principle-test-behavior-not-implementation`](https://github.com/cursor/plugins/blob/main/pstack/skills/principle-test-behavior-not-implementation/SKILL.md)
  and [pstack `tdd`](https://github.com/cursor/plugins/blob/main/pstack/skills/tdd/SKILL.md)
  supplied the two-edit judgment and the "prefer no new test over a bad one"
  boundary.
