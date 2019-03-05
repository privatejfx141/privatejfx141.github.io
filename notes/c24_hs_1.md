# CSCC24: Haskell

## Local Definition Constructs

```hs
diffSq x y = (x - y) * (x + y)
```

```hs
diffSqV3a x y =
    let minus = x - y
        plus = x + y
    in minus * plus
```

```hs
diffSqV3b x y = minus * plus
  where
    minus = x - y
    plus = x + y
```

The difference:

* `let-in` is an expression.
* `where` is not part of an expression; it is part of a definition.
  `x where x=5` does not make sense; `y = ... where x=5` does.

## Basic example of pattern matching and recursion

```hs
slowFactorial 0 = 1
slowFactorial n = n * slowFactorial (n - 1)
```

Long form:

```hs
slowFactorial x = case x of
    0 -> 1
    n -> n * slowFactorial (n - 1)
```

Can you use if-then-else? Yes:

```hs
slowFactorial n = if n==0 then 1 else n * slowFactorial (n-1)
```

But usually pattern matching is better. (Not always.)

## Synthesis view (how to write code) vs evaluation view (how to run code)

Everyone teaches how to run recursive code. That still doesn't help you with
writing. (Probably impedes you actually - hand-running recursive code is
distracting.)

I teach you both. I show you that writing recursive code can be easier if you
don't try to run it.

Synthesis view (how I write recursive code): Pretend induction. (Use induction
to prove something that still contains unknowns, ah but during the proof you
find out how to solve for the unknowns!)

WTP: For all natural `n`: `slowFactorial n = n!`

### Base case

WTP: `slowFactorial 0 = 0!`

Notice `0! = 1`, so if I code up

```hs
slowFactorial 0 = 1
```

I get `slowFactorial 0 = 0!`

### Induction step

Let natural `n ≥ 1` be given.
Induction hypothesis: `slowFactorial (n-1) = (n-1)!`
WTP: `slowFactorial n = n!`

Notice `n! = n*(n-1)! = n * slowFactorial (n-1)` by I.H.
So if I code up

```hs
slowFactorial n = n * slowFactorial (n-1)
```

I get `slowFactorial n = n!`

### Comments

* The proof structure guides the code structure.
* I refuse to imagine "what if I unfold `slowFactorial (n-1)` by hand?". The I.H. already tells me the answer so I just use it. This helps my focus.
* The catch: I need to make up my mind and carefully write down the specification - what answer my function should give. I need the I.H. to be clear, not muddy.
* You get both code and correctness proof. Buy 1 get 1 free. Why don't people do this more?!

Evaluation view (how a computer or an enslaved student runs code): Plug and chug:

```hs
  slowFactorial 3
→ 3 * slowFactorial (3 - 1)
→ 3 * slowFactorial 2
→ 3 * (2 * slowFactorial (2 - 1))
→ 3 * (2 * slowFactorial 1)
→ 3 * (2 * (1 * slowFactorial (1 - 1)))
→ 3 * (2 * (1 * slowFactorial 0))
→ 3 * (2 * (1 * 1))
→ 3 * (2 * 1)
→ 3 * 2
→ 6
```

Slow Fibonacci (yawn) to show you can have more patterns.

```hs
slowFib 0 = 0
slowFib 1 = 1
slowFib n = slowFib (n-1) + slowFib (n-2)
```
