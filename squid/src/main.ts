import {TypeormDatabase} from '@subsquid/typeorm-store'
import {Address} from './model'
import {processor} from './processor'
import {EntityBuffer} from './entityBuffer'

processor.run(new TypeormDatabase({supportHotBlocks: true}), async (ctx) => {
    for (let c of ctx.blocks) {
        for (let tx of c.transactions) {
            if (tx.value.toString() == '0') continue
            EntityBuffer.add(
                new Address({
                    id: tx.id,
                })
            )
        }
    }
    for (let entities of EntityBuffer.flush()) {
        await ctx.store.upsert(entities)
    }
})
