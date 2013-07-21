/**
 * Performance benchmark for Lo-dash Join plugin.
 * Uses testing data from jLinq project <https://github.com/hugoware/jlinq-beta>.
 */
;(function(_) {
  'use strict';

  // running indicator
  var running = document.createElement('img');
  running.className = 'running';
  running.src = 'running.gif';

  // all benchmarks
  var suites = [], current = 0;

  // hold some data variables for test
  var bigData, largeArray;

  // register benchmark handlers
  _.extend(Benchmark.Suite.options, {
    onStart: start,
    onCycle: cycle,
    onComplete: complete
  });

  _.extend(Benchmark.options, { async: true });

  // register field for output printing in Suite.prototype
  _.extend(Benchmark.Suite.prototype, { outputNode: null });

  window.addEventListener('load', function() {
    suites[current].run();
  });

  /**
   * Create new div for benchmark output before it started.
   *
   * @private
   * @this Benchmark.Suite Suite object.
   * @memberOf Benchmark.Suite
   */
  function start() {
    console.log(this.name);

    this.outputNode = document.createElement('div');
    this.outputNode.className = 'benchmark';

    var header = document.createElement('div');
    header.className = 'header';
    header.appendChild(document.createTextNode(this.name));
    header.appendChild(running);

    this.outputNode.appendChild(header);
    document.body.appendChild(this.outputNode);
  }

  /**
   * Print result of each benchmark cycle to console and HTML.
   *
   * @private
   * @param {Event} event Event that fires at the end of each cycle.
   * @this Benchmark.Suite Suite object.
   * @memberOf Benchmark.Suite
   */
  function cycle(event) {
    var message = String(event.target);
    console.log(message);

    var item = document.createElement('div');
    item.className = 'item';
    item.appendChild(document.createTextNode(message));
    this.outputNode.appendChild(item);
  }

  /**
   * Print result of the benchmark and handle next suite if needed.
   *
   * @private
   * @this Benchmark.Suite Suite object.
   * @memberOf Benchmark.Suite
   */
  function complete() {
    var message = 'Fastest is ' + this.filter('fastest').pluck('name');
    console.log(message + '\n');

    var footer = document.createElement('div');
    footer.className = 'footer';
    footer.appendChild(document.createTextNode(message));
    this.outputNode.appendChild(footer);

    // process next suite or stop
    if (++current < suites.length) suites[current].run();
    else {
      var header = this.outputNode.firstChild;
      header.removeChild(header.lastChild);
    }
  }

  /*---------------------------------------------------------------*/

  suites.push(Benchmark.Suite('Small Data join')
    .add('lodash.hashJoin', function() {
      return _(data.locations)
        .hashJoin(data.users,
          function(l) { return l.id; },
          function(u) { return u.locationId; },
          function(l, u) { return [u.first, u.last, l.city]; }
        )
        .value().length;
    })
    .add('lodash.mergeJoin', function() {
      return _(data.locations)
        .mergeJoin(data.users,
          function(l) { return l.id; },
          function(u) { return u.locationId; },
          function(l, u) { return [u.first, u.last, l.city]; }
        )
        .value().length;
    })
    .add('lodash.groupJoin', function() {
      return _(data.locations)
        .groupJoin(data.users,
          function(l) { return l.id; },
          function(u) { return u.locationId; },
          function(l, uGr) { return [uGr.length, l.city]; }
        )
        .value().length;
    })
    .add('$linq.join', function() {
      return $linq(data.locations)
        .join(data.users,
          function(l) { return l.id; },
          function(u) { return u.locationId; },
          function(l, u) { return [u.first, u.last, l.city]; }
        )
        .toArray().length;
    })
    .add('LINQ.Join', function() {
      return Enumerable.From(data.locations)
        .Join(data.users,
          function(l) { return l.id; },
          function(u) { return u.locationId; },
          function(l, u) { return [u.first, u.last, l.city]; }
        )
        .ToArray().length;
    })
  );

  suites.push(Benchmark.Suite('Small Data reverse join')
    .add('lodash.hashJoin', function() {
      return _(data.users)
        .hashJoin(data.locations,
          function(u) { return u.locationId; },
          function(l) { return l.id; },
          function(u, l) { return [u.first, u.last, l.city]; }
        )
        .value().length;
    })
    .add('lodash.mergeJoin', function() {
      return _(data.users)
        .mergeJoin(data.locations,
          function(u) { return u.locationId; },
          function(l) { return l.id; },
          function(u, l) { return [u.first, u.last, l.city]; }
        )
        .value().length;
    })
    .add('lodash.mergeJoin [sorted = true]', function() {
      return _(data.users)
        .mergeJoin(data.locations,
          function(u) { return u.locationId; },
          function(l) { return l.id; },
          function(u, l) { return [u.first, u.last, l.city]; },
          false, true
        )
        .value().length;
    })
    .add('lodash.groupJoin', function() {
      return _(data.users)
        .groupJoin(data.locations,
          function(u) { return u.locationId; },
          function(l) { return l.id; },
          function(u, lGr) { return [u.first, u.last, lGr.length]; }
        )
        .value().length;
    })
    .add('$linq.join', function() {
      return $linq(data.users)
        .join(data.locations,
          function(u) { return u.locationId; },
          function(l) { return l.id; },
          function(u, l) { return [u.first, u.last, l.city]; }
        )
        .toArray().length;
    })
    .add('LINQ.Join', function() {
      return Enumerable.From(data.users)
        .Join(data.locations,
          function(u) { return u.locationId; },
          function(l) { return l.id; },
          function(u, l) { return [u.first, u.last, l.city]; }
        )
        .ToArray().length;
    })
  );

  suites.push(Benchmark.Suite('Medium Data chained joins')
    .add('lodash.hashJoin', function() {
      return _(data.employees)
        .hashJoin(data.orders,
          function(e) { return e.empId; },
          function(o) { return o.empId; },
          function(l, r) { return [l, r]; }
        )
        .hashJoin(data.customers,
          function(p) { return p[1].cusId; },
          function(c) { return c.cusId;},
          function(l, r) { return [l[0], r];}
        )
        .value().length;
    })
    .add('lodash.mergeJoin', function() {
      return _(data.employees)
        .mergeJoin(data.orders,
          function(e) { return e.empId; },
          function(o) { return o.empId; },
          function(l, r) { return [l, r]; }
        )
        .mergeJoin(data.customers,
          function(p) { return p[1].cusId; },
          function(c) { return c.cusId;},
          function(l, r) { return [l[0], r];}
        )
        .value().length;
    })
    .add('$linq.join', function() {
      return $linq(data.employees)
        .join(data.orders,
          function(e) { return e.empId; },
          function(o) { return o.empId; },
          function(l, r) { return [l, r]; }
        )
        .join(data.customers,
          function(p) { return p[1].cusId; },
          function(c) { return c.cusId;},
          function(l, r) { return [l[0], r];}
        )
        .toArray().length;
    })
    .add('LINQ.Join', function() {
      return Enumerable.From(data.employees)
        .Join(data.orders,
          function(e) { return e.empId; },
          function(o) { return o.empId; },
          function(l, r) { return [l, r]; }
        )
        .Join(data.customers,
          function(p) { return p[1].cusId; },
          function(c) { return c.cusId;},
          function(l, r) { return [l[0], r];}
        )
        .ToArray().length;
    })
  );

  suites.push(Benchmark.Suite('Medium Data self join')
    .add('lodash.hashJoin', function() {
      return _(data.orders)
        .hashJoin(data.orders,
          function(o) { return o.cusId; },
          function(o) { return o.cusId; },
          function(l, r) { return [l, r]; }
        )
        .value().length;
    })
    .add('lodash.mergeJoin', function() {
      return _(data.orders)
        .mergeJoin(data.orders,
          function(o) { return o.cusId; },
          function(o) { return o.cusId; },
          function(l, r) { return [l, r]; }
        )
        .value().length;
    })
    .add('lodash.groupJoin', function() {
      return _(data.orders)
        .groupJoin(data.orders,
          function(o) { return o.cusId; },
          function(o) { return o.cusId; },
          function(l, rGr) { return [l, rGr.length]; }
        )
        .value().length;
    })
    .add('$linq.join', function() {
      return $linq(data.orders)
        .join(data.orders,
          function(o) { return o.cusId; },
          function(o) { return o.cusId; },
          function(l, r) { return [l, r]; }
        )
        .toArray().length;
    })
    .add('LINQ.Join', function() {
      return Enumerable.From(data.orders)
        .Join(data.orders,
          function(o) { return o.cusId; },
          function(o) { return o.cusId; },
          function(l, r) { return [l, r]; }
        )
        .ToArray().length;
    })
  );

  suites.push(Benchmark.Suite('Medium Data unique join')
    .add('lodash.hashJoin', function() {
      return _(data.orders)
        .hashJoin(data.orders,
          function(o) { return o.orderId; },
          function(o) { return o.orderId; },
          function(l, r) { return [l, r]; }
        )
        .value().length;
    })
    .add('lodash.mergeJoin', function() {
      return _(data.orders)
        .mergeJoin(data.orders,
          function(o) { return o.orderId; },
          function(o) { return o.orderId; },
          function(l, r) { return [l, r]; }
        )
        .value().length;
    })
    .add('lodash.mergeJoin [sorted = true]', function() {
      return _(data.orders)
        .mergeJoin(data.orders,
          function(o) { return o.orderId; },
          function(o) { return o.orderId; },
          function(l, r) { return [l, r]; },
          true, true
        )
        .value().length;
    })
    .add('lodash.uniqueJoin', function() {
      return _(data.orders)
        .uniqueJoin(data.orders,
          function(o) { return o.orderId; },
          function(o) { return o.orderId; },
          function(l, r) { return [l, r]; }
        )
        .value().length;
    })
    .add('$linq.join', function() {
      return $linq(data.orders)
        .join(data.orders,
          function(o) { return o.orderId; },
          function(o) { return o.orderId; },
          function(l, r) { return [l, r]; }
        )
        .toArray().length;
    })
    .add('LINQ.Join', function() {
      return Enumerable.From(data.orders)
        .Join(data.orders,
          function(o) { return o.orderId; },
          function(o) { return o.orderId; },
          function(l, r) { return [l, r]; }
        )
        .ToArray().length;
    })
  );

  suites.push(Benchmark.Suite('Large Array self join', {
    onStart: function() {
      // call default method
      start.call(this);

      // produce large array
      largeArray = [];
      for (var i = 0; i < 65536; ++i){
        largeArray.push(i % 16384);
      }
      _.shuffle(largeArray);
    }})
    .add('lodash.hashJoin', function() {
      return _(largeArray)
        .hashJoin(largeArray,
          function(x) { return x; },
          function(x) { return x; },
          function(l, r) { return [l, r]; }
        )
        .value().length;
    })
    .add('lodash.mergeJoin', function() {
      return _(largeArray)
        .mergeJoin(largeArray,
          function(x) { return x; },
          function(x) { return x; },
          function(l, r) { return [l, r]; }
        )
        .value().length;
    })
    .add('lodash.groupJoin', function() {
      return _(largeArray)
        .groupJoin(largeArray,
          function(x) { return x; },
          function(x) { return x; },
          function(l, rGr) { return [l, rGr.length]; }
        )
        .value().length;
    })
    .add('LINQ.Join', function() {
      return Enumerable.From(largeArray)
        .Join(largeArray,
          function(x) { return x; },
          function(x) { return x; },
          function(l, r) { return [l, r]; }
        )
        .ToArray().length;
    })
  );

  suites.push(Benchmark.Suite('Big Data self join', {
    onStart: function() {
      // call default method
      start.call(this);

      // produce big data set
      bigData = [];
      var length = data.orders.length;
      for (var i = 0; i < 32768; ++i){
        bigData.push(data.orders[i % length]);
      }
      _.shuffle(bigData);
    }})
    .add('lodash.hashJoin', function() {
      return _(bigData)
        .hashJoin(bigData,
          function(o) { return o.orderId; },
          function(o) { return o.orderId; },
          function(l, r) { return [l, r]; }
        )
        .value().length;
    })
    .add('lodash.mergeJoin', function() {
      return _(bigData)
        .mergeJoin(bigData,
          function(o) { return o.orderId; },
          function(o) { return o.orderId; },
          function(l, r) { return [l, r]; }
        )
        .value().length;
    })
    .add('lodash.groupJoin', function() {
      return _(bigData)
        .groupJoin(bigData,
          function(o) { return o.orderId; },
          function(o) { return o.orderId; },
          function(l, rGr) { return [l, rGr.length]; }
        )
        .value().length;
    })
    .add('LINQ.Join', function() {
      return Enumerable.From(bigData)
        .Join(bigData,
          function(o) { return o.orderId; },
          function(o) { return o.orderId; },
          function(l, r) { return [l, r]; }
        )
        .ToArray().length;
    })
  );

})(_);