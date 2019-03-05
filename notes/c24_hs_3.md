# CSCC24: Haskell

## Interlude: Nested lambdas and nested function applications

Lambda = anonymous function = how do you write a function without giving it a name?

| Language   | Syntax                         |
|------------|--------------------------------|
| Python     | `lambda x : x+1`               |
| Javascript | `function (x) { return x+1; }` |
| Haskell    | `\x -> x+1`                    |

`\` was chosen because it looks like the Greek letter lambda: `λ`.

Next, if you intend 2 parameters, the Haskell community culture is to model it as a nested function: `\x -> (\y -> 2*x - 3*y)` (those parentheses can be omitted) - a function that maps the 1st parameter to a function that takes the 2nd parameter.

Shorthand: `\x y -> 2*x - 3*y`

```hs
f x y = ...
```

can be written as

```hs
f = \x y -> ...
```

or even

```hs
f x = \y -> ...
```

What about applying a function to 2 parameters:

```hs
f foo bar
````

is shorthand for

```hs
(f foo) bar
```

It is possible use `f foo` alone, under the right circumstance.

Type-wise:

```hs
X -> Y -> A
```

is shorthand for

```hs
X -> (Y -> A)
```

Example: The standard library has a function `map` for this:

```hs
map f [1, 2, 3] = [f 1, f 2, f 3]
```

It is possible to use `map f` alone:

```hs
map (map f) [[1,2,3], [4,5,6]]
= [map f [1,2,3], map f [4,5,6]]
= [[f 1, f 2, f 3], [f 4, f 5, f 6]]
```

Try these:

```hs
map (\x -> 10*x+8) [1,2,3]
map (map (\x -> 10*x+5)) [[1,2,3], [4,5,6]]
```

## foldr

One way to sum or multiply a list. This code is not for real use (the standard library already has `sum` and `product`), but to make a bigger point.

```hs
mySumV1 [] = 0
mySumV1 (x:xs) = x + mySumV1 xs
myProductV1 [] = 1
myProductV1 (x:xs) = x * myProductV1 xs
```

What if you want to use yet another binary operator?  Do we keep writing the same code again? Surely there is something to refactor out. One more example (less obvious):

This function is also already in the standard library, under the name `map`. We write it again to make a bigger point.
E.g., `myMap f [1, 2, 3] = [f 1, f 2, f 3]`

```hs
myMap f [] = []
myMap f (x:xs) = f x : myMap f xs
```

Or:

```hs
myMap f lst = g lst
  where
    g [] = []
    g (x:xs) = f x : g xs
```

The common theme is a function that looks like

```hs
g [] = z
g (x:xs) = a function of x and g xs

g = mySumV1:
    z = 0
    function: x + g xs -- the function is (+)

g = myProductV1:
    z = 1
    function: x * g xs -- the function is (*)

g = myMap f:
    z = []
    function: f x : g xs
            = (\x r -> f x : r) x (g xs) -- the function is \x r -> f x : r
```

All these are refactored to:

```hs
myFoldr op z lst = g lst
    where
    g [] = z
    g (x:xs) = op x (g xs)
```

The standard library has `foldr` for this.

More commonly we expand `g` back to `myFoldr op z`:

```hs
myFoldr :: (a -> b -> b) -> b -> [a] -> b
myFoldr op z [] = z
myFoldr op z (x:xs) = op x (myFoldr op z xs)
```

So here are `mySumV1`, `myProductV1`, `myMap` re-expressed as `foldr`'s:

```hs
mySumFoldr xs = foldr (+) 0 xs
myProductFoldr xs = foldr (*) 1 xs
myMapFoldr f xs = foldr (\x r -> f x : r) [] xs
```

The above shows one way to detect that you can use `foldr`.  Below is another way using pretend induction to solve for `op` and `z` and get a complete proof! From

[Mastering foldr - ertes.eu](https://web.archive.org/web/20180522053624/http://www.ertes.eu/tutorial/foldr.html)

(Unfortunately the author died May 12, 2018. I knew him from IRC.)

I'll show working on `myMap`. Prove

```hs
myMap f lst = foldr op z lst
```

by pretend induction and find `op` and `z`.

```latex
Base case: lst = []

LHS = myMap f [] = []
RHS = foldr op z [] = z

Define z = [], then

LHS = [] = RHS

Induction step: lst has the form x:xs.

Induction hypothesis:

myMap f xs = foldr op [] xs

WTP: myMap f (x:xs) = foldr op [] (x:xs)

LHS
= f x : myMap f xs         by myMap code

RHS
= op x (foldr op [] xs)    by foldr code
= op x (myMap f xs)        by IH

Need op to do: op x (myMap f xs) = f x : myMap f xs

IMPORTANT TRICK: Generalize from myMap f x to arbitrary r.

Need op to do: op x r = f x : r

Define op to do just that!  Or use (\x r -> f x : r) directly.

Then LHS = RHS by definition of op.
```

Advice: DO NOT THINK. DO NOT USE INTUITION. NEVER WORKED FOR PAST STUDENTS.

Instead, look for the common theme or do the pretend induction.

## foldl

Another version of summing a list. This version is closer to the for-loop-and-accumulator you normally write.

The trick is to conjure a helper function with this more general specification:

`for all a, for all lst: g a lst = a + sum of lst`

```hs
mySumV2 xs = g 0 xs
  where
    g accum [] = accum
    {-
        Induction step: The list is x:xs
        Induction hypothesis: for all a: g a xs = a + sum of xs

        How to compute accum + sum of (x:xs)?

        accum + sum of (x:xs)
        = accum + x + sum of xs
        = (accum + x) + sum of xs
        = g (accum + x) xs           by IH
    -}
    g accum (x:xs) = g (accum + x) xs
```

Reverse a list. The standard library already has it, but again I'm writing my own for a purpose.

First, this is too slow. Why? (How much time does `++` take?)

```hs
slowReverse [] = []
slowReverse (x:xs) = slowReverse xs ++ [x]
```

(Answer: `++` takes linear time, `slowReverse` takes quadratic time.)

The trick is to conjure a helper function with this specification:

`for all a, for all lst: g a lst = (reversal of lst) ++ a`

You can also think of using an accumulator for the reversal of a prefix of the input list.

```hs
myReverse xs = g [] xs
  where
    g accum [] = accum
    {-
        Induction step: The list is x:xs
        IH: for all a: g a xs = (reversal of xs) ++ a

        How to compute (reversal of (x:xs)) ++ accum ?

        (reversal of (x:xs)) ++ accum
        = (reversal of xs) ++ [x] ++ accum
        = (reversal of xs) ++ ([x] ++ accum)
        = g ([x] ++ accum) xs                    by IH
        = g (x : accum) xs
    -}
    g accum (x:xs) = g (x : accum) xs
```

Common theme: a function `g` that looks like

```hs
g accum [] = accum
g accum (x:xs) = g (a function of accum and x) xs
```

`mySumV2`:

* initial accum: `0`
* function: `(+)`

`myReverse`:

* initial accum: `[]`
* function: `(\a x -> x : a) = flip (:)`

This is abstracted into:

```hs
myFoldl op z xs = g z xs
  where
    g accum [] = accum
    g accum (x:xs) = g (op accum x) xs
```

The standard library has `foldl` for this.

More commonly we expand `g` back to `foldl op`:

```hs
myFoldl op z [] = z
myFoldl op z (x:xs) = myFoldl op (op z x) xs

mySumFoldl xs = myFoldl (+) 0 xs

myReverseFoldl xs = myFoldl (flip (:)) [] xs
```

Can you use pretend induction to solve for `op` and `z`? I tried, didn't help.

What happens here is that the biggest hurdle is conjuring the helper function `g` that takes an extra accumulator parameter. (Or perhaps the biggest hurdle is just deciding that you want this helper function.) Once you have that, `z` and `op` are easy to identify.
