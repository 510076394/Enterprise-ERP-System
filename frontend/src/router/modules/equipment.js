/**
 * 设备管理模块路由
 */
import ModuleContainer from '../../components/common/ModuleContainer.vue'

export default {
    path: 'equipment',
    name: 'equipment',
    component: ModuleContainer,
    props: { moduleName: 'equipment' },
    meta: {
        requiresAuth: true,
        permission: 'equipment'
    },
    children: [
        {
            path: '',
            name: 'equipment-dashboard',
            redirect: '/equipment/list'
        },
        {
            path: 'list',
            name: 'equipment-list',
            component: () => import('../../views/equipment/EquipmentList.vue'),
            meta: {
                requiresAuth: true,
                permission: 'equipment:list'
            }
        },
        {
            path: 'maintenance',
            name: 'equipment-maintenance',
            component: () => import('../../views/equipment/Maintenance.vue'),
            meta: {
                requiresAuth: true,
                permission: 'equipment:maintenance'
            }
        },
        {
            path: 'inspection',
            name: 'equipment-inspection',
            component: () => import('../../views/equipment/Inspection.vue'),
            meta: {
                requiresAuth: true,
                permission: 'equipment:inspection'
            }
        },
        {
            path: 'status',
            name: 'equipment-status',
            component: () => import('../../views/equipment/Status.vue'),
            meta: {
                requiresAuth: true,
                permission: 'equipment:status'
            }
        }
    ]
}
