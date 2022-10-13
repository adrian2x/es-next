/// <reference path='globals.d.ts'/>
/**
 * Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

 *     http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  call,
  isArray,
  isBool,
  isEmpty,
  isFunc,
  isNull,
  isNumber,
  isObject,
  isString,
  keys,
  list,
  NotImplementedError
} from './globals.js'
import { comp, eq, id } from './operators.js'

/**
 * A container type that provides contains().
 *
 * @export
 * @interface Container
 */
export interface Container {
  contains: (x) => boolean
}

/**
 * These are the "rich comparison" methods, as in Python.
 *
 * @export
 * @interface Comparable
 */
export interface Comparable {
  /** x < y: calls this.lt(other) reflection. */
  lt?: (other) => boolean
  /** x ≤ y: calls this.le(other) reflection. */
  le?: (other) => boolean
  /** x == y: calls this.eq(other) reflection. */
  eq: (other) => boolean
  /** x != y: calls this.ne(other) reflection. */
  ne: (other) => boolean
  /** x > y: calls this.gt(other) reflection. */
  gt?: (other) => boolean
  /** x ≥ y: calls this.ge(other) reflection. */
  ge?: (other) => boolean
}

/**
 * A Collection is an iterable container type.
 * This is an abstract base class for user-defined collection types.
 *
 * @export
 * @abstract
 * @class Collection
 * @implements {Container}
 */
export abstract class Collection implements Container {
  /**
   * Returns an iterator for the container items
   * @return {Iterator}
   */
  [Symbol.iterator]() {
    return this
  }

  /**
   * Implements the iterator protocol and returns the next item in the iterable.
   */
  next() {}

  /**
   * Adds a new item to the container.
   * @param item
   */
  add(item) {}

  /**
   * Checks if item is present in the container.
   * @param item
   */
  contains(item) {
    return false
  }

  /**
   * Returns the total number of elements in the container.
   */
  size(): number {
    throw new NotImplementedError()
  }

  /**
   * Remove the first item from the container where `item == x`
   * @raises ValueError when x is not found
   */
  remove(x) {}

  /**
   * Retrieve and remove the item at index `i`.
   * @returns the item or undefined if not found.
   */
  pop(i) {}

  /**
   * Remove all items from the container
   */
  clear() {}
}

/**
 * Implements an iterable that allows backward iteration.
 * @interface Reversible
 */
export interface Reversible<T = unknown> {
  reversed: () => Iterator<T>
}

/**
 * A sequence is an iterable type with efficient index-based access.
 *
 * @export
 * @abstract
 * @class Sequence
 * @extends {Collection}
 * @template T
 */
export abstract class Sequence<T> extends Collection implements Reversible<T> {
  /**
   * Return the item at the given key or index
   * @param {*} key
   * @memberof Sequence
   */
  get(key): T | undefined {
    throw new NotImplementedError()
  }

  /**
   * Set a new value at the given key or index
   *
   * @param {*} key
   * @param {T} val
   * @memberof Sequence
   */
  set(key, val: T) {
    throw new NotImplementedError()
  }

  /**
   * Deletes the given key or index, and its value.
   * Raises ValueError if not key is found.
   *
   * @param {*} key
   * @memberof Sequence
   */
  delete(key) {
    throw new NotImplementedError()
  }

  /**
   * Adds a new item to the end of the sequence.
   *
   * @param {T} x
   * @memberof Sequence
   */
  append(x: T) {}

  /**
   * Append all the items to the sequence.
   *
   * @param {Iterable<T>} iter
   * @memberof Sequence
   */
  extend(iter: Iterable<T>) {}

  /**
   * Return the index of x in the sequence, or undefined if not found.
   *
   * @param {T} item
   * @return {(number | undefined)}
   * @memberof Sequence
   */
  index(item: T): number | undefined {
    throw new NotImplementedError()
  }

  size() {
    return 0
  }

  reversed(): Iterator<T> {
    throw new NotImplementedError()
  }
}

export class FrozenSet<T = any> extends Set<T> {
  constructor(iterable: Iterable<T>) {
    super(iterable)
    return this.freeze()
  }

  add() {
    throw TypeError('FrozenSet cannot be modified.')
    return this // eslint-disable-line
  }

  delete() {
    throw TypeError('FrozenSet cannot be modified.')
    return false // eslint-disable-line
  }

  clear() {
    throw TypeError('FrozenSet cannot be modified.')
    return this // eslint-disable-line
  }

  freeze() {
    return Object.freeze(this)
  }
}

export function namedtuple(...fields: string[]) {
  return (...args) => fields.map((f, i) => [f, args[i]])
}

export type Iteratee = (value: any, index?: PropertyKey, arr?: any[]) => any

export const filter = (fn: any, arr) => {
  if (Array.isArray(arr)) {
    if (isFunc(fn)) return arr.filter(fn)
    if (isString(fn)) return arr.filter((x) => x?.[fn])
    if (isObject(fn)) return arr.filter(matches(fn))
  }
}

export const find = (fn: any, arr) => {
  if (Array.isArray(arr)) {
    if (isFunc(fn)) return arr.find(fn)
    if (isString(fn)) return arr.find((x) => x?.[fn])
    if (isObject(fn)) return arr.find(matches(fn))
  }
}

export const findRight = (fn: any, arr) => {
  if (Array.isArray(arr)) {
    for (let i = arr.length - 1; i >= 0; i--) {
      const x = arr[i]
      if (isFunc(fn)) {
        if (fn(x)) return x
      } else if (isString(fn)) {
        if (x?.[fn]) return x
      } else if (isObject(fn)) {
        if (matches(fn)(x)) return x
      }
    }
  }
}

export const matches = (o) => (x) => {
  for (const key in o) {
    if (!eq(x?.[key], o[key])) return false
  }
  return true
}

export function forEach(fn: Iteratee, arr) {
  if (Array.isArray(arr)) return arr.forEach(fn)
  if (isObject(arr)) {
    return Object.keys(arr).forEach((key) => fn(arr[key], key, arr))
  }
}

export function flatten(arr, depth: boolean | number = 1) {
  if (!depth) return arr
  if (Array.isArray(arr)) return flattenArray(arr, depth)
  if (isObject(arr)) return flattenObj(arr)
  return arr
}

export function flattenArray(arr: any[], depth: boolean | number = 1) {
  if (!depth) return arr
  for (let i = 0; i < arr.length; i++) {
    let value = arr[i]
    if (Array.isArray(value)) {
      value = flatten(value, typeof depth === 'number' ? depth - 1 : depth)
      arr.splice(i, 1, ...value)
    }
  }
  return arr
}

export function flattenObj(o: any, prefix = '', result = {}, keepNull = false) {
  if (isString(o) || isNumber(o) || isBool(o) || (keepNull && isNull(o))) {
    result[prefix] = o
    return result
  }

  if (isArray(o) || isObject(o)) {
    for (const i in o) {
      let pref = prefix
      if (isArray(o)) {
        pref = pref + `[${i}]`
      } else {
        if (isEmpty(prefix)) {
          pref = i
        } else {
          pref = prefix + '.' + i
        }
      }
      flattenObj(o[i], pref, result, keepNull)
    }
    return result
  }
  return result
}

export const map = (fn: any, arr) => {
  if (Array.isArray(arr)) {
    return arr.map((x, i) => {
      if (typeof fn === 'string') return x[fn]
      return fn(x, i, arr)
    })
  }
  if (isObject(arr)) {
    return Object.keys(arr).map((key) => fn(arr[key], key, arr))
  }
}

export function pick(obj, paths: Iteratee | string[]) {
  if (obj == null) {
    return {}
  }
  const result = {}
  if (Array.isArray(paths)) {
    for (const key of paths) {
      result[key] = obj[key]
    }
    return result
  } else if (typeof paths === 'function') {
    for (const key in obj) {
      const value = obj[key]
      if (paths(value, key)) result[key] = value
    }
  }
  return result
}

export function omit(obj, paths: Iteratee | string[]) {
  const result = {}
  for (const key in obj) {
    const value = obj[key]
    if (Array.isArray(paths) && !paths.includes(key)) {
      result[key] = value
    } else if (typeof paths === 'function' && !paths(value, key)) {
      result[key] = value
    }
  }
  return result
}

export function contains(arr, y) {
  const op = call('contains', arr, y)
  if (op != null) return op
  return index(arr, y) >= 0
}

export function index(obj, x, start = 0) {
  let op = call('indexOf', obj, x)
  if (op != null) return op
  op = call('index', obj, x)
  if (op != null) return op
  const length = obj.length
  if (start < 0) {
    start = Math.max(start + length, 0)
  }
  if (isString(obj)) {
    if (start >= length) return -1
    return obj.indexOf(x, start)
  }
  for (; start < length; start++) {
    if (eq(x, obj[start])) return start
  }
  return -1
}

export function clone(obj, deep = false) {
  if (isArray(obj)) {
    return cloneArray(obj, deep)
  }
  if (isObject(obj)) {
    if (isFunc(obj.clone)) {
      return obj.clone()
    }
    const copy = {}
    for (const key of keys(obj)) {
      if (deep) {
        copy[key] = clone(obj[key], deep)
      } else {
        copy[key] = obj[key]
      }
    }
    return copy
  }
  return obj
}

export function cloneArray(arr, deep = false) {
  if (!deep) return list(arr)
  return arr.map((item) => clone(item, deep))
}
export function uniq(arr, fn: string | Iteratee = id) {
  const keys = {}
  for (const x of arr) {
    if (typeof fn === 'function') {
      keys[x] = fn(x)
    } else {
      keys[x] = x[fn]
    }
  }
  return Object.values(keys)
}

export function sortedUniq(arr, fn: string | Iteratee = id) {
  const lst = uniq(arr, fn)
  lst.sort(comp)
  return lst
}
