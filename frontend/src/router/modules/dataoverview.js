/**
 * 数据概览模块路由
 */
import ModuleContainer from '../../components/common/ModuleContainer.vue'

export default {
    path: 'dataoverview',
    name: 'dataoverview',
    component: ModuleContainer,
    props: { moduleName: 'dataoverview', padding: true },
    meta: {
        requiresAuth: true,
        permission: 'dataoverview'
    },
    children: [
        {
            path: '',
            name: 'dataOverview-dashboard',
            redirect: '/dataoverview/production'
        },
        {
            path: 'production',
            name: 'production-dashboard',
            component: () => import('../../views/dataOverview/ProductionDashboard.vue'),
            meta: {
                requiresAuth: true,
                permission: 'dataoverview:production'
            }
        },
        {
            path: 'inventory',
            name: 'inventory-dashboard-view',
            component: () => import('../../views/dataOverview/InventoryDashboard.vue'),
            meta: {
                requiresAuth: true,
                permission: 'dataoverview:inventory'
            }
        },
        {
            path: 'sales',
            name: 'sales-dashboard-view',
            component: () => import('../../views/dataOverview/SalesDashboard.vue'),
            meta: {
                requiresAuth: true,
                permission: 'dataoverview:sales'
            }
        },
        {
            path: 'finance',
            name: 'finance-dashboard-view',
            component: () => import('../../views/dataOverview/FinanceDashboard.vue'),
            meta: {
                requiresAuth: true,
                permission: 'dataoverview:finance'
            }
        },
        {
            path: 'quality',
            name: 'quality-dashboard-view',
            component: () => import('../../views/dataOverview/QualityDashboard.vue'),
            meta: {
                requiresAuth: true,
                permission: 'dataoverview:quality'
            }
        },
        {
            path: 'purchase',
            name: 'purchase-dashboard-view',
            component: () => import(/* webpackChunkName: "purchase-dashboard" */ '../../views/dataOverview/PurchaseDashboard.vue'),
            meta: {
                requiresAuth: true,
                permission: 'dataoverview:purchase'
            }
        }
    ]
}
