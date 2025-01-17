/**
 * This module includes functions that promote a more functional programming style.
 *
 * @module functools
 */

import { Function } from '../globals/index.js'

/**
 * Creates a function that invokes `fn` with the this binding of `thisArg` and `partials` as partially applied arguments.
 * @param {Function} fn The function to bind.
 * @param {*} thisArg The `this` value of `fn`.
 * @param {...*} [partials] The arguments to prepend to `fn`.
 * @returns {Function} Returns the new bound function.
 * @see {@link partial}
 */
export function bind(fn: Function, thisArg, ...partials) {
  return fn.bind(thisArg, ...partials)
}

/**
 * Creates a function that accepts arguments of `func` and either invokes `func` returning its result, if at least arity number of arguments have been provided, or returns a function that accepts the remaining `func` arguments, and so on. The arity of `func` may be specified if `func.length` is not sufficient.
 * @param {Function} func The function to curry.
 * @returns Returns the new curried function.
 */
export function curry(func: Function) {
  return function curried(...args) {
    if (args.length >= func.length) {
      return func.apply(this, args)
    }

    return (...args2) => {
      return curried.apply(this, args.concat(args2))
    }
  }
}

/**
 * Creates a function that invokes `fn` with partials prepended to the arguments it receives.
 * **Note:** The given function will have `this` bound to `undefined`. If using `this` inside `fn`, consider {@link bind} instead.
 * @param {Function} fn The function to bind.
 * @param {...*} [args] The arguments to apply to `fn`.
 * @returns {Function} Returns the new partially applied function
 */
export function partial(fn, ...args) {
  return bind(fn, undefined, ...args)
}

/**
 * Creates a function composition from a given set of functions that will be each applied on the result of the previous one from left to right.
 * @param {...*} [args] The set of functions to apply.
 * @returns {Function} A new function that applies each given function on the result of the previous one.
 */
export function flow(...args) {
  return (x) => {
    for (const fn of args) {
      x = fn(x)
    }
    return x
  }
}

/**
 * This is just an alias for the {@link flow} function.
 * @see {@link flow}
 */
export const pipe = flow

/**
 * Creates a function composition from a given set of functions that will be each applied on the result of the previous one from right to left.
 * @param {...*} [args] The set of functions to apply.
 * @returns {Function} A new function that applies each given function on the result of the previous step.
 */
export function compose(...args) {
  return flow(args.reverse())
}

/**
 * Creates a function that memoizes the result of `func`. If `resolver` is provided, it determines the cache key for storing the result based on the arguments provided to the memoized function. By default, the first argument provided to the memoized function is used as the map cache key.
 *
 * @param {Function} func The function to have its output memoized.
 * @param {Function} [resolver] The function to resolve the cache key.
 * @return {Function} Returns the new memoized function.
 */
export function memoize<T>(func: Function<T>, resolver?: Function): Function<T> {
  const cache = new Map<any, T>()
  return (...args) => {
    const key = resolver ? resolver(...args) : args[0]
    const prev = cache.get(key)
    if (prev !== undefined) return prev
    const value = func(...args)
    cache.set(key, value)
    return value
  }
}

/**
 * Can be used as a decorator on any function or method to memoize its results.
 * **NOTE:** By default the given function is memoized using it's first argument, regardless of others.
 * @param target
 * @param name
 * @param descriptor
 * @returns A memoized version of the given function
 */
export function cache(target, name, descriptor) {
  const original = descriptor.value
  if (typeof original === 'function') {
    descriptor.value = memoize(original)
  }
  return descriptor
}

/**
 * Creates a debounced function that delays invoking `func` until after `wait` milliseconds have elapsed since the last time the debounced function was invoked. Subsequent calls to the debounced function return the result of the last successful invocation. Provide options to set the `maxWait` milliseconds, regardless of when the function was last invoked.
 *
 * @param {Function} func The function to debounce.
 * @param {number} wait The number of milliseconds to delay.
 * @param {{ maxWait: number }} [opts] The maximum time `func` is allowed to be delayed before it's invoked.
 * @returns Returns the new debounced function.
 */
export function debounce(
  func: Function,
  wait: number,
  { maxWait }: { maxWait?: number } = {}
): Function {
  let timer, maxTimer, lastResult
  return (...args) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      clearTimeout(maxTimer)
      maxTimer = null
      lastResult = func(...args)
    }, wait)

    if (maxWait && !maxTimer) {
      maxTimer = setTimeout(() => {
        clearTimeout(timer)
        maxTimer = null
        lastResult = func(...args)
      }, maxWait)
    }

    return lastResult
  }
}

/**
 * Creates a throttled function that only invokes `func` at most once per every `wait` milliseconds. Subsequent calls to the throttled function return the result of the last successful invocation.
 *
 * @param {Function} func The function to throttle.
 * @param {number} wait The number of milliseconds to throttle invocations to.
 * @return {Function} Returns the new throttled function.
 */
export function throttle(func: Function, wait: number): Function {
  let pending = false
  return (...args) => {
    if (pending) return
    func(...args)
    pending = true
    setTimeout(() => {
      pending = false
    }, wait)
  }
}

/**
 * Creates a function that is restricted to invoking `func` once. Repeat calls to the function return the value of the first invocation. The `func` is invoked with the arguments of the created function.
 *
 * @param {Function} func The function to restrict
 * @returns {Function} Returns the new restricted function.
 * @example
```js
let func = x => x
let single = once(func)
single(1) // 1
single(2) // 1
single(3) // 1
// ...
// `func` is invoked only once.
```
 */
export function once<T>(func: Function<T>): Function<T> {
  let result: T, isCalled
  return (...args) => {
    if (!isCalled) {
      result = func(...args)
      isCalled = true
    }
    return result
  }
}

export type Maybe<T> = T | undefined

export type Result<T, E = any> = [Maybe<T>, Maybe<E>]

export type Optional<T> = Maybe<T>

/**
 * Wraps a function to catch any exceptions inside and return a {@link Result} tuple with the value and error, if any.
 * @template T,E
 * @param {Function<T>} fn The function to wrap.
 * @returns {Function} A new function that wraps `fn` and returns the result tuple.
 */
export function result<T = any, E = unknown>(fn: Function<T>): Function<Result<T, E>> {
  return (...args) => {
    let value, err
    try {
      value = fn(...args)
    } catch (error) {
      err = error
    }
    return [value as T, err as E]
  }
}

/**
 * Wraps an async function to catch any exceptions inside and return a {@link Result} tuple with the value and error, if any.
 * @template T,E
 * @param {Function<Promise<T>>} fn The async function to await.
 * @returns {Function<Promise<Result<T, E>>>} A new function that awaits the given function and returns the result tuple.
 */
export function resultAsync<T = any, E = unknown>(
  fn: Function<Promise<T>>
): Function<Promise<Result<T, E>>> {
  return async (...args) => {
    let value, err
    try {
      value = await fn(...args)
    } catch (error) {
      err = error
    }
    return [value as T, err as E]
  }
}

/**
 * Converts a function that expects a node-style callback argument like `(err, result)` to return a `Promise` instead.
 * @template T
 * @param {Function<T>} fun The given function to convert from callback style to `Promise`.
 * @param {*} thisArg
 * @returns {Function<Promise<T>>} A function that wraps `fun` and returns a `Promise`.
 */
export function promisify<T>(fun: Function, thisArg?): Function<Promise<T>> {
  const original = thisArg ? fun.bind(thisArg) : fun
  return async (...args) => {
    return await new Promise<T>((resolve, reject) =>
      original(...args, (err, result: T) => {
        if (err) return reject(err)
        resolve(result)
      })
    )
  }
}

/**
 * Invokes a given function that accepts callback arguments for success, error and returns a `Promise` of the results.
 * @param {Function} fn A function that accepts callback arguments for success, error.
 * @returns {Promise<T>} A `Promise` that will be resolved when `successCallback` is called or rejected when `errorCallback` is called.
 */
export async function callAsync<T = any>(
  fn: (successCallback: (data: T) => any, errorCallback: Function) => any
) {
  return await new Promise<T>(fn)
}
