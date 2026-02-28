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
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm';
import MenuItem from './menu_item.js';
export default class Ticket extends BaseModel {
    static table = 'tickets';
    serialize() {
        return {
            id: this.id,
            menuItemId: this.menuItemId,
            station: this.station,
            stationSeq: this.stationSeq,
            stationDay: this.stationDay.toISO(),
            state: this.state,
            source: this.source,
            createdAt: this.createdAt?.toISO(),
            startedAt: this.startedAt?.toISO(),
            durationSeconds: this.durationSeconds,
            menuVersionAtCall: this.menuVersionAtCall,
            itemTitleSnapshot: this.itemTitleSnapshot,
            batchSizeSnapshot: this.batchSizeSnapshot,
            durationSnapshot: this.durationSnapshot,
            priority: this.priority ?? false,
            updatedAt: this.updatedAt.toISO(),
        };
    }
}
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", Number)
], Ticket.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", Number)
], Ticket.prototype, "menuItemId", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Ticket.prototype, "station", void 0);
__decorate([
    column(),
    __metadata("design:type", Number)
], Ticket.prototype, "stationSeq", void 0);
__decorate([
    column.date(),
    __metadata("design:type", DateTime)
], Ticket.prototype, "stationDay", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Ticket.prototype, "state", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Ticket.prototype, "source", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], Ticket.prototype, "createdAt", void 0);
__decorate([
    column.dateTime(),
    __metadata("design:type", Object)
], Ticket.prototype, "startedAt", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], Ticket.prototype, "durationSeconds", void 0);
__decorate([
    column(),
    __metadata("design:type", Number)
], Ticket.prototype, "menuVersionAtCall", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Ticket.prototype, "itemTitleSnapshot", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Ticket.prototype, "batchSizeSnapshot", void 0);
__decorate([
    column(),
    __metadata("design:type", Number)
], Ticket.prototype, "durationSnapshot", void 0);
__decorate([
    column(),
    __metadata("design:type", Boolean)
], Ticket.prototype, "priority", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", DateTime)
], Ticket.prototype, "updatedAt", void 0);
__decorate([
    belongsTo(() => MenuItem),
    __metadata("design:type", Object)
], Ticket.prototype, "menuItem", void 0);
