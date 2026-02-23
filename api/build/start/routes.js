import router from '@adonisjs/core/services/router';
import HealthController from '#controllers/health_controller';
import MenuItemsController from '#controllers/menu_items_controller';
import TicketsController from '#controllers/tickets_controller';
import app from '@adonisjs/core/services/app';
router.get('/health', [HealthController, 'handle']);
router.get('/api/health', [HealthController, 'handle']);
router.get('/uploads/*', ({ request, response }) => {
    const filePath = request.url().replace('/uploads/', '');
    return response.download(app.makePath('public/uploads', filePath));
});
router.group(() => {
    router.get('/', [MenuItemsController, 'index']);
    router.post('/', [MenuItemsController, 'store']);
    router.patch('/:id', [MenuItemsController, 'update']);
    router.delete('/:id', [MenuItemsController, 'destroy']);
    router.post('/:id/image', [MenuItemsController, 'uploadImage']);
    router.delete('/:id/image', [MenuItemsController, 'deleteImage']);
}).prefix('/api/menu').use([]);
router.group(() => {
    router.get('/', [TicketsController, 'index']);
    router.post('/', [TicketsController, 'store']);
    router.post('/:id/start', [TicketsController, 'start']);
    router.post('/:id/complete', [TicketsController, 'complete']);
}).prefix('/api/tickets').use([]);
