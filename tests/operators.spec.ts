import assert from 'assert'
import { isEmpty } from '../src/globals/index.js'
import { bool, id, isinstance, not, all, any, comp, shallowEqual } from '../src/operators/index.js'

describe('operators', () => {
  it('id', () => {
    assert(id(true) === true)
    assert(id(false) === false)
    assert(id(3.0) === 3.0)
    assert(id('') === '')
    assert(id(Object) === Object)
  })

  it('all', () => {
    assert(all([1, true, [], 'test', {}]))
    assert(!all([[], {}, '']))
    assert(all([[], {}, ''], isEmpty))
  })

  it('any', () => {
    assert(any([1, true, [], 'test', {}]))
    assert(!any([0, false, '']))
    assert(any([0, false, ''], (x) => !x))
  })

  it('bool', () => {
    assert(bool(1))
    assert(bool(true))
    assert(bool(false) === false)
    assert(not(false))
    assert(not(''))
  })

  it('comp', () => {
    assert(comp(1, 1) === 0)
    assert(comp(2, 3) === -1)
    assert(comp(4, 3) === 1)
  })

  it('isinstance', () => {
    assert(isinstance([], Array))
    assert(isinstance(Array(), Array))
    assert(isinstance(Object(), Object))
    assert(isinstance(new Set(), Set))
    assert(isinstance(new Map(), Map))
  })

  it('shallowEqual', () => {
    assert(shallowEqual({}, {}))
    assert(shallowEqual([], []))
    assert(shallowEqual({ test: true }, { test: true }))
    assert(
      shallowEqual(
        {
          value: 42,
          // custom equals implementation will be used
          eq(other) {
            return this.value === other.value
          }
        },
        { value: 42 }
      )
    )
  })
})
