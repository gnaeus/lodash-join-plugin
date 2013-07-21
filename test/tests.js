/**
 * Unit tests for Lo-dash Join plugin.
 * Depends on QUnit <http://qunitjs.com> testing framework.
 */
;(function(_) {
  'use strict';

  /**
   * Data for some tests.
   * @type {{customers: Array, employees: Array, orders: Array}}
   */
  var data = {
    customers: [{ id: 1, name: 'John' }, { id: 2, name: 'Robert' }],
    employees: [{ id: 1, name: 'Mary' }, { id: 2, name: 'Julia' }],
    orders: [
      { cusId: 1, empId: 1 }, { cusId: 1, empId: 2 },
      { cusId: 2, empId: 2 }, { cusId: 1, empId: 1 }
    ]
  };

  /**
   * Tests, which are identical to _.hashJoin and _.mergeJoin.
   *
   * @private
   * @param {String} joinName The name of the function for test.
   */
  function generalJoinTests(joinName) {

    test('should support chaining',
        function() {
      var actual = _(data.customers)
        [joinName](data.orders,
          function(obj) { return obj.id; },
          function(obj) { return obj.cusId; },
          function(l, r) { return { name: l.name, empId: r.empId }; })
        [joinName](data.employees,
          function(obj) { return obj.empId; },
          function(obj) { return obj.id; },
          function(l, r) { return l.name + '-' + r.name; })
        .value();

      deepEqual(actual.sort(), [
        'John-Julia', 'John-Mary',
        'John-Mary', 'Robert-Julia'
      ]);
    });

    test('should support unordered non-unique collections',
        function() {
      var actual = _[joinName]([5, 5, 2, 3, 3, 1], [5, 2, 3, 5],
          function(x) { return x; },
          function(x) { return x; },
          function(l, r) { return l == r && l; }
      );

      deepEqual(actual.sort(), [2, 3, 3, 5, 5, 5, 5]);
    });

    test('should work with objects for joined collections',
        function() {
      var left = { 'a': 1, 'b': 2, 'c': 3 },
          right = { 'a': 3, 'b': 1, 'c': 2 };

      var actual = _[joinName](left, right,
          function(x) { return x; },
          function(x) { return x; },
          function(l, r) { return [l, r]; }
      );

      deepEqual(actual, [[1, 1], [2, 2], [3, 3]]);
    });

    test('should work with strings for joined collections',
        function() {
      var actual = _[joinName]('ab', 'ba',
          function(x) { return x; },
          function(x) { return x; },
          function(l, r) { return [l, r]; }
      );

      deepEqual(actual, [['a', 'a'], ['b', 'b']]);
    });

  }

  /**
   * Verify that the function supports numbers and strings as key selectors
   * and that function can work without any selectors.
   *
   * @private
   * @static
   * @param {Function} joinFunc The function for test.
   */
  function keySelectorTests(joinFunc) {

     test('should work with a numbers and strings as key selectors',
        function() {
      var left = [['one', 'first'], ['two', 'second']],
          right = [{ number: 'one' }, { number: 'two' }];

      var firstJoin = joinFunc(left, right,
          0, 'number',
          function(l, r) { return l[1] + '-' + r.number; }
      );
      var secondJoin = joinFunc(right, left,
          'number', 0,
          function(l, r) { return l.number + '-' + r[1]; }
      );

      deepEqual(firstJoin, ['first-one', 'second-two']);
      deepEqual(secondJoin, ['one-first', 'two-second']);
    });

    test('should work without key and result selectors',
        function() {
      var actual = joinFunc([1, 2, 3], [1, 2, 3]);

      deepEqual(actual, [[1, 1], [2, 2], [3, 3]]);
    });

  }

  /**
   * Verify that `resultSelector` function supports mapping values, filtering
   * and `index` argument.
   *
   * @private
   * @static
   * @param {Function} joinFunc The function for test.
   */
  function resultSelectorTests(joinFunc) {

    test('should work with objects as mapping values of result selectors',
        function(){
      var actual = joinFunc([1, 2], [1, 2],
          function(x) { return x; },
          function(x) { return x; },
          true
      );

      deepEqual(actual, [true, true]);
    });

    test('should filter results when `resultSelector` returns `null`',
        function() {
      var all = joinFunc([1, 2], [1, 2],
          function(x) { return x; },
          function(x) { return x; },
          function(l, r) { return [l, r]; }
      );
      var filtered = joinFunc([1, 2], [1, 2],
          function(x) { return x; },
          function(x) { return x; },
          function(l, r) { return l == 1 ? [l, r] : null; }
      );

      deepEqual(all, [[1, 1], [2, 2]]);
      deepEqual(filtered, [[1, 1]]);
    });

    test('supports index arguments for `resultSelector`',
        function() {
      var actual = joinFunc([1, 2], [1, 2],
          function(x) { return x; },
          function(x) { return x; },
          function(l, r, lInd, rInd) {
            return lInd == 1 && rInd == 1 ? 'yes' : 'no';
          }
      );

      deepEqual(actual.sort(), ['no', 'yes']);
    });

  }

  /**
   * Verify that function supports `thisArg` for key and result selectors.
   *
   * @private
   * @static
   * @param {Function} joinFunc The function for test.
   */
  function thisArgTests(joinFunc) {

     test('supports the `outerThis` argument',
        function() {
      var actual = joinFunc([1.2, 1.8], [1.2, 1.8],
          function(num) { return this.round(num); },
          Math.round,
          function(/*l, r*/) { return true; },
          Math
      );

      deepEqual(actual, [true, true]);
    });

    test('supports the `innerThis` argument',
        function() {
      var actual = joinFunc([1.2, 1.8], [1.2, 1.8],
          Math.round,
          function(num) { return this.round(num); },
          function(/*l, r*/) { return true; },
          null, Math
      );

      deepEqual(actual, [true, true]);
    });

    test('supports the `resultThis` argument',
        function() {
      var actual = joinFunc([1.2, 1.8], [1.2, 1.8],
          Math.round, Math.round,
          function(l/*, r*/) { return this.round(l); },
          null, null, Math
      );

      deepEqual(actual, [1, 2]);
    });

  }

  /*----------------------------------------------------------------------*/
  module('lodash.hashJoin', null);

  (function() {

    generalJoinTests('hashJoin');

    keySelectorTests(_.hashJoin);

    resultSelectorTests(_.hashJoin);

    thisArgTests(_.hashJoin);

  })();

  /*----------------------------------------------------------------------*/
  module('lodash.groupJoin', null);

  (function() {

    test('should create `[]` as second part of result if group is empty',
        function(){
      var actual = _.groupJoin([1, 2, 3], [],
          function(obj) { return obj.id; },
          function(obj) { return obj.cusId; },
          function(l, r) { return [l, r]; }
      );

      deepEqual(actual, [[1, []], [2, []], [3, []]]);
    });

    test('should support chaining',
        function() {
      var actual = _(data.customers)
        .groupJoin(data.orders,
          function(obj) { return obj.id; },
          function(obj) { return obj.cusId; },
          function(l, r) { return [l, r]; })
        .map(function (obj) {
            return obj[0].name + ': ' + obj[1].length;
          })
        .value();

      deepEqual(actual, ['John: 3', 'Robert: 1']);
    });

    test('should support unordered non-unique collections',
        function() {
      var actual = _.groupJoin([5, 5, 2, 3, 3, 1], [5, 2, 3, 5],
          function(x) { return x; },
          function(x) { return x; },
          function(l, rGr) { return l && rGr; }
      );

      deepEqual(actual.sort(function(l, r) {
        if (l.length == 0) return -1;
        if (r.length == 0) return 1;
        return l[0] < r[0] ? -1 : 1;
      }), [[], [2], [3], [3], [5, 5], [5, 5]]);
    });

    test('should work with objects for joined collections',
        function() {
      var left = { 'a': 1, 'b': 2, 'c': 3 },
          right = { 'a': 1, 'b': 1, 'c': 2 };

      var actual = _.groupJoin(left, right,
          function(x) { return x; },
          function(x) { return x; },
          function(l, r) { return [l, r]; }
      );

      deepEqual(actual, [[1, [1, 1]], [2, [2]], [3, []]]);
    });

    test('should work with strings for joined collections',
        function() {
      var actual = _.groupJoin('ab', 'ba',
          function(x) { return x; },
          function(x) { return x; },
          function(l, r) { return [l, r]; }
      );

      deepEqual(actual, [['a', ['a']], ['b', ['b']]]);
    });

    test('should work with a numbers and strings as key selectors',
        function() {
      var left = [['one', 'first'], ['two', 'second']],
          right = [{ number: 'one' }, { number: 'two' }];

      var firstJoin = _.groupJoin(left, right,
          0, 'number',
          function(l, rGr) { return l[1] + '-' + rGr[0].number; }
      );
      var secondJoin = _.groupJoin(right, left,
          'number', 0,
          function(l, rGr) { return l.number + '-' + rGr[0][1]; }
      );

      deepEqual(firstJoin, ['first-one', 'second-two']);
      deepEqual(secondJoin, ['one-first', 'two-second']);
    });

    test('should work without key and result selectors',
        function() {
      var actual = _.groupJoin([1, 2, 3], [1, 1, 2]);

      deepEqual(actual, [[1, [1, 1]], [2, [2]], [3, []]]);
    });

    test('should accept only functions as `resultSelector`',
        function() {
      window.throws(function(){
        _.groupJoin([], [],
            function(obj) { return obj; },
            function(obj) { return obj; },
            'some value'
        );
      });
    });

    test('should filter results when `resultSelector` returns `null`',
        function() {
      var all = _.groupJoin([1, 2], [2, 1, 2],
          function(x) { return x; },
          function(x) { return x; },
          function(l, r) { return [l, r]; }
      );
      var filtered = _.groupJoin([1, 2], [2, 1, 2],
          function(x) { return x; },
          function(x) { return x; },
          function(l, rGr) { return rGr.length > 1 ? [l, rGr] : null; }
      );

      deepEqual(all, [[1, [1]], [2, [2, 2]]]);
      deepEqual(filtered, [[2, [2, 2]]]);
    });

    test('supports index argument for `resultSelector`',
        function() {
      var actual = _.groupJoin([1, 2], [1, 2, 1],
          function(x) { return x; },
          function(x) { return x; },
          function(l, rGr, lInd) {
            return lInd == 1 ? 'no' : 'yes';
          }
      );

      deepEqual(actual, ['yes', 'no']);
    });

    thisArgTests(_.groupJoin);

  })();

  /*----------------------------------------------------------------------*/
  module('lodash.mergeJoin', null);

  (function() {

    test('should work with sorted collections',
        function() {
      var res = function(l, r) { return l + r; },
          id = function(x) { return x; },
          left = [1, 3, 5, 5, 7, 7, 8, 9],
          right = [2, 2, 2, 5, 6, 9, 9];

      var first = _.mergeJoin(left, right, id, id, res),
          second = _.mergeJoin(left, right, id, id, res, false),
          third = _.mergeJoin(left, right, id, id, res, true),
          fourth = _.mergeJoin(left, right, id, id, res, false, false),
          fifth = _.mergeJoin(left, right, id, id, res, false, true),
          sixth = _.mergeJoin(left, right, id, id, res, true, false),
          seventh = _.mergeJoin(left, right, id, id, res, true, true);

      var expected = [10, 10, 18, 18];
      deepEqual(first, expected);
      deepEqual(second, expected);
      deepEqual(third, expected);
      deepEqual(fourth, expected);
      deepEqual(fifth, expected);
      deepEqual(sixth, expected);
      deepEqual(seventh, expected);
    });

    test('should supports `isSorted` flags and `thisArg` without conflicts',
        function() {
      var actual = _.mergeJoin([1.2, 1.8], [1.2, 1.8],
          function(num) { return this.round(num); },
          function(num) { return this.round(num); },
          function(l, r) { return this.round(l + r); },
          true, true,
          Math, Math, Math
      );

      deepEqual(actual, [2, 4]);
    });

    generalJoinTests('mergeJoin');

    keySelectorTests(_.mergeJoin);

    resultSelectorTests(_.mergeJoin);

    thisArgTests(_.mergeJoin);

  })();

  /*----------------------------------------------------------------------*/
  module('lodash.uniqueJoin', null);

  (function() {

    test('should support chaining',
        function() {
      var actual = _([1, 2, 3])
        .uniqueJoin([1, 2],
          function(x) { return x; },
          function(x) { return x; },
          function(l, r) { return [l, r]; })
        .countBy('length')
        .value();

      deepEqual(actual, { '2': 2 });
    });

    test('should support non-unique `innerCollection`',
        function() {
      var actual = _.uniqueJoin([1, 2, 4], [1, 2, 2],
          function(x) { return x; },
          function(x) { return x; },
          function(l, r) { return [l, r]; }
      );

      deepEqual(actual, [[1, 1], [2, 2], [2, 2]]);
    });

    keySelectorTests(_.uniqueJoin);

    resultSelectorTests(_.uniqueJoin);

    thisArgTests(_.uniqueJoin);

  })();

})(_);