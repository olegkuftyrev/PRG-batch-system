import vine from '@vinejs/vine';
export const createTicketValidator = vine.compile(vine.object({
    menuItemId: vine.number(),
    batchSize: vine.string(),
    source: vine.enum(['foh', 'drive_thru']),
}));
