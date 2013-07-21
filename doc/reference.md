# Lo-Dash Join plugin <sup>v0.1</sup>

<!-- div -->


<!-- div -->

## <a id="Arrays"></a>`Arrays`
* [`uniqueJoin`](#uniquejoinoutercollection-innercollection--outerkeyidentity-innerkeyidentity-resultselectoridentity-outerthis-innerthis-resultthis)

<!-- /div -->


<!-- div -->

## `Collections`
* [`groupJoin`](#groupjoinoutercollection-innercollection--outerkeyidentity-innerkeyidentity-resultselectoridentity-outerthis-innerthis-resultthis)
* [`hashJoin`](#hashjoinoutercollection-innercollection--outerkeyidentity-innerkeyidentity-resultselectoridentity-outerthis-innerthis-resultthis)
* [`mergeJoin`](#mergejoinoutercollection-innercollection--outerkeyidentity-innerkeyidentity-resultselectoridentity-outersorted-innersorted-outerthis-innerthis-resultthis)

<!-- /div -->


<!-- /div -->


<!-- div -->


<!-- div -->

## `“Arrays” Methods`

<!-- div -->

### <a id="uniquejoinoutercollection-innercollection--outerkeyidentity-innerkeyidentity-resultselectoridentity-outerthis-innerthis-resultthis"></a>`uniqueJoin(outerCollection, innerCollection [, outerKey=identity, innerKey=identity, resultSelector=identity, outerThis, innerThis, resultThis])`
<a href="#uniquejoinoutercollection-innercollection--outerkeyidentity-innerkeyidentity-resultselectoridentity-outerthis-innerthis-resultthis">#</a> [&#x24C8;](#L526 "View in source") [&#x24C9;][1]

Accepts two collections for join, where `outerCollection` <b>is sorted by unique key</b> and `innerCollection` <b>is sorted by same key</b> *(may be not unique)*. Creates an array of pairs `[leftElement, rightElement]` *(or results returned by function `resultSelector`)*. This array is a result of algorithm like SQL INNER  JOIN of two collections.

Keys for joining are computed by invoking key selection functions `outerKey` and `innerKey` on elements of each collection. Key and result selectors are bound to `outerThis`, `innerThis` and `resultThis`. Key selectors invoked with three arguments; *(value, index|key, collection)*. Result selector invoked with six arguments *(leftValue, rightValue, leftIndex, rightIndex, leftCollection, rightCollection)*. If `resultSelector` returns `null` or `undefined`, this value will not be added to the collection of results.

If a property name is passed for one of key selectors, the created "_.pluck" style selector will return the property value of the given element.

If an object is passed for one of key selectors, the created "_.where" style selector will return `true` for elements that have the properties of the given object, else `false`.

This method merges two sorted collections. Complexity of algorithm is linear.

#### Arguments
1. `outerCollection` *(Array)*: The left operand of JOIN.
2. `innerCollection` *(Array)*: The right operand of JOIN.
3. `[outerKey=identity]` *(Function|Object|String)*: The function invoked on each object form left collection to get the key for JOIN. If a property name or object is passed, it will be used to create a "_.pluck" or "_.where" style callback, respectively.
4. `[innerKey=identity]` *(Function|Object|String)*: The function invoked on each object form right collection to get the key for JOIN. If a property name or object is passed, it will be used to create a "_.pluck" or "_.where" style callback, respectively.
5. `[resultSelector=identity]` *(Function|Any)*: The function invoked on each pair of joined objects from two collections. If it is undefined, the result collection consists of arrays like `[leftObj, rightObj]`. If it is not a function, the result collection consists of same values that equals `resultSelector`.
6. `[outerThis]` *(Object)*: The `this` binding of `outerKey` function.
7. `[innerThis]` *(Object)*: The `this` binding of `innerKey` function.
8. `[resultThis]` *(Object)*: The `this` binding of `resultSelector` function.

#### Returns
*(Array)*: Returns the joined collection of objects.

#### Example
```js
_([1, 3, 5, 7])
  .uniqueJoin([3, 3, 4, 5, 6, 7, 7, 8],
    function(x) { return x; },
    function(x) { return x; },
    function(l, r) { return l == r && l; })
  .value();
// => [3, 3, 5, 7, 7]

// no key and result selectors
_.uniqueJoin([1, 2, 3], [1, 2]);
// => [[1, 1], [2, 2]]

// filter results by `resultSelector`
_.uniqueJoin([1, 2], [1, 2],
    function(x) { return x; },
    function(x) { return x; },
    function(l, r) { if (l == 1) return [l, r]; }
);
// => [[1, 1]]
```

* * *

<!-- /div -->


<!-- /div -->


<!-- div -->

## `“Collections” Methods`

<!-- div -->

### <a id="groupjoinoutercollection-innercollection--outerkeyidentity-innerkeyidentity-resultselectoridentity-outerthis-innerthis-resultthis"></a>`groupJoin(outerCollection, innerCollection [, outerKey=identity, innerKey=identity, resultSelector=identity, outerThis, innerThis, resultThis])`
<a href="#groupjoinoutercollection-innercollection--outerkeyidentity-innerkeyidentity-resultselectoridentity-outerthis-innerthis-resultthis">#</a> [&#x24C8;](#L229 "View in source") [&#x24C9;][1]

Creates an array of pairs `[leftElement, [rightGroup]]` *(or results returned by function `resultSelector`)*. This array is a result of algorithm like SQL LEFT OUTER JOIN of two collections `outerCollection` and `innerCollection`. But in the result collection each object from `outerCollection` corresponds to group of elements from `innerCollection`. All elements in group have identically key.

Keys for joining are computed by invoking key selection functions `outerKey` and `innerKey` on elements of each collection. Key and result selectors are bound to `outerThis`, `innerThis` and `resultThis`. Key selectors invoked with three arguments; *(value, index|key, collection)*. Result selector invoked with four arguments *(leftValue, rightGroup , leftIndex, leftCollection)*. If `resultSelector` returns `null` or `undefined`, this value will not be added to the collection of results.

If a property name is passed for one of key selectors, the created "_.pluck" style selector will return the property value of the given element.

If an object is passed for one of key selectors, the created "_.where" style selector will return `true` for elements that have the properties of the given object, else `false`.

This method puts `innerCollection` into hash table and iterates over elements of `outerCollection`.

#### Arguments
1. `outerCollection` *(Array|Object|String)*: The left operand of JOIN.
2. `innerCollection` *(Array|Object|String)*: The right operand of JOIN.
3. `[outerKey=identity]` *(Function|Object|String)*: The function invoked on each object form left collection to get the key for JOIN. If a property name or object is passed, it will be used to create a "_.pluck" or "_.where" style callback, respectively.
4. `[innerKey=identity]` *(Function|Object|String)*: The function invoked on each object form right collection to get the key for JOIN. If a property name or object is passed, it will be used to create a "_.pluck" or "_.where" style callback, respectively.
5. `[resultSelector=identity]` *(Function)*: The function invoked on each object from outer collection and corresponding to it group from inner collection. If it is undefined, the result collection consists of arrays like `[leftObj, [rightGroup]]`. If it is not a function, an exception was thrown.
6. `[outerThis]` *(Object)*: The `this` binding of `outerKey` function.
7. `[innerThis]` *(Object)*: The `this` binding of `innerKey` function.
8. `[resultThis]` *(Object)*: The `this` binding of `resultSelector` function.

#### Returns
*(Array)*: Returns the joined collection of objects.

#### Example
```js
var peoples = [
  { name: 'John', surname: 'Tyler' },
  { name: 'John', surname: 'Smith' },
  { name: 'Robert', surname: 'Bishop' }
];

_(peoples)
  .groupJoin(peoples,
    function(p) { return p.name; },
    function(p) { return p.name; },
    function(l, rGr) { return l.surname + ': ' + rGr.length; })
  .value();
// => ['Tyler: 2', 'Smith: 2', 'Bishop: 1']

// using "_.pluck" callback shorthand
_.groupJoin([{ id: 1, name: 'John' }], [[1, 200], [1, 300]], 'id', 0,
    function(l, rGr) {
      return l.name + ': ' +
      _.reduce(rGr, function(s, el) { return s + el[1]; }, 0);
    });
// => ['John: 500']

// no key and result selectors
_.groupJoin([1, 2, 3], [1, 1, 2]);
// => [[1, [1, 1]], [2, [2]], [3, []]]

// filter results by `resultSelector`
_.groupJoin([1, 2], [2, 1, 2],
    function(x) { return x; },
    function(x) { return x; },
    function(l, rGr) { if (rGr.length > 1) return [l, rGr]; }
);
// => [[2, [2, 2]]]
```

* * *

<!-- /div -->


<!-- div -->

### <a id="hashjoinoutercollection-innercollection--outerkeyidentity-innerkeyidentity-resultselectoridentity-outerthis-innerthis-resultthis"></a>`hashJoin(outerCollection, innerCollection [, outerKey=identity, innerKey=identity, resultSelector=identity, outerThis, innerThis, resultThis])`
<a href="#hashjoinoutercollection-innercollection--outerkeyidentity-innerkeyidentity-resultselectoridentity-outerthis-innerthis-resultthis">#</a> [&#x24C8;](#L93 "View in source") [&#x24C9;][1]

Creates an array of pairs `[leftElement, rightElement]` *(or results returned by function `resultSelector`)*. This array is a result of algorithm like SQL INNER JOIN of two collections `outerCollection` and `innerCollection`.

Keys for joining are computed by invoking key selection functions `outerKey` and `innerKey` on elements of each collection. Key and result selectors are bound to `outerThis`, `innerThis` and `resultThis`. Key selectors invoked with three arguments; *(value, index|key, collection)*. Result selector invoked with six arguments *(leftValue, rightValue, leftIndex, rightIndex, leftCollection, rightCollection)*. If `resultSelector` returns `null` or `undefined`, this value will not be added to the collection of results.

If a property name is passed for one of key selectors, the created "_.pluck" style selector will return the property value of the given element.

If an object is passed for one of key selectors, the created "_.where" style selector will return `true` for elements that have the properties of the given object, else `false`.

This method puts `innerCollection` into hash table and iterates over elements of `outerCollection`.

#### Arguments
1. `outerCollection` *(Array|Object|String)*: The left operand of JOIN.
2. `innerCollection` *(Array|Object|String)*: The right operand of JOIN.
3. `[outerKey=identity]` *(Function|Object|String)*: The function invoked on each object form left collection to get the key for JOIN. If a property name or object is passed, it will be used to create a "_.pluck" or "_.where" style callback, respectively.
4. `[innerKey=identity]` *(Function|Object|String)*: The function invoked on each object form right collection to get the key for JOIN. If a property name or object is passed, it will be used to create a "_.pluck" or "_.where" style callback, respectively.
5. `[resultSelector=identity]` *(Function|Any)*: The function invoked on each pair of joined objects from two collections. If it is undefined, the result collection consists of arrays like `[leftObj, rightObj]`. If it is not a function, the result collection consists of same values that equals `resultSelector`.
6. `[outerThis]` *(Object)*: The `this` binding of `outerKey` function.
7. `[innerThis]` *(Object)*: The `this` binding of `innerKey` function.
8. `[resultThis]` *(Object)*: The `this` binding of `resultSelector` function.

#### Returns
*(Array)*: Returns the joined collection of objects.

#### Example
```js
var peoples = [
  { name: 'John', surname: 'Tyler' },
  { name: 'John', surname: 'Smith' }
];

_(peoples)
  .hashJoin(peoples,
    function(p) { return p.name; },
    function(p) { return p.name; },
    function(l, r) { return l.surname + '-' + r.surname; })
  .value();
// => ['Tyler-Tyler', 'Tyler-Smith', 'Smith-Tyler', 'Smith-Smith']

// using "_.pluck" callback shorthand
_.hashJoin(peoples, peoples, 'name', 'name', 0);
// => [0, 0, 0, 0]

// no key and result selectors
_.hashJoin([1, 2, 3], [3, 1, 2]);
// => [[1, 1], [2, 2], [3, 3]]

// filter results by `resultSelector`
_.hashJoin([1, 2], [2, 1],
    function(x) { return x; },
    function(x) { return x; },
    function(l, r) { if (l == 1) return [l, r]; }
);
// => [[1, 1]]
```

* * *

<!-- /div -->


<!-- div -->

### <a id="mergejoinoutercollection-innercollection--outerkeyidentity-innerkeyidentity-resultselectoridentity-outersorted-innersorted-outerthis-innerthis-resultthis"></a>`mergeJoin(outerCollection, innerCollection [, outerKey=identity, innerKey=identity, resultSelector=identity, outerSorted, innerSorted, outerThis, innerThis, resultThis])`
<a href="#mergejoinoutercollection-innercollection--outerkeyidentity-innerkeyidentity-resultselectoridentity-outersorted-innersorted-outerthis-innerthis-resultthis">#</a> [&#x24C8;](#L338 "View in source") [&#x24C9;][1]

Creates an array of pairs `[leftElement, rightElement]` *(or results returned by function `resultSelector`)*. This array is a result of algorithm like SQL INNER JOIN of two collections `outerCollection` and `innerCollection`.

Keys for joining are computed by invoking key selection functions `outerKey` and `innerKey` on elements of each collection. Key and result selectors are bound to `outerThis`, `innerThis` and `resultThis`. Key selectors invoked with three arguments; *(value, index|key, collection)*. Result selector invoked with six arguments *(leftValue, rightValue, leftIndex, rightIndex, leftCollection, rightCollection)*. If `resultSelector` returns `null` or `undefined`, this value will not be added to the collection of results.

If a property name is passed for one of key selectors, the created "_.pluck" style selector will return the property value of the given element.

If an object is passed for one of key selectors, the created "_.where" style selector will return `true` for elements that have the properties of the given object, else `false`.

This method sorts the two collections based on the keys and then merges them into a collection of results. If collections are already sorted, passing `true` for `outerSorted` and `innerSorted` will run a faster algorithm.

#### Arguments
1. `outerCollection` *(Array|Object|String)*: The left operand of JOIN.
2. `innerCollection` *(Array|Object|String)*: The right operand of JOIN.
3. `[outerKey=identity]` *(Function|Object|String)*: The function invoked on each object form left collection to get the key for JOIN. If a property name or object is passed, it will be used to create a "_.pluck" or "_.where" style callback, respectively.
4. `[innerKey=identity]` *(Function|Object|String)*: The function invoked on each object form right collection to get the key for JOIN. If a property name or object is passed, it will be used to create a "_.pluck" or "_.where" style callback, respectively.
5. `[resultSelector=identity]` *(Function|Any)*: The function invoked on each pair of joined objects from two collections. If it is undefined, the result collection consists of arrays like `[leftObj, rightObj]`. If it is not a function, the result collection consists of same values that equals `resultSelector`.
6. `[outerSorted]` *(Boolean)*: A flag to indicate that the `outerCollection` is already sorted.
7. `[innerSorted]` *(Boolean)*: A flag to indicate that the `innerCollection` is already sorted.
8. `[outerThis]` *(Object)*: The `this` binding of `outerKey` function.
9. `[innerThis]` *(Object)*: The `this` binding of `innerKey` function.
10. `[resultThis]` *(Object)*: The `this` binding of `resultSelector` function.

#### Returns
*(Array)*: Returns the joined collection of objects.

#### Example
```js
var peoples = [
  { name: 'John', surname: 'Tyler' },
  { name: 'John', surname: 'Smith' }
];

_(peoples)
  .mergeJoin(peoples,
    function(p) { return p.name; },
    function(p) { return p.name; },
    function(l, r) { return l.surname + '-' + r.surname; })
  .value();
// => ['Tyler-Tyler', 'Tyler-Smith', 'Smith-Tyler', 'Smith-Smith']

// using "_.pluck" callback shorthand
_.mergeJoin(peoples, peoples, 'name', 'name', 0);
// => [0, 0, 0, 0]

// no key and result selectors
_.mergeJoin([1, 2, 3], [3, 1, 2]);
// => [[1, 1], [2, 2], [3, 3]]

// filter results by `resultSelector`
_.mergeJoin([1, 2], [2, 1],
    function(x) { return x; },
    function(x) { return x; },
    function(l, r) { if (l == 1) return [l, r]; }
);
// => [[1, 1]]

// passing `isSorted` flags
_.mergeJoin([1, 2], [1, 2], null, null, null, true, true);
// => [[1, 1], [2, 2]]
```

* * *

<!-- /div -->


<!-- /div -->


<!-- /div -->


  [1]: #Arrays "Jump back to the TOC."