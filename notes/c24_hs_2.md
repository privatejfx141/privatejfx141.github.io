# CSCC24: Haskell

## User-defined types: Algebraic data types

### First cut: Real enumerations (C has fake enumerations)

```hs
data Direction = North | East | South | West
    deriving (Eq, Show)  -- To enable equality and printing. More on this later.
```

The name of the type is `Direction`.

The possible values of that type are `North`, `East`, `South`, `West`. In other words:

```hs
North :: Direction
East :: Direction
South :: Direction
West :: Direction
(Nothing else.)
```

`North`, `East`, `South`, `West` are also the "data constructors" of that type. If you think "tags", you're right, I think that too.

All 5 names are your choice. Only requirement: capitalized.

WARNING: NOT OOP constructors. You are only choosing a name for a tag, you are not writing arbitrary initialization code.

WARNING: NOT OOP subclasses/subtypes either. `North` is not a type, it's a value.

Similarly, the standard library defines `Bool` by

```hs
data Bool = False | True
```

Real enumeration because you can't mix up `False` and `North`. (Contrast with C.)
Everything is not an integer.

Data constructors can be used in patterns. Fundamental way of consuming and discerning parameters of an algebraic data type.

```hs
bearing :: Direction -> Integer
bearing North = 0
bearing East = 90
bearing South = 180
bearing West = 270
```

Inverse of the above, but has to be a partial function

```hs
direction :: Integer -> Direction
direction 0 = North
direction 90 = East
direction 180 = South
direction 270 = West
direction _ = error "unsupported bearing"
```

### Second cut: But each data constructor can have fields

Imagine a feudal country Tetrastrata with four kinds of persons:

* The monarch. 'Nuf said (specified by 0 fields).
* Lords. Each specified by 3 fields:
  * title (string), e.g., "Duke", "Earl"
  * territory (string), e.g., "Sussex"
  * succession number (integer), e.g., the 9th Duke of Sussex has 9 here
* Knights. Each specified by 1 field: name (a string)
* Peasants. Each specified by 1 field: name (a string)

They can be represented as:

```hs
data Tetrastratan
    = Monarch
    | Lord String String Integer
    | Knight String
    | Peasant String
    deriving (Eq, Show)
```

The type name is `Tetrastratan`.

The possible values are:

* `Monarch`
* `Lord d t i`, provided `d::String`, `t::String`, `i::Integer`
* `Knight n`, provided `n::String`
* `Peasant n`, provided `n::String`
* (Nothing else)

The data constructors (tags) are: `Monarch`, `Lord`, `Knight`, `Peasant`.

Mathematically, `Tetrastratan` is a tagged disjoint union:

```latex
(singleton set) ⊎ String×String×Integer ⊎ String ⊎ String
```

analogous to a sum of products - polynomial - "algebraic".

```hs
ninthDukeOfSussex = Lord "Duke" "Sussex" 9
```

How to address a Tetrastratan:

```hs
addressTetra Monarch = "H.M. The Monarch"
addressTetra (Lord d t i) = "The " ++ show i ++ "th " ++ d ++ " of " ++ t
addressTetra (Knight n) = "Sir " ++ n
addressTetra (Peasant n) = n
```

Social order:

```hs
superior Monarch (Lord _ _ _) = True
superior Monarch (Knight _) = True
superior Monarch (Peasant _) = True
superior (Lord _ _ _) (Knight _) = True
superior (Lord _ _ _) (Peasant _) = True
superior (Knight _) (Peasant _) = True
superior _ _ = False
```

Exercise: String for lord titles is too broad. Replace by an enumeration type. Everything is not a string.

Design guide: Design your data type to avoid invalid data in the first place. This reduces bugs. Not always possible, and when possible not always worthwhile, but you strive to. Disallow invalid data unless you can justify why it is not worthwhile. Read this from Scala practitioners:

[The abject failure of weak typing](http://rea.tech/the-abject-failure-of-weak-typing/))

### Third cut: Recursion (self, mutual) is also supported

[Singly linked] list of integers.

```hs
data MyIntegerList = INil | ICons Integer MyIntegerList
    deriving Show

-- I will hand-code the Eq part later.

exampleMyIntegerList = ICons 4 (ICons (-10) INil)

myISum :: MyIntegerList -> Integer
myISum INil = 0
myISum (ICons x xs) = x + myISum xs
```

Binary [search] tree of integers.

```hs
data IntegerBST = IEmpty | INode IntegerBST Integer IntegerBST
    deriving Show

exampleIntegerBST = INode (INode IEmpty 3 IEmpty) 7 (INode IEmpty 10 IEmpty)
```

BST insert. Since this is functional programming with immutable trees, `insert` means produce a new tree that is like the input tree but with the new key. Maybe better to say "the tree plus k".

```hs
ibstInsert :: Integer -> IntegerBST -> IntegerBST
ibstInsert k IEmpty =
    -- Base case: empty tree plus k = singleton tree with k
    INode IEmpty k IEmpty

ibstInsert k inp@(INode left key right) -- "as-pattern", "inp as (Node left key right)"
    -- Induction step: The input tree has the form INode left key right.
    -- Induction hypothesis (strong induction):
    --   If t is a smaller tree than the input tree, e.g., t=left or t=right,
    --   then ibstInsert k t computes t plus k.
    -- Can you use this to help compute input tree plus k?

    -- If k<key, the correct answer is a node consisting of:
    -- new left child = left plus k = ibstInsert k left (by IH)
    -- new key = key
    -- new right child = right

    | k < key = INode (ibstInsert k left) key right

    -- If k>key, mirror image of the above.

    | k > key = INode left key (ibstInsert k right)

    -- If k==key, nothing new to compute, the correct answer is the input tree.
    | otherwise = inp

    -- Also rewrite to use compare k key
```

### Fourth cut: Parametric polymorphism (aka Java generics)

Binary [search] tree of arbitrary key type.

```hs
data BST a = Empty | Node (BST a) a (BST a)
    deriving Show

exampleBSTChar :: BST Char
exampleBSTChar = Node (Node Empty 'c' Empty) 'g' (Node Empty 'j' Empty)

bstInsert :: Ord a => a -> BST a -> BST a
-- "Ord a =>" to be explained later. For now it means the code can do <, <= comparison.
bstInsert k Empty = Node Empty k Empty
-- The commented-out version shows guard syntax.
-- bstInsert k inp@(Node left key right)
--     | k < key = Node (bstInsert k left) key right
--     | k > key = Node left key (bstInsert k right)
--     | otherwise = inp
bstInsert k inp@(Node left key right)   -- "as-pattern", "inp as (Node left key right)"
    = case compare k key of
        LT -> Node (bstInsert k left) key right
        GT -> Node left key (bstInsert k right)
        EQ -> inp
```

Exercise: Rewrite `BST` and `bstInsert` for dictionary, not just set. I.e., not just key, but also value. Start like this:

```hs
data BST k v = Empty | Node ...
```

My list type of arbitrary element type. (Just for teaching purpose. The standard library has a list type like this already; read on.)

```hs
data MyList a = Nil | Cons a (MyList a)
    deriving Show

exampleMyListI :: MyList Integer
exampleMyListI = Cons 4 (Cons (-10) Nil)

exampleMyListS :: MyList String
exampleMyListS = Cons "albert" (Cons "bart" Nil)
```

Homogeneous list - can't have different item types in the same list, e.g.,

```hs
Cons "albert" (Cons True Nil)
```

is illegal. Because what would be its type, `MyList String`? `MyList Bool`?

But look up `Either` and have:

```hs
Cons (Left "albert") (Cons (Right True) Nil) :: MyList (Either String Bool)
```

Similarly for the `BST` type above.

Standard library list syntax:

* Type: `[a]`, `[] a`
* Empty list: `[]`
* Cons: `x : xs`
* Nice notation: `[a, b, c] = a : (b : (c : [])) = a : b : c : []`
* List comprehension also available.

```hs
{-
    Insertion sort.
    Strategy: Have a helper function "insert":
    Take an element x and a list lst. lst is assumed to have been sorted.
    Put x into the right place in lst so the whole is still sorted.
    E.g., insert 4 [1,3,5,8,9,10] = [1,3,4,5,8,9,10]
    (Or rather, produce a new list that's like lst but also with x at the right place.)
-}

-- Structural induction on lst.
-- Base case: lst is empty. Answer is [x].
insert x [] = [x]
-- Induction step: Suppose lst has the form hd:tl (and tl is shorter than lst).
-- E.g., lst = [1,3,5,8], hd = 1, tl = [3,5,8].
-- Induction hypothesis: insert x tl = put x into the right place in tl.
insert x lst@(hd:tl)
    -- If x <= hd, then x should be put before hd, in fact all of lst, and be done.
    -- E.g., insert 1 (10 : tl) = 1 : (10 : tl)

    | x <= hd = x : lst

    -- Otherwise, the answer should go like:
    -- hd, followed by whatever is putting x into the right place in tl.
    -- i.e.,
    -- hd, followed by insert x tl (because IH)
    -- E.g., insert 25 (10:tl) = 10 : insert 25 tl

    | otherwise = hd : insert x tl
```

The main insertion sort function. Exercise: Your turn to use induction on this.

```hs
insertionSort [] = []
insertionSort (x:xs) = insert x (insertionSort xs)
```

Another exercise: Evaluate `insert 15 (10 : (20 : (30 : [])))`.

```hs
  insert 15 (10 : (20 : (30 : [])))
→ 10 : (insert 15 : (20 : (30 : [])))
→ 10 : (15 : (20 : (30 : [])))
→ [10, 15, 20, 30]
```