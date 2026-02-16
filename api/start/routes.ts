import router from '@adonisjs/core/services/router'
import HealthController from '#controllers/health_controller'

router.get('/health', [HealthController, 'handle'])
router.get('/api/health', [HealthController, 'handle'])
