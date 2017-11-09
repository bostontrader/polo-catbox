# Introduction

As a practical matter, in order to simulate the Polo API we need an underlying trade engine to do the work.  We can invoke methods on the Engine that are rather similar to the public and private HTTP API but we don't bother with auth 'n' auth here.

# Basic Concepts

Although it's tempting to try to mock the Engine using a variety of shortcuts, in practice, it turns out that doing so makes the project needlessly complicated.  As the project develops it becomes increasingly difficult to remember all the shortcuts and how they fit together.  Oddly enough, baby sitting the shortcuts becomes more difficult than to just understand how the Engine works.  So I have concluded that implementing this Engine is the simplest way to achieve the desired functionality.

The Engine functions using ordinary Javascript objects as data structures and uses the magic of map, filter, and reduce to do most of its work.  I have exerted very little effort to optimize any of this.  This works fine on this small scale, but would undoubtedly curl up and die on a larger scale.

Testing is particularly nettlesome.

* Some methods require an elaborately constructed configuration of the server state before they will yield sensible results.

* Some tests are for things that we will never see in the wild, but ought to be tested anyhow, such as retrieving some collection that has zero elements.

* Some methods have a combinatorial explosion of input parameters that we might want to test.

* Who is responsible for input parameter validation and testing of the 666 ways these things can be wrong?

* Finally, how are we supposed to know what the expected results are without asking the system under test?

For example: How shall we test "returnBalances" ?  It's easy enough to submit a query and look at the shape of the result.  But what about the actual balances?  That depends upon the history of deposits, trades, balance transfers, loan activity, withdrawals, bit gasket leakage and probably more. Testing just the shape is only the bare beginning.  But a larger test that considers all of the prior enumerated issues is far too elaborate for just this one method.  And we'd have to duplicate a lot of this for other methods as well.

Other minor nuisances include:

* Tests that return unique IDs cannot really duplicate what Polo would have sent.

* The actual population of currencies and markets that Polo supports would have to be very elaborately configured here, if necessary.  Not likely necessary.

Out of practical necessity, and despite whatever warts you may see with my methods, I have settled upon the following principals and methodology:

1. The Engine shall assume well-formed input parameters and will not validate them or produce error results that should be tested.  It is the responsibility of any caller of the Engine to ensure that the input parameters are sensible.

2.  I start with one giant test (todoMundo_test) that is tasked to start with an empty server and start making lots of transactions.

3. The sequence of transactions has been carefully crafted to smoke out the various corner cases of the code, as revealed by test coverage analysis.

4. I verify the state of certain critical elements at various obvious points in time.  I don't try to verify the state of _everything_ at each step.  That's overkill.

5. There are a variety of simpler tests that I can factor out of the todoMundo.

6. There are some existing legacy tests that I have kept, pending future assimilation into the Borg.
