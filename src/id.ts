import {JsonRpcIdGenerator} from './types'

function uuidV4() {
  if (typeof globalThis.crypto !== 'undefined') {
    if (typeof globalThis.crypto.randomUUID === 'function') {
      return globalThis.crypto.randomUUID()
    }
    if (typeof globalThis.crypto.getRandomValues === 'function') {
      const buffer = new Uint8Array(16)
      crypto.getRandomValues(buffer)
      buffer[6] = (buffer[6] & 0x0f) | 0x40 // Version 4
      buffer[8] = (buffer[8] & 0x3f) | 0x80 // Variant 10xx
      const hexArr = new Array(16)
      for (let i = 0; i < 16; i++) {
        hexArr[i] = buffer[i].toString(16).padStart(2, '0')
      }
      return `${hexArr[0] + hexArr[1] + hexArr[2] + hexArr[3]}-${hexArr[4]}${
        hexArr[5]
      }-${hexArr[6]}${hexArr[7]}-${hexArr[8]}${hexArr[9]}-${hexArr[10]}${
        hexArr[11]
      }${hexArr[12]}${hexArr[13]}${hexArr[14]}${hexArr[15]}`
    }
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * @description 优点: 速度快, 唯一性高，缺点:无法跨线程和上下文使用
 * @description_en Advantages: fast, high uniqueness, disadvantages: cannot be used across threads and contexts
 */
export class CounterIdGenerator extends JsonRpcIdGenerator {
  private count = 0

  public next() {
    return this.count++
  }
}

/**
 * @description 优点: 唯一性高,本地实现兼容性极高, 缺点: 速度较慢
 * @description_en Advantages: high uniqueness, local implementation compatibility is extremely high, disadvantages: slower speed
 */
export class UuidV4IdGenerator extends JsonRpcIdGenerator {
  public next() {
    return uuidV4()
  }
}

/**
 * @description 优点: 在速率稳定的情况下唯一性高且速度快,值是具备意义的方便调试 缺点: 在高并发的情况下可能存在冲突
 * @description_en Advantages: high uniqueness and fast speed under stable rate, values are meaningful for debugging, disadvantages: conflicts may occur in high concurrency
 */
export class TimestampIdGenerator extends JsonRpcIdGenerator {
  public next() {
    return Date.now()
  }
}

/**
 * @description {@link TimestampIdGenerator}的基础上增加了随机数
 * @description_enAdded random number based on {@link TimestampIdGenerator}
 */
export class TimestampWithRandomIdGenerator extends JsonRpcIdGenerator {
  public next() {
    return `${Date.now()}-${Math.floor(Math.random() * 1000000)}`
  }
}
