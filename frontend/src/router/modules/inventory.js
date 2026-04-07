/**
 * 库存管理模块路由
 */
export default {
    path: 'inventory',
    name: 'inventory',
    component: () => import('../../views/inventory/InventoryManagement.vue'),
    meta: {
        requiresAuth: true,
        permission: 'inventory'
    },
    children: [
        {
            path: '',
            name: 'inventory-dashboard',
            redirect: '/inventory/stock'
        },
        {
            path: 'stock',
            name: 'inventory-stock',
            component: () => import('../../views/inventory/InventoryStock.vue'),
            meta: {
                requiresAuth: true,
                permission: 'inventory:stock'
            }
        },
        {
            path: 'inbound',
            name: 'inventory-inbound',
            component: () => import('../../views/inventory/InventoryInbound.vue'),
            meta: {
                requiresAuth: true,
                permission: 'inventory:inbound'
            }
        },
        {
            path: 'outbound',
            name: 'inventory-outbound',
            component: () => import('../../views/inventory/InventoryOutbound.vue'),
            meta: {
                requiresAuth: true,
                permission: 'inventory:outbound'
            }
        },
        {
            path: 'manual-transaction',
            name: 'inventory-manual-transaction',
            component: () => import('../../views/inventory/ManualTransaction.vue'),
            meta: {
                requiresAuth: true,
                permission: 'inventory:manual-transaction'
            }
        },
        {
            path: 'transfer',
            name: 'inventory-transfer',
            component: () => import('../../views/inventory/InventoryTransfer.vue'),
            meta: {
                requiresAuth: true,
                permission: 'inventory:transfer'
            }
        },
        {
            path: 'check',
            name: 'inventory-check',
            component: () => import('../../views/inventory/InventoryCheck.vue'),
            meta: {
                requiresAuth: true,
                permission: 'inventory:check'
            }
        },
        {
            path: 'report',
            name: 'inventory-report',
            component: () => import('../../views/inventory/InventoryReport.vue'),
            meta: {
                requiresAuth: true,
                permission: 'inventory:report'
            }
        },
        {
            path: 'year-end',
            name: 'inventory-year-end',
            component: () => import('../../views/inventory/InventoryYearEnd.vue'),
            meta: {
                requiresAuth: true,
                permission: 'inventory:stock'
            }
        },
        {
            path: 'transaction',
            name: 'inventory-transaction',
            component: () => import('../../views/inventory/InventoryTransaction.vue'),
            meta: {
                requiresAuth: true,
                permission: 'inventory:transaction'
            }
        }
    ]
}
