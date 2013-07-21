/**
 * @module lodash.join
 * @license
 * This plugin extends Lo-Dash library <http://lodash.com/> with
 * some SQL-like `JOIN` operators.
 * Copyright (c) 2013 Dmitry Panyushkin.
 * Available under MIT license.
 */
;(function(_) {
  'use strict';

  /**
   * Creates an array of pairs `[leftElement, rightElement]` (or results
   * returned by function `resultSelector`). This array is a result of
   * algorithm like SQL INNER JOIN of two collections `outerCollection`
   * and `innerCollection`.
   *
   * Keys for joining are computed by invoking key
   * selection functions `outerKey` and `innerKey` on elements of each
   * collection. Key and result selectors are bound to `outerThis`,
   * `innerThis` and `resultThis`. Key selectors invoked with three
   * arguments; (value, index|key, collection). Result selector invoked
   * with six arguments (leftValue, rightValue, leftIndex, rightIndex,
   * leftCollection, rightCollection). If `resultSelector` returns `null`
   * or `undefined`, this value will not be added to the collection of
   * results.
   *
   * If a property name is passed for one of key selectors, the created
   * "_.pluck" style selector will return the property value of the given
   * element.
   *
   * If an object is passed for one of key selectors, the created "_.where"
   * style selector will return `true` for elements that have the properties
   * of the given object, else `false`.
   *
   * This method puts `innerCollection` into hash table and iterates
   * over elements of `outerCollection`.
   *
   * @static
   * @memberOf _
   * @category Collections
   * @param {Array|Object|String} outerCollection The left operand of JOIN.
   * @param {Array|Object|String} innerCollection The right operand of JOIN.
   * @param {Function|Object|String} [outerKey=identity] The function invoked
   * on each object form left collection to get the key for JOIN. If a
   * property name or object is passed, it will be used to create a "_.pluck"
   * or "_.where" style callback, respectively.
   * @param {Function|Object|String} [innerKey=identity] The function invoked
   * on each object form right collection to get the key for JOIN. If a
   * property name or object is passed, it will be used to create a "_.pluck"
   * or "_.where" style callback, respectively.
   * @param {Function|Any} [resultSelector=identity] The function invoked
   * on each pair of joined objects from two collections. If it is undefined,
   * the result collection consists of arrays like `[leftObj, rightObj]`. If
   * it is not a function, the result collection consists of same values that
   * equals `resultSelector`.
   * @param {Object} [outerThis] The `this` binding of `outerKey` function.
   * @param {Object} [innerThis] The `this` binding of `innerKey` function.
   * @param {Object} [resultThis] The `this` binding of `resultSelector`
   * function.
   * @returns {Array} Returns the joined collection of objects.
   * @example
   *
   * var peoples = [
   *   { name: 'John', surname: 'Tyler' },
   *   { name: 'John', surname: 'Smith' }
   * ];
   *
   * _(peoples)
   *   .hashJoin(peoples,
   *     function(p) { return p.name; },
   *     function(p) { return p.name; },
   *     function(l, r) { return l.surname + '-' + r.surname; })
   *   .value();
   * // => ['Tyler-Tyler', 'Tyler-Smith', 'Smith-Tyler', 'Smith-Smith']
   *
   * // using "_.pluck" callback shorthand
   * _.hashJoin(peoples, peoples, 'name', 'name', 0);
   * // => [0, 0, 0, 0]
   *
   * // no key and result selectors
   * _.hashJoin([1, 2, 3], [3, 1, 2]);
   * // => [[1, 1], [2, 2], [3, 3]]
   *
   * // filter results by `resultSelector`
   * _.hashJoin([1, 2], [2, 1],
   *     function(x) { return x; },
   *     function(x) { return x; },
   *     function(l, r) { if (l == 1) return [l, r]; }
   * );
   * // => [[1, 1]]
   */
  function hashJoin(outerCollection, innerCollection,
      outerKey, innerKey, resultSelector,
      outerThis, innerThis, resultThis) {
    var result = [];
    outerKey = _.createCallback(outerKey, outerThis);
    innerKey = _.createCallback(innerKey, innerThis);
    resultSelector = createResultSelector(resultSelector, resultThis);

    var groups = toGroupedLookup(innerCollection, innerKey);
    _.forEach(outerCollection, function(
        outer, outerInd, outerCollection) {
      var key = String(outerKey(outer, outerInd, outerCollection)),
          group = groups[key], groupInd = -1,
          groupLen = group && group.length;
      if (typeof groupLen !== 'number') return;

      while (++groupInd < groupLen) {
        var element = group[groupInd],
            value = resultSelector(outer, element[0],
                outerInd, element[1], outerCollection, innerCollection);
        if (value != null) result.push(value);
      }
    });
    return result;

    /**
     * Creates an object composed of keys returned from running each element
     * of the `collection` through the `keySelector`. The corresponding value
     * of each key is  an array of elements with indices passed to
     * `keySelector` that returned the key. The `keySelector` invoked with
     * three arguments: (value, index|key, collection).
     *
     * @private
     * @static
     * @param {Array|Object|String} collection The collection for grouping.
     * @param {Function} keySelector Function that selects keys for grouping.
     * @returns {Object} Returns the composed aggregate object.
     */
    function toGroupedLookup(collection, keySelector) {
      var key, result = {};
      _.forEach(collection, function(value, index, collection) {
        key = String(keySelector(value, index, collection));
        (Object.prototype.hasOwnProperty.call(result, key)
            ? result[key] : result[key] = []).push([value, index]);
      });
      return result;
    }
  }

  /**
   * Creates an array of pairs `[leftElement, [rightGroup]]` (or results
   * returned by function `resultSelector`). This array is a result of
   * algorithm like SQL LEFT OUTER JOIN of two collections `outerCollection`
   * and `innerCollection`. But in the result collection each object from
   * `outerCollection` corresponds to group of elements from `innerCollection`.
   * All elements in group have identically key.
   *
   * Keys for joining are computed by invoking key
   * selection functions `outerKey` and `innerKey` on elements of each
   * collection. Key and result selectors are bound to `outerThis`,
   * `innerThis` and `resultThis`. Key selectors invoked with three
   * arguments; (value, index|key, collection). Result selector invoked
   * with four arguments (leftValue, rightGroup , leftIndex, leftCollection).
   * If `resultSelector` returns `null` or `undefined`, this value will not
   * be added to the collection of results.
   *
   * If a property name is passed for one of key selectors, the created
   * "_.pluck" style selector will return the property value of the given
   * element.
   *
   * If an object is passed for one of key selectors, the created "_.where"
   * style selector will return `true` for elements that have the properties
   * of the given object, else `false`.
   *
   * This method puts `innerCollection` into hash table and iterates
   * over elements of `outerCollection`.
   *
   * @static
   * @memberOf _
   * @category Collections
   * @param {Array|Object|String} outerCollection The left operand of JOIN.
   * @param {Array|Object|String} innerCollection The right operand of JOIN.
   * @param {Function|Object|String} [outerKey=identity] The function invoked
   * on each object form left collection to get the key for JOIN. If a
   * property name or object is passed, it will be used to create a "_.pluck"
   * or "_.where" style callback, respectively.
   * @param {Function|Object|String} [innerKey=identity] The function invoked
   * on each object form right collection to get the key for JOIN. If a
   * property name or object is passed, it will be used to create a "_.pluck"
   * or "_.where" style callback, respectively.
   * @param {Function} [resultSelector=identity] The function invoked
   * on each object from outer collection and corresponding to it group from
   * inner collection. If it is undefined, the result collection consists of
   * arrays like `[leftObj, [rightGroup]]`. If it is not a function, an
   * exception was thrown.
   * @param {Object} [outerThis] The `this` binding of `outerKey` function.
   * @param {Object} [innerThis] The `this` binding of `innerKey` function.
   * @param {Object} [resultThis] The `this` binding of `resultSelector`
   * function.
   * @returns {Array} Returns the joined collection of objects.
   * @example
   *
   * var peoples = [
   *   { name: 'John', surname: 'Tyler' },
   *   { name: 'John', surname: 'Smith' },
   *   { name: 'Robert', surname: 'Bishop' }
   * ];
   *
   * _(peoples)
   *   .groupJoin(peoples,
   *     function(p) { return p.name; },
   *     function(p) { return p.name; },
   *     function(l, rGr) { return l.surname + ': ' + rGr.length; })
   *   .value();
   * // => ['Tyler: 2', 'Smith: 2', 'Bishop: 1']
   *
   * // using "_.pluck" callback shorthand
   * _.groupJoin([{ id: 1, name: 'John' }], [[1, 200], [1, 300]], 'id', 0,
   *     function(l, rGr) {
   *       return l.name + ': ' +
   *       _.reduce(rGr, function(s, el) { return s + el[1]; }, 0);
   *     });
   * // => ['John: 500']
   *
   * // no key and result selectors
   * _.groupJoin([1, 2, 3], [1, 1, 2]);
   * // => [[1, [1, 1]], [2, [2]], [3, []]]
   *
   * // filter results by `resultSelector`
   * _.groupJoin([1, 2], [2, 1, 2],
   *     function(x) { return x; },
   *     function(x) { return x; },
   *     function(l, rGr) { if (rGr.length > 1) return [l, rGr]; }
   * );
   * // => [[2, [2, 2]]]
   */
  function groupJoin(outerCollection, innerCollection,
      outerKey, innerKey, resultSelector,
      outerThis, innerThis, resultThis) {
    var result = [];
    outerKey = _.createCallback(outerKey, outerThis);
    resultSelector = createResultSelector(resultSelector, resultThis, true);

    var groups = _.groupBy(innerCollection, innerKey, innerThis);
    _.forEach(outerCollection, function(
        outer, outerInd, outerCollection) {
      var key = String(outerKey(outer, outerInd, outerCollection)),
          value = resultSelector(outer, groups[key] || [],
              outerInd, outerCollection);
      if (value != null) result.push(value);
    });
    return result;
  }

  /**
   * Creates an array of pairs `[leftElement, rightElement]` (or results
   * returned by function `resultSelector`). This array is a result of
   * algorithm like SQL INNER JOIN of two collections `outerCollection`
   * and `innerCollection`.
   *
   * Keys for joining are computed by invoking key
   * selection functions `outerKey` and `innerKey` on elements of each
   * collection. Key and result selectors are bound to `outerThis`,
   * `innerThis` and `resultThis`. Key selectors invoked with three
   * arguments; (value, index|key, collection). Result selector invoked
   * with six arguments (leftValue, rightValue, leftIndex, rightIndex,
   * leftCollection, rightCollection). If `resultSelector` returns `null`
   * or `undefined`, this value will not be added to the collection of
   * results.
   *
   * If a property name is passed for one of key selectors, the created
   * "_.pluck" style selector will return the property value of the given
   * element.
   *
   * If an object is passed for one of key selectors, the created "_.where"
   * style selector will return `true` for elements that have the properties
   * of the given object, else `false`.
   *
   * This method sorts the two collections based on the keys and then merges
   * them into a collection of results. If collections are already sorted,
   * passing `true` for `outerSorted` and `innerSorted` will run a faster
   * algorithm.
   *
   * @static
   * @memberOf _
   * @category Collections
   * @param {Array|Object|String} outerCollection The left operand of JOIN.
   * @param {Array|Object|String} innerCollection The right operand of JOIN.
   * @param {Function|Object|String} [outerKey=identity] The function invoked
   * on each object form left collection to get the key for JOIN. If a
   * property name or object is passed, it will be used to create a "_.pluck"
   * or "_.where" style callback, respectively.
   * @param {Function|Object|String} [innerKey=identity] The function invoked
   * on each object form right collection to get the key for JOIN. If a
   * property name or object is passed, it will be used to create a "_.pluck"
   * or "_.where" style callback, respectively.
   * @param {Function|Any} [resultSelector=identity] The function invoked
   * on each pair of joined objects from two collections. If it is undefined,
   * the result collection consists of arrays like `[leftObj, rightObj]`. If
   * it is not a function, the result collection consists of same values that
   * equals `resultSelector`.
   * @param {Boolean} [outerSorted] A flag to indicate that the
   * `outerCollection` is already sorted.
   * @param {Boolean} [innerSorted] A flag to indicate that the
   * `innerCollection` is already sorted.
   * @param {Object} [outerThis] The `this` binding of `outerKey` function.
   * @param {Object} [innerThis] The `this` binding of `innerKey` function.
   * @param {Object} [resultThis] The `this` binding of `resultSelector`
   * function.
   * @returns {Array} Returns the joined collection of objects.
   * @example
   *
   * var peoples = [
   *   { name: 'John', surname: 'Tyler' },
   *   { name: 'John', surname: 'Smith' }
   * ];
   *
   * _(peoples)
   *   .mergeJoin(peoples,
   *     function(p) { return p.name; },
   *     function(p) { return p.name; },
   *     function(l, r) { return l.surname + '-' + r.surname; })
   *   .value();
   * // => ['Tyler-Tyler', 'Tyler-Smith', 'Smith-Tyler', 'Smith-Smith']
   *
   * // using "_.pluck" callback shorthand
   * _.mergeJoin(peoples, peoples, 'name', 'name', 0);
   * // => [0, 0, 0, 0]
   *
   * // no key and result selectors
   * _.mergeJoin([1, 2, 3], [3, 1, 2]);
   * // => [[1, 1], [2, 2], [3, 3]]
   *
   * // filter results by `resultSelector`
   * _.mergeJoin([1, 2], [2, 1],
   *     function(x) { return x; },
   *     function(x) { return x; },
   *     function(l, r) { if (l == 1) return [l, r]; }
   * );
   * // => [[1, 1]]
   *
   * // passing `isSorted` flags
   * _.mergeJoin([1, 2], [1, 2], null, null, null, true, true);
   * // => [[1, 1], [2, 2]]
   */
  function mergeJoin(outerCollection, innerCollection,
      outerKey, innerKey, resultSelector, outerSorted, innerSorted,
      outerThis, innerThis, resultThis) {
    var result = []; // juggle arguments
    if (typeof outerSorted != 'boolean' ||
        typeof innerSorted != 'boolean') {
      resultThis = outerThis;
      outerThis = outerSorted; outerSorted = false;
      innerThis = innerSorted; innerSorted = false;
    }
    outerKey = _.createCallback(outerKey, outerThis);
    innerKey = _.createCallback(innerKey, innerThis);
    resultSelector = createResultSelector(resultSelector, resultThis);
    outerSorted = outerSorted && _.isArray(outerCollection);
    innerSorted = innerSorted && _.isArray(innerCollection);

    var oLookup = toSortedLookup(outerCollection, outerKey, outerSorted);
    var iLookup = toSortedLookup(innerCollection, innerKey, innerSorted);
    var oLen = oLookup.length, iLen = iLookup.length;
    if (oLen <= 0 || iLen <= 0) return [];

    var oInd = 0, oKey = getKey(oLookup, 0, outerKey, outerSorted),
        iInd = 0, iKey = getKey(iLookup, 0, innerKey, innerSorted);
    while (oInd < oLen && iInd < iLen) {
      if (iKey < oKey) {
        iKey = getKey(iLookup, ++iInd, innerKey, innerSorted);
      } else if (iKey > oKey) {
        oKey = getKey(oLookup, ++oInd, outerKey, outerSorted);
      } else {  // iKey == oKey
        for (var oEnd = oInd + 1; oEnd < oLen; oEnd++) {
          if (getKey(oLookup, oEnd, outerKey, outerSorted) != oKey) break;
        }
        for (var iEnd = iInd + 1; iEnd < iLen; iEnd++) {
          if (getKey(iLookup, iEnd, innerKey, innerSorted) != iKey) break;
        }
        saveResults(oInd, iInd, oEnd, iEnd);
        if ((oInd = oEnd) < oLen) {
          oKey = getKey(oLookup, oInd, outerKey, outerSorted);
        }
        if ((iInd = iEnd) < iLen) {
          iKey = getKey(iLookup, iInd, innerKey, innerSorted);
        }
      }
    }
    return result;

    /**
     * Creates an array of triples [key, value, index] from `collection`
     * and sorts it by `keySelector` function. If `isSorted` flag is true
     * returns the input collection (instead of an array of triplets).
     * Sorting algorithm is unstable.
     *
     * @private
     * @static
     * @param {Array|Object|String} collection The collection for sorting.
     * @param {Function} keySelector Function that selects keys for sorting.
     * @param {Boolean} isSorted A flag to indicate that the array
     * is already sorted.
     * @returns {Array} The sorted array of triples.
     */
    function toSortedLookup(collection, keySelector, isSorted) {
      if (isSorted) return collection;
      return _.map(collection, function(value, index, collection) {
        return [keySelector(value, index, collection), value, index];
      }).sort(function(l, r) { return l[0] < r[0] ? -1 : 1; });
    }

    /**
     * Returns key for element of collection depending on `isSorted` flag.
     *
     * @private
     * @static
     * @param {Array} collection The collection of elements.
     * @param {Number} index Index of element in collection.
     * @param {Function} selector Function that selects keys for sorting.
     * @param {Boolean} isSorted A flag to indicate that the array is
     * already sorted.
     * @returns {String} Returns key for joining.
     */
    function getKey(collection, index, selector, isSorted) {
      var value = collection[index];
      return isSorted ? selector(value, index, collection) : value[0];
    }

    /**
     * Appends to the result collection cartesian product of ranges
     * `[oStart, oEnd]` from `outerCollection` and `[iStart, iEnd]`
     * from `innerCollection`.
     *
     * @private
     * @param {Number} oStart Initial index for `outerCollection`.
     * @param {Number} iStart Initial index for `innerCollection`.
     * @param {Number} oEnd Finite index for `outerCollection`.
     * @param {Number} iEnd Finite index for `innerCollection`.
     */
    function saveResults(oStart, iStart, oEnd, iEnd) {
      var outer, inner, outerIndex, innerIndex,
          outerValue, innerValue, value;
      for (var oInd = oStart; oInd < oEnd;) {
        outer = oLookup[oInd++];
        outerValue = outerSorted ? outer : outer[1];
        outerIndex = outerSorted ? oInd : outer[2];
        for (var iInd = iStart; iInd < iEnd;) {
          inner = iLookup[iInd++];
          innerValue = innerSorted ? inner : inner[1];
          innerIndex = innerSorted ? iInd : inner[2];
          value = resultSelector(outerValue, innerValue,
              outerIndex, innerIndex, outerCollection, innerCollection);
          if (value != null) result.push(value);
        }
      }
    }
  }

  /**
   * Accepts two collections for join, where `outerCollection` <b>is sorted
   * by unique key</b> and `innerCollection` <b>is sorted by same key</b>
   * (may be not unique). Creates an array of pairs
   * `[leftElement, rightElement]` (or results returned by function
   * `resultSelector`). This array is a result of algorithm like SQL INNER
   *  JOIN of two collections.
   *
   * Keys for joining are computed by invoking key
   * selection functions `outerKey` and `innerKey` on elements of each
   * collection. Key and result selectors are bound to `outerThis`,
   * `innerThis` and `resultThis`. Key selectors invoked with three
   * arguments; (value, index|key, collection). Result selector invoked
   * with six arguments (leftValue, rightValue, leftIndex, rightIndex,
   * leftCollection, rightCollection). If `resultSelector` returns `null`
   * or `undefined`, this value will not be added to the collection of
   * results.
   *
   * If a property name is passed for one of key selectors, the created
   * "_.pluck" style selector will return the property value of the given
   * element.
   *
   * If an object is passed for one of key selectors, the created "_.where"
   * style selector will return `true` for elements that have the properties
   * of the given object, else `false`.
   *
   * This method merges two sorted collections. Complexity of algorithm is
   * linear.
   *
   * @static
   * @memberOf _
   * @category Arrays
   * @param {Array} outerCollection The left operand of JOIN.
   * @param {Array} innerCollection The right operand of JOIN.
   * @param {Function|Object|String} [outerKey=identity] The function invoked
   * on each object form left collection to get the key for JOIN. If a
   * property name or object is passed, it will be used to create a "_.pluck"
   * or "_.where" style callback, respectively.
   * @param {Function|Object|String} [innerKey=identity] The function invoked
   * on each object form right collection to get the key for JOIN. If a
   * property name or object is passed, it will be used to create a "_.pluck"
   * or "_.where" style callback, respectively.
   * @param {Function|Any} [resultSelector=identity] The function invoked
   * on each pair of joined objects from two collections. If it is undefined,
   * the result collection consists of arrays like `[leftObj, rightObj]`. If
   * it is not a function, the result collection consists of same values that
   * equals `resultSelector`.
   * @param {Object} [outerThis] The `this` binding of `outerKey` function.
   * @param {Object} [innerThis] The `this` binding of `innerKey` function.
   * @param {Object} [resultThis] The `this` binding of `resultSelector`
   * function.
   * @returns {Array} Returns the joined collection of objects.
   * @example
   *
   * _([1, 3, 5, 7])
   *   .uniqueJoin([3, 3, 4, 5, 6, 7, 7, 8],
   *     function(x) { return x; },
   *     function(x) { return x; },
   *     function(l, r) { return l == r && l; })
   *   .value();
   * // => [3, 3, 5, 7, 7]
   *
   * // no key and result selectors
   * _.uniqueJoin([1, 2, 3], [1, 2]);
   * // => [[1, 1], [2, 2]]
   *
   * // filter results by `resultSelector`
   * _.uniqueJoin([1, 2], [1, 2],
   *     function(x) { return x; },
   *     function(x) { return x; },
   *     function(l, r) { if (l == 1) return [l, r]; }
   * );
   * // => [[1, 1]]
   */
  function uniqueJoin(outerCollection, innerCollection,
      outerKey, innerKey, resultSelector,
      outerThis, innerThis, resultThis) {
    var oLen = outerCollection.length, iLen = innerCollection.length;
    if (oLen <= 0 || iLen <= 0) return [];
    outerKey = _.createCallback(outerKey, outerThis);
    innerKey = _.createCallback(innerKey, innerThis);
    resultSelector = createResultSelector(resultSelector, resultThis);

    var outer = outerCollection[0], inner = innerCollection[0],
        oKey = outerKey(outer, 0, outerCollection),
        iKey = innerKey(inner, 0, innerCollection),
        oInd = 0, iInd = 0, result = [];
    while (oInd < oLen && iInd < iLen) {
      if (iKey < oKey) {
        inner = innerCollection[++iInd];
        iKey = innerKey(inner, iInd, innerCollection);
      } else if (iKey > oKey) {
        outer = outerCollection[++oInd];
        oKey = outerKey(outer, oInd, outerCollection);
      } else {  // iKey == oKey
        var value = resultSelector(outer, inner, oInd, iInd,
            outerCollection, innerCollection);
        if (value != null) result.push(value);
        if (++iInd < iLen) {
          inner = innerCollection[iInd];
          iKey = innerKey(inner, iInd, innerCollection);
        }
      }
    }
    return result;
  }

  _.mixin({
    hashJoin: hashJoin, groupJoin: groupJoin,
    mergeJoin: mergeJoin, uniqueJoin: uniqueJoin
  });

  /**
   * Produces a result selector function that accepts two parameters
   * and returns one value bound to an optional `thisArg`. If `selector`
   * is `null` or `undefined`, the created selector will return the array
   * `[outer, inner]`.
   *
   * If `isGroup` flag equals `true` the created selector accepts four
   * parameters `(outer, innerGroup, outerInd, outerCollection)`, else
   * accepts six parameters `(outer, inner, outerInd, innerInd,
   * outerCollection, innerCollection)`.
   *
   * If `selector` is not a function and `isGroup` not equals `true`, the
   * created selector will return the value of `selector` variable. But if
   * `isGroup` equals `true` an exception will be thrown.
   *
   * @private
   * @static
   * @param {Function} [selector] The value to convert to a selector.
   * @param {Object} [thisArg] The `this` binding of the created selector.
   * @param {Boolean} [isGroup] Flag determines if selector created
   * for `groupJoin`.
   * @returns {Function} Returns a selector function.
   */
  function createResultSelector(selector, thisArg, isGroup) {
    if (selector == null) return function(outer, inner) {
      return [outer, inner];
    };
    if (isGroup) {
      if (typeof selector != 'function') {
        throw new Error('groupJoin supports only functional result selector');
      }
      if (typeof thisArg == 'object') return function(
          outer, innerGroup, outerInd, outerCollection) {
        return selector.call(thisArg, outer, innerGroup,
          outerInd, outerCollection);
      }
    }
    if (typeof selector != 'function') {
      return function() { return selector; };
    }
    if (typeof thisArg == 'object') return function(outer, inner,
        outerInd, innerInd, outerCollection, innerCollection) {
      return selector.call(thisArg, outer, inner,
          outerInd, innerInd, outerCollection, innerCollection);
    };
    return selector;
  }

})(_);