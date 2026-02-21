import app from '@adonisjs/core/services/app';
import { ExceptionHandler } from '@adonisjs/core/http';
export default class HttpExceptionHandler extends ExceptionHandler {
    debug = !app.inProduction;
    async handle(error, ctx) {
        return super.handle(error, ctx);
    }
    async report(error, _ctx) {
        return super.report(error, _ctx);
    }
}
