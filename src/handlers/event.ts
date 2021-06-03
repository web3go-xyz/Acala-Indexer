import { SubstrateEvent } from '@subql/types'
import { Dispatcher } from './utils/dispatcher'
import { ensureBlock } from './block'
import { Event } from '../types'
import { getKVData } from './utils'
import { createExtrinsic, ensuerExtrinsic } from './extrinsic'

type EventDispatch = Dispatcher<SubstrateEvent>

const dispatch = new Dispatcher<SubstrateEvent>()

dispatch.regist('', async (event) => {

})

dispatch.batchRegist([
  {
    key: '',
    handler: async (event) => {

    }
  }
])

export async function ensureEvnet (event: SubstrateEvent) {
  const block = await ensureBlock(event.block)

  const idx = event.idx
  const recordId = `${block.number}-${idx}`

  let data = await Event.get(recordId)

  if (!data) {
    data = new Event(recordId)
    data.index = idx
    data.blockId = block.id

    await data.save()
  }

  return data
}

export async function createEvent (event: SubstrateEvent) {
  const extrinsic = await (event.extrinsic ? ensuerExtrinsic(event.extrinsic) : undefined)

  const data = await ensureEvnet(event)

  const section = event.event.section
  const method = event.event.method
  const eventData = getKVData(event.event.data)
  
  data.section = section
  data.method = method
  data.data = eventData

  if(extrinsic) {
    data.extrinsicId = extrinsic.id
  }

  await dispatch.dispatch(`${section}-${data.method}`, event)

  await data.save()

  return data
}
