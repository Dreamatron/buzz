# memory-retrieval

Before the agent starts, the harness runs `buzz mem set` with the agent's own
Buzz credentials to seed a revenue convention as cold memory. It then delivers
`instruction.md`, which contains only the retrieval question and does not
reveal the memory value or slug. No channel message contains the answer, so
conversation history cannot supply it.

Full credit requires an affirmative `use net_gpv_var_usd` in the threaded
answer; a non-rejecting mention of `net_gpv_var_usd` receives half credit.
Negated or contradictory selections receive no credit. The verifier does not
inspect tool calls: seeding is deterministic harness setup, and retrieval is
graded only through the observable answer.
