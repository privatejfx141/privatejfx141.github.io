# CSCC24: Haskell

## Lazy evaluation

Let me mess with you first.

`take` is in the standard library defined like this:

```hs
take 0 _ = []
take _ [] = []
take n (x:xs) = x : take (n-1) xs
```

IOW the first `n` items of the input list, or as many as available, e.g.,

```hs
take 3 [a,b,c,d,e] = [a,b,c]
take 3 [a,b] = [a,b]
```

So does the following terminate?

```hs
doITerminate = take 2 (foo 0)
  where
    foo n = n : foo (n + 1)
```

And this?

```hs
doIEvenMakeSense = take 2 foo
  where
    foo = 0 : foo
    -- In the computer this is one cons cell pointing back to itself. O(1)-space.
```

Lazy evaluation.

Recall eager evaluation in Racket (and everything else basically):

* To evaluate `(f foo bar)`: evaluate `foo` and `bar` first, then substitute into `f`'s body.

Lazy evaluation in Haskell (sketch):

* To evaluate `f foo bar`: Plug into `f`'s body first, then evaluate that body.

If that runs you into pattern matching (because either `f (x:xs) = ...` or `case ... of ...`): evaluate parameter(s) just enough to decide whether it's a match or non-match. If match, evaluate that branch. If non-match, try the next pattern. (If run out of patterns, declare `undefined` aka `error`.)

To evaluate arithmetic operations e.g. `foo + bar`: eager evaluation.

Evaluation of `doITerminate` (until the answer is fully printed - the REPL wants this):

```hs
  take 2 (foo 0)
→ take 2 (0 : foo (0 + 1))
→ 0 : take (2-1) (foo (0 + 1))
→ 0 : take 1 (foo (0 + 1))
→ 0 : take 1 (n : foo (n + 1))          with n = 0 + 1
→ 0 : n : take (1-1) (foo (n + 1))
→ 0 : n : take (1-1) (foo (n + 1))      with n = 1
→ 0 : n : take 0 (foo (n + 1))          with n = 1
→ 0 : n : []                            with n = 1
```

Very drastic example:

The standard library has

```hs
const x y = x
```

Evaluation of `const (3+4) (div 1 0)`:

```hs
  const (3+4) (div 1 0)
→ 3+4
→ 7
```

(No error about dividing by zero.)

Newton's method with lazy lists. Like in Hughes's "why FP matters".
Approximately solve `x^3 - b = 0`, i.e., cube root of `b`.

So `f(x) = x^3 - b, f'(x) = 3x^2`

```hs
x1 = x - f(x)/f'(x)
   = x - (x^3 - b)/(3x^2)
   = x - (x - b/x^2)/3
   = (2x + b/x^2)/3
```

The local function `next` below is responsible for computing `x1` from `x`.

```hs
cubeRoot b = within 0.001 (iterate next b)
    -- From the standard library:
    -- iterate f z = z : iterate f (f z)
    --             = [z, f z, f (f z), f (f (f z)), ...]
  where
    next x = (2*x + b/x^2) / 3
    within eps (x : (x1 : rest))
        -- Some parethenses optional.
        -- Maybe show off @-pattern here.
        | abs (x - x1) <= eps = x1
        | otherwise = within eps (x1 : rest)
```

Equivalently

```hs
cubeRoot = within 0.001 . iterate next
```

Function composition `(.)` is defined by

```hs
(f . g) x = f (g x)
```

With this, you really have a pipeline as in Unix pipelines.

Singly-linked list is a very space-consuming data structure (all languages). And if you ask for "the ith item" you're doing it wrong.

However, if you use list lazily in Haskell, it is an excellent *control* structure - a better for-loop than for-loops. Then list-processing functions become pipeline stages. If you do it carefully, it is even O(1)-space. If furthermore you're lucky (if the compiler can optimize your code), it can even fit entirely in registers without memory allocation overhead.

Thinking in high-level pipeline stages is both more sane and more efficient - with the right languages.

Some very notable list functions when you use lists lazily as for-loops, or when you think in terms of pipeline stages:

* Producers: `repeat`, `cycle`, `replicate`, `iterate`, `unfoldr`, the `[x..]`, `[x..y]` notation (backed by `enumFrom`, `enumFromTo`)
* Transducers: `map`, `filter`, `scanl`, `scanr`, (`foldr` too, sometimes), `take`, `drop`, `splitAt`, `takeWhile`, `dropWhile`, `span`, `break`, `partition`, `zip`, `zipWith`, `unzip`
* Consumers: `foldr`, `foldl`, `foldl`', `sum`, `product`, `maximum`, `minimum`, `and`, `all`, `or`, `any`, ...

Sometimes you have to custom-make your own, of course.

And don't forget that list comprehension helps a lot too.

## When lazy evaluation hurts

Evaluation of `mySumV2 [1,2,3]` (similarly `foldl (+) 0 [1,2,3]`):

```hs
  mySumV2 (1 : 2 : 3 : [])
→ g 0 (1 : 2 : 3 : [])
→ g (0 + 1) (2 : 3 : [])
→ g ((0 + 1) + 2) (3 : [])
→ g (((0 + 1) + 2) + 3) []
→ ((0 + 1) + 2) + 3
→ (1 + 2) + 3
→ 3 + 3
→ 6
```

This takes Ω(n) space for the postponed arithmetic.

Exercise: Go through the evaluation of `mySumV1 [1,2,3]` or `foldr (+) 0 [1,2,3]` to see how it also takes Ω(n) space, though through a different journey.

Summing a list does not need lazy evaluation for the accumulator. There is `seq` for killing lazy evaluation when you deem it unsuitable.

To evaluate `seq x y`: evaluate `x` to "weak head normal form", then continue with `y`.

Weak head normal form (WHNF) means:

* for built-in number types: until you have the number
* for algebraic data types: until you have a data constructor
* for functions: until you have a lambda

```hs
mySumV3 xs = g 0 xs
  where
    g accum [] = accum
    g accum (x:xs) = seq accum (g (accum + x) xs)

    -- Alternative:

    g accum (x:xs) = let a1 = accum + x
                     in seq a1 (g a1 xs)

    -- But not:

    g accum (x:xs) = seq (accum + x) (g (accum + x) xs)

    -- Because the two copies of accum+x are independent. Evaluating one of them does no good to the other.
```

`Data.List` has `foldl'` for this as well:

```hs
foldl' f z [] = z
foldl' f z (x:xs) = seq z (foldl' f (f z x) xs)
```
