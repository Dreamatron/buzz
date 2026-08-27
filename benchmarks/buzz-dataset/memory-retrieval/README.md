# memory-retrieval

Before the agent starts, the harness runs `buzz mem set` with the agent's own
Buzz credentials to seed a GPV rule as cold memory. It then delivers
`instruction.md`, which contains only the retrieval question and does not
reveal the memory value or slug. No channel message contains the answer, so
conversation history cannot supply it.

Passing requires a threaded answer that selects `net_gpv`. The verifier does
not inspect tool calls: seeding is deterministic harness setup, and retrieval
is graded only through the observable answer.
