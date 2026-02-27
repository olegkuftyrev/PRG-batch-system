import MenuItem from '#models/menu_item';
import MenuVersion from '#models/menu_version';
import Ws from '#services/ws';
import db from '@adonisjs/lucid/services/db';
import { createMenuItemValidator, updateMenuItemValidator, } from '#validators/menu_item';
import app from '@adonisjs/core/services/app';
import { cuid } from '@adonisjs/core/helpers';
import fs from 'node:fs/promises';
export default class MenuItemsController {
    /**
     * Default hold time in seconds for menu items (time food can safely stay warm)
     */
    static DEFAULT_HOLD_TIME_SECONDS = 600;
    /** GET /api/menu — list items + menu_version */
    async index({ response }) {
        const items = await MenuItem.query().orderBy('code', 'asc');
        const versionRow = await MenuVersion.query().first();
        const menuVersion = versionRow?.version ?? 1;
        response.json({
            items: items.map((m) => m.serialize()),
            menuVersion,
        });
    }
    /** POST /api/menu — create item, bump version */
    async store({ request, response }) {
        const payload = await request.validateUsing(createMenuItemValidator);
        const trx = await db.transaction();
        try {
            const item = await MenuItem.create({
                code: payload.code,
                title: payload.title,
                station: payload.station,
                batchSizes: payload.batchSizes,
                cookTimes: payload.cookTimes,
                enabled: payload.enabled ?? true,
                recommendedBatch: payload.recommendedBatch ?? {},
                color: payload.color ?? null,
                imageUrl: payload.imageUrl ?? null,
                holdTime: payload.holdTime ?? MenuItemsController.DEFAULT_HOLD_TIME_SECONDS,
            }, { client: trx });
            const version = await this.bumpVersion(trx);
            await trx.commit();
            Ws.broadcast('menu_updated', { version });
            response.status(201).json(item.serialize());
        }
        catch (e) {
            await trx.rollback();
            throw e;
        }
    }
    /** PATCH /api/menu/:id — update item, bump version */
    async update({ params, request, response }) {
        const item = await MenuItem.findOrFail(params.id);
        const payload = await request.validateUsing(updateMenuItemValidator);
        const trx = await db.transaction();
        try {
            const updateData = {};
            if (payload.code !== undefined)
                updateData.code = payload.code;
            if (payload.title !== undefined)
                updateData.title = payload.title;
            if (payload.station !== undefined)
                updateData.station = payload.station;
            if (payload.batchSizes !== undefined)
                updateData.batchSizes = payload.batchSizes;
            if (payload.cookTimes !== undefined)
                updateData.cookTimes = payload.cookTimes;
            if (payload.enabled !== undefined)
                updateData.enabled = payload.enabled;
            if (payload.recommendedBatch !== undefined)
                updateData.recommendedBatch = payload.recommendedBatch;
            if (payload.color !== undefined)
                updateData.color = payload.color;
            if (payload.imageUrl !== undefined)
                updateData.imageUrl = payload.imageUrl;
            if (payload.holdTime !== undefined)
                updateData.holdTime = payload.holdTime;
            item.merge(updateData);
            await item.useTransaction(trx).save();
            const version = await this.bumpVersion(trx);
            await trx.commit();
            Ws.broadcast('menu_updated', { version });
            response.json(item.serialize());
        }
        catch (e) {
            await trx.rollback();
            throw e;
        }
    }
    /** DELETE /api/menu/:id — delete item, bump version */
    async destroy({ params, response }) {
        const item = await MenuItem.findOrFail(params.id);
        const trx = await db.transaction();
        try {
            await item.useTransaction(trx).delete();
            const version = await this.bumpVersion(trx);
            await trx.commit();
            Ws.broadcast('menu_updated', { version });
            response.noContent();
        }
        catch (e) {
            await trx.rollback();
            throw e;
        }
    }
    /** POST /api/menu/:id/image — upload menu item image */
    async uploadImage({ params, request, response }) {
        const item = await MenuItem.findOrFail(params.id);
        const image = request.file('image', {
            size: '5mb',
            extnames: ['jpg', 'jpeg', 'png', 'webp'],
        });
        if (!image) {
            return response.badRequest({ error: 'Image file is required' });
        }
        if (!image.isValid) {
            return response.badRequest({ errors: image.errors });
        }
        const uploadsDir = app.makePath('public/uploads');
        await fs.mkdir(uploadsDir, { recursive: true });
        const fileName = `${cuid()}.${image.extname}`;
        await image.move(uploadsDir, { name: fileName });
        if (item.imageUrl) {
            const oldPath = app.makePath('public', item.imageUrl);
            await fs.unlink(oldPath).catch(() => { });
        }
        const imageUrl = `/uploads/${fileName}`;
        item.imageUrl = imageUrl;
        await item.save();
        const trx = await db.transaction();
        try {
            const version = await this.bumpVersion(trx);
            await trx.commit();
            Ws.broadcast('menu_updated', { version });
        }
        catch (e) {
            await trx.rollback();
            throw e;
        }
        return response.json({ imageUrl });
    }
    /** DELETE /api/menu/:id/image — remove menu item image */
    async deleteImage({ params, response }) {
        const item = await MenuItem.findOrFail(params.id);
        if (!item.imageUrl) {
            return response.notFound({ error: 'No image to delete' });
        }
        const imagePath = app.makePath('public', item.imageUrl);
        await fs.unlink(imagePath).catch(() => { });
        item.imageUrl = null;
        await item.save();
        const trx = await db.transaction();
        try {
            const version = await this.bumpVersion(trx);
            await trx.commit();
            Ws.broadcast('menu_updated', { version });
        }
        catch (e) {
            await trx.rollback();
            throw e;
        }
        return response.noContent();
    }
    async bumpVersion(trx) {
        const row = await MenuVersion.query().useTransaction(trx).first();
        if (row) {
            row.version += 1;
            await row.useTransaction(trx).save();
            return row.version;
        }
        else {
            await MenuVersion.create({ version: 1 }, { client: trx });
            return 1;
        }
    }
}
