import assert from 'assert'
import { any, times } from '../src/itertools/index.js'
import { choice, random, randomInt, sample, shuffle } from '../src/random/index.js'

const randomArr = () => [...times(10, (i) => randomInt(i, 71))]

describe('random', () => {
  it('choice', () => {
    let arr = randomArr()
    for (let i = 0; i < 10; i++) {
      assert(arr.includes(choice(arr)))
    }
  })

  it('random', () => {
    for (let i = 1; i <= 10; i++) {
      let r = random(0, i)
      assert(0 <= r && r < i)
    }
  })

  it('randomInt', () => {
    for (let i = 1; i <= 10; i++) {
      let r = randomInt(0, i)
      assert(0 <= r && r <= i)
    }
  })

  it('shuffle', () => {
    let arr = randomArr()
    let copy = arr.slice()
    for (let i = 0; i < 10; i++) {
      assert(shuffle(copy) === copy)
      assert(copy.some((x, i) => x !== arr[i]))
    }
  })

  it('sample', () => {
    let arr = randomArr()
    for (let i = 0; i < 10; i++) {
      let s = sample(arr, 3)
      assert(s.length === 3)
      assert(s.some((x, i) => x !== arr[i]))
    }
  })
})
