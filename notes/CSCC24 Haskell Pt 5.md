# CSCC24: Haskell

## Type classes - operator overloading

How Haskell overloads `==,` `<`, `+` for various types, and how you can extend them to
your own types, and how you can declare your own overloadable operations:

A "type class" declares a group of overloaded operations ("methods").

Take `==` and `/=` for example.  The type class is `Eq` from the standard library:

```hs
class Eq a where
    (==), (/=) :: a -> a -> Bool

    -- Optional: default implementation for (==).
    x == y = not (x /= y)

    -- Optional: default implementation for (/=).
    x /= y = not (x == y)
```

To implement these methods for a type, e.g., the standard library has this for `Bool`:

```hs
instance Eq Bool where
    False == False    = True
    True == True      = True
    _ == _            = False
```

We say "`Bool` is an instance of `Eq`".

WARNING:

* A class is not a type. `Eq` is not a type. These are nonsense:

```hs
foo :: Eq -> Eq -> Bool
bar :: Eq a -> Eq a -> Bool
```

* A type is not a "subclass". `Bool` is not a "subclass" of `Eq`.

If you write a polymorphic function that uses a method, then its type will carry the corresponding class names to mark the fact that your function is only good for instances of the classes.  (This also happens to the types of the methods themselves.)

```hs
eq3 x y z = x==y && y == z
eq3 :: Eq a => a -> a -> a -> Bool
-- NOT a -> a -> a -> Bool
```

Recall we defined our own types:

```hs
data MyIntegerList = INil | ICons Integer MyIntegerList
data MyList a = Nil | Cons a (MyList a)
```

Let's make them instances of `Eq` so we can use `==` on them too:

```hs
instance Eq MyIntegerList where
    INil == INil              = True
    ICons x xs == ICons y ys  = x==y && xs==ys
    _ == _                    = False

instance Eq a => Eq (MyList a) where
    Nil == Nil                = True
    Cons x xs == Cons y ys    = x==y && xs==ys
    -- "x==y" is when we need to assume Eq a.
    _ == _                    = False
```

Check out these other type classes: `Ord`, `Bounded`, `Enum` (its methods are behind the `[1..n]` notation), `Show`, `Read`.

Reference: [6.3 Standard Haskell Classes](https://www.haskell.org/onlinereport/haskell2010/haskellch6.html#x13-1270006.3)

Often it is straightforward but boring to write instances for these classes, so the computer offers to auto-gen for you. Restrictions apply. You request it at the definition of your algebraic data type like this:

```hs
data MyType = ... deriving (Eq, Ord, Bounded, Enum, Show, Read)
```

For example the computer would write the same `==` algorithms above for `MyIntegerList` and `MyList`.

Reference: [Specification of Derived Instances](https://www.haskell.org/onlinereport/haskell2010/haskellch11.html#x18-18200011)

## Number types

Haskell has `Int`, `Integer`, `Rational`, `Float` (single-precision floating point), `Double` (double-precision floating point), `Complex a` (`a` is `Double` or `Float` usually).

Number operations are grouped into several type classes, e.g.,

`Num`:

* some methods: `+`, `-`, `*`, `abs`
* instances: all number types

`Integral`:

* some methods: `div`, `mod`
* instances: `Int`, `Integer`

`Fractional`:

* some methods: `/`, `recip`
* instances: `Rational`, `Float`, `Double`, `Complex a`

You can add your own number type by making it an instance of the relevant classes. (E.g., you could have written your own `Rational` and `Complex`.)

Reference: [Numbers](https://www.haskell.org/onlinereport/haskell2010/haskellch6.html#x13-1350006.4)

Exercise: Why is this a type error?

```hs
let xs :: [Double]
    xs = [1, 2, 3]
in sum xs / length xs
```

Answer:

```hs
sum xs :: Double
length xs :: Int
```

`(/)` wants the two operands to be of the same type.

How to fix: `sum xs / fromIntegral (length xs)`

Example: Machine epsilon.

[Andrew Barfield](https://gist.github.com/AndrewBarfield/2557034) is forced to write two copies of the same code for two number types because C# is a stupid language.

This is *criminal* in this the 21st Century.

(But see [mosheroperandi](https://twitter.com/mosheroperandi/status/856946180810354688) for even worse!)

A passable language allows you to hand in just one copy:

```hs
epsilon :: (Ord a, Fractional a) => a
epsilon = last notTooSmall
  where
    halves = iterate (/ 2) 1
    notTooSmall = takeWhile (\e -> 1 + e > 1) halves

epsilonDouble :: Double
epsilonDouble = epsilon

epsilonFloat :: Float
epsilonFloat = epsilon
```
