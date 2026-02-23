import vine from '@vinejs/vine';
export const createMenuItemValidator = vine.compile(vine.object({
    code: vine.string().trim().minLength(1).maxLength(20),
    title: vine.string().trim().minLength(1).maxLength(100),
    station: vine.enum(['stirfry', 'fryer', 'sides', 'grill']),
    batchSizes: vine.array(vine.string()),
    cookTimes: vine.object({}).allowUnknownProperties(),
    enabled: vine.boolean().optional(),
    recommendedBatch: vine.object({}).allowUnknownProperties(),
    color: vine.enum(['blue', 'red', 'green', 'orange']).nullable().optional(),
    imageUrl: vine.string().trim().maxLength(500).nullable().optional(),
    holdTime: vine.number().min(0).optional(),
}));
export const updateMenuItemValidator = vine.compile(vine.object({
    code: vine.string().trim().minLength(1).maxLength(20).optional(),
    title: vine.string().trim().minLength(1).maxLength(100).optional(),
    station: vine.enum(['stirfry', 'fryer', 'sides', 'grill']).optional(),
    batchSizes: vine.array(vine.string()).optional(),
    cookTimes: vine.object({}).allowUnknownProperties().optional(),
    enabled: vine.boolean().optional(),
    recommendedBatch: vine.object({}).allowUnknownProperties().optional(),
    color: vine.enum(['blue', 'red', 'green', 'orange']).nullable().optional(),
    imageUrl: vine.string().trim().maxLength(500).nullable().optional(),
    holdTime: vine.number().min(0).optional(),
}));
