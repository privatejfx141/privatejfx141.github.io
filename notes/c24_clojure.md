# CSCC24: Clojure Clash Course

## Syntax

Like Lisp and Scheme, syntax is in prefix notation with parentheses to specify beginnings and ends.

```clojure
(what-to-do operand1 operand2 ...)

(what-to-do)      if no operand at all

var               if you want the value of a variable; no parentheses
literal           e.g., 5, "hello", true
```

```clojure
x>0                            (> x 0)

2-x*3                          (- 2 (* x 3))

if x>0                         (if (> x 0)
  then 2-x*3                       (- 2 (* x 3))
  else 4*y                         (* 4 y))

\x y -> if x>0                 (fn [x y] (if (> x 0)
          then 2-x*3                         (- 2 (* x 3))
          else 4*x                           (* 4 y)))

                               #(if (> %1 0)
                                    (- 2 (* %1 3))
                                    (* 4 %2))

f x y = if x>0                 (defn f [x y]
          then 2-x*3             (if (> x 0)
          else 4*x                   (- 2 (* x 3))
                                     (* 4 x)))

four = 2+2                     (def four (+ 2 2))

f 5 6                          (f 5 6)
                               Note: Can't have (f 5).

let x=5                        (let [x 5 y 1]
    y=6                          (+ x x y))
in x+x+y                       Note: On the upside, varargs supported!

[1, 2, 3]                      '(1 2 3)
                               Note: (1 2 3) would mean that 1 is what to do.

1 : 2 : 3 : []                 (cons 1 (cons 2 (cons 3 () )))
```

## Homoiconic

(Added after the guest talk.)

Notice how list syntax is almost the same as code syntax.  In fact there is an
`eval` function to take a list and run it as code, e.g.:

`'(+ 3 5)` is a list, but then you can do

```clojure
   (eval '(+ 3 5))
-> (+ 3 5)
-> 8
```

"Homoiconic" refers to having the same format for both code and data (lists here). You can now build a list (that will become code later), store it somewhere, then later retrieve it and run it.

## Semantics

Also like Lisp and Scheme.

Typing: Dynamic typing.

```clojure
(if (> 1 0) "hello" 4)
```

is legal.

```clojure
'(1 "hello" true)
```

is legal.

Evaluation: Like most languages, not lazy.

```clojure
(f (g 1 2) (h 3 4))
```

`(g 1 2)` and `(h 3 4)` evaluated until values known before calling `f`. (If `f` is a function, not `if`, `let`, etc.)

However, a lazy list type called `sequence` is provided.

There is also a macro system for defining your own constructs.

## Thread-safe mutable variables

Most standard library types and data structures are immutable.

However, a mutable cell type `ref` is provided, and is also sharable across
multiple threads.

Create a `ref` with initial value `10`:

```clojure
(def mycell (ref 10))
```

Imagine a mutable pointer that you can change what it points to; but still point it to immutable data.

Read:

```clojure
(deref mycell)

@mycell
```

Before I talk about write, I need to talk about why these refs are thread-safe. They are actually "software transactional memory". Google for it, but TL;DR: You can only modify them in a transaction, but each transaction is free of race conditions with other transactions. (Haskell also has this.) Like transactions in databases but with automatic rollback and retry if conflict.

Transaction:

```clojure
(dosync
    action1
    action2
    ...    )
```

Write:

```clojure
(ref-set mycell 5)
```

Read-write at once:

```clojure
(alter mycell f arg2 arg3 ...)
```

this changes mycell to (`f old-mycell-value arg2 arg3 ...`), and returns the new value.

Examples:

```clojure
(dosync
    (ref-set mycell (+ @mycell 2)))

(dosync
    (ref-set mycell (* @mycell 10)))
```

could also use `alter`

Suppose `mycell` is initially `4` and then these two examples are run by two threads concurrently. The final value of `mycell` is either `(4*2)+10 or (4*10)+2`. There won't be race conditions.

Really interesting and important if one transaction works on multiple `ref`s.
