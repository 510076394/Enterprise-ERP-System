/**
 * 采购管理模块路由
 */
import ModuleContainer from '../../components/common/ModuleContainer.vue'

export default {
    path: 'purchase',
    name: 'purchase',
    component: ModuleContainer,
    props: { moduleName: 'purchase' },
    meta: {
        requiresAuth: true,
        permission: 'purchase'
    },
    children: [
        {
            path: '',
            name: 'purchase-dashboard',
            redirect: '/dataoverview/purchase'
        },
        {
            path: 'dashboard',
            name: 'purchase-dashboard-redirect',
            redirect: '/dataoverview/purchase'
        },
        {
            path: 'requisitions',
            name: 'purchase-requisitions',
            component: () => import('../../views/purchase/PurchaseRequisitions.vue'),
            meta: {
                requiresAuth: true,
                permission: 'purchase:requisitions'
            }
        },
        {
            path: 'orders',
            name: 'purchase-orders',
            component: () => import('../../views/purchase/PurchaseOrders.vue'),
            meta: {
                requiresAuth: true,
                permission: 'purchase:orders'
            }
        },
        {
            path: 'receipts',
            name: 'purchase-receipts',
            component: () => import('../../views/purchase/PurchaseReceipts.vue'),
            meta: {
                requiresAuth: true,
                permission: 'purchase:receipts'
            }
        },
        {
            path: 'returns',
            name: 'purchase-returns',
            component: () => import('../../views/purchase/PurchaseReturns.vue'),
            meta: {
                requiresAuth: true,
                permission: 'purchase:returns'
            }
        },
        {
            path: 'processing',
            name: 'outsourced-processing',
            component: () => import('../../views/purchase/OutsourcedProcessing.vue'),
            meta: {
                requiresAuth: true,
                permission: 'purchase:processing'
            }
        },
        {
            path: 'processing-receipts',
            name: 'outsourced-processing-receipts',
            component: () => import('../../views/purchase/OutsourcedReceipts.vue'),
            meta: {
                requiresAuth: true,
                permission: 'purchase:processing-receipts'
            }
        },
        {
            path: 'history',
            name: 'purchase-history',
            component: () => import('../../views/purchase/PurchaseHistory.vue'),
            meta: {
                requiresAuth: true,
                permission: 'purchase:history'
            }
        }
    ]
}
