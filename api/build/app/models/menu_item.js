var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { DateTime } from 'luxon';
import { BaseModel, column } from '@adonisjs/lucid/orm';
export default class MenuItem extends BaseModel {
    static table = 'menu_items';
}
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", Number)
], MenuItem.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], MenuItem.prototype, "code", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], MenuItem.prototype, "title", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], MenuItem.prototype, "station", void 0);
__decorate([
    column({
        prepare: (v) => JSON.stringify(v),
        consume: (v) => (typeof v === 'string' ? JSON.parse(v) : v),
    }),
    __metadata("design:type", Object)
], MenuItem.prototype, "cookTimes", void 0);
__decorate([
    column({
        prepare: (v) => JSON.stringify(v),
        consume: (v) => (typeof v === 'string' ? JSON.parse(v) : v),
    }),
    __metadata("design:type", Array)
], MenuItem.prototype, "batchSizes", void 0);
__decorate([
    column(),
    __metadata("design:type", Boolean)
], MenuItem.prototype, "enabled", void 0);
__decorate([
    column({
        prepare: (v) => JSON.stringify(v),
        consume: (v) => (typeof v === 'string' ? JSON.parse(v) : v),
    }),
    __metadata("design:type", Object)
], MenuItem.prototype, "recommendedBatch", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], MenuItem.prototype, "color", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], MenuItem.prototype, "imageUrl", void 0);
__decorate([
    column(),
    __metadata("design:type", Number)
], MenuItem.prototype, "holdTime", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], MenuItem.prototype, "createdAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", DateTime)
], MenuItem.prototype, "updatedAt", void 0);
