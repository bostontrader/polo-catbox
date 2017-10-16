# Introduction

This is the simulated trade engine.  We can invoke methods on it that are rather similar to the public and private HTTP API but we don't bother with auth 'n' auth here.

# Basic Concepts

The Engine functions using ordinary Javascript objects as data structures and uses the magic of map, filter, and reduce to do most of its job.  I have exerted very little effort to optimize any of this.  This works fine on this small scale, but would probably not work well on a larger scale.

Testing is particularly tedious.  There's nothing to unit test here so I don't do that. Despite the warts with my methods I have settled upon the following principals and methodology:

1. Each test focuses on some specific issue.  Usually a particular method.  In the test we start with an empty server and then use methods on the Engine to pump in changes until we get to the state that we want.  We then invoke the method that we are testing and compare to expected results.  Repeat until finished with the test.

2. The tests use a lot of object constants.  These constants are used to set the initial state and to later compare to results.  I have carefully and manually created these constants so that the tests pass and that the various edge cases are covered.  If any constant changes, there are likely to be tedious and obscure consequences with other constants, so be careful.

3. The Engine and tests have a fair amount of things that could be factored out.  For example, there is a lot of redundant testing and the constants have lots of similarity.  Although tempting to do so, I encourage you to resist the urge and don't do it.  You will likely optimize too far into the zone of incomprehensible abstraction.  Just bite the bullet and tolerate the prior enumerated woes.
