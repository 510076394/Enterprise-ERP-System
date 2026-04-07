/**
 * supplierService.test.js
 * @description 供应商服务层单元测试
 * @date 2026-03-03
 */

// Mock 数据库连接池
const mockQuery = jest.fn();
jest.mock('../../src/config/db', () => ({
    pool: { query: mockQuery }
}));

// Mock 日志
jest.mock('../../src/utils/logger', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn()
    }
}));

const supplierService = require('../../src/services/supplierService');

describe('supplierService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ==================== getAllSuppliers ====================
    describe('getAllSuppliers', () => {
        it('应返回分页数据（无过滤条件）', async () => {
            mockQuery.mockResolvedValueOnce([[{ total: 30 }]]);
            mockQuery.mockResolvedValueOnce([[
                { id: 1, code: 'SUP001', name: '供应商A', status: 1 },
                { id: 2, code: 'SUP002', name: '供应商B', status: 0 }
            ]]);

            const result = await supplierService.getAllSuppliers(1, 10);

            expect(result.total).toBe(30);
            expect(result.list).toHaveLength(2);
            expect(result.page).toBe(1);
            expect(result.pageSize).toBe(10);
        });

        it('应支持按名称过滤', async () => {
            mockQuery.mockResolvedValueOnce([[{ total: 3 }]]);
            mockQuery.mockResolvedValueOnce([[{ id: 1, code: 'SUP001', name: '钢铁供应商' }]]);

            await supplierService.getAllSuppliers(1, 10, { name: '钢铁' });

            const firstCallArgs = mockQuery.mock.calls[0];
            expect(firstCallArgs[0]).toContain('name LIKE');
            expect(firstCallArgs[1]).toContain('%钢铁%');
        });

        it('应支持按编码过滤', async () => {
            mockQuery.mockResolvedValueOnce([[{ total: 1 }]]);
            mockQuery.mockResolvedValueOnce([[{ id: 1, code: 'SUP001', name: '供应商A' }]]);

            await supplierService.getAllSuppliers(1, 10, { code: 'SUP001' });

            const firstCallArgs = mockQuery.mock.calls[0];
            expect(firstCallArgs[0]).toContain('code LIKE');
        });

        it('应支持按状态过滤', async () => {
            mockQuery.mockResolvedValueOnce([[{ total: 20 }]]);
            mockQuery.mockResolvedValueOnce([[{ id: 1, code: 'SUP001', name: '供应商A', status: 1 }]]);

            await supplierService.getAllSuppliers(1, 10, { status: 1 });

            const firstCallArgs = mockQuery.mock.calls[0];
            expect(firstCallArgs[0]).toContain('status =');
        });

        it('应正确计算分页偏移量', async () => {
            mockQuery.mockResolvedValueOnce([[{ total: 50 }]]);
            mockQuery.mockResolvedValueOnce([[]]);

            await supplierService.getAllSuppliers(2, 15);

            const secondCallSql = mockQuery.mock.calls[1][0];
            expect(secondCallSql).toContain('OFFSET 15');
        });

        it('空数据时应返回空数组和total=0', async () => {
            mockQuery.mockResolvedValueOnce([[{ total: 0 }]]);
            mockQuery.mockResolvedValueOnce([[]]);

            const result = await supplierService.getAllSuppliers(1, 10);

            expect(result.total).toBe(0);
            expect(result.list).toHaveLength(0);
        });
    });

    // ==================== getSupplierById ====================
    describe('getSupplierById', () => {
        it('应返回指定供应商', async () => {
            mockQuery.mockResolvedValueOnce([[
                { id: 1, code: 'SUP001', name: '供应商A', status: 1 }
            ]]);

            const result = await supplierService.getSupplierById(1);

            expect(result).toBeDefined();
            expect(result.id).toBe(1);
            expect(result.code).toBe('SUP001');
        });

        it('供应商不存在时应返回undefined', async () => {
            mockQuery.mockResolvedValueOnce([[]]);

            const result = await supplierService.getSupplierById(999);

            expect(result).toBeUndefined();
        });
    });

    // ==================== createSupplier ====================
    describe('createSupplier', () => {
        it('应成功创建供应商并生成编码', async () => {
            const newSupplier = {
                name: '新供应商',
                contact_person: '李四',
                contact_phone: '13900139000',
                status: 1
            };

            // Mock: 查询最大编码（无现有编码）
            mockQuery.mockResolvedValueOnce([[{ maxCode: null }]]);
            // Mock: INSERT
            mockQuery.mockResolvedValueOnce([{ insertId: 15, affectedRows: 1 }]);

            const result = await supplierService.createSupplier(newSupplier);

            expect(result).toBeDefined();
            expect(result.id).toBe(15);
            expect(result.code).toBeDefined();
            expect(result.code).toMatch(/^GYS\d{4}\d{3}$/);
        });
    });

    // ==================== updateSupplier ====================
    describe('updateSupplier', () => {
        it('应成功更新供应商', async () => {
            mockQuery.mockResolvedValueOnce([[{ id: 1, code: 'SUP001', name: '旧名称', status: 1 }]]);
            mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);
            mockQuery.mockResolvedValueOnce([[{ id: 1, code: 'SUP001', name: '新名称', status: 1 }]]);

            const result = await supplierService.updateSupplier(1, { name: '新名称' });

            expect(result).toBeDefined();
            expect(result.name).toBe('新名称');
        });

        it('供应商不存在时应抛出异常', async () => {
            mockQuery.mockResolvedValueOnce([[]]);

            await expect(supplierService.updateSupplier(999, { name: '测试' }))
                .rejects.toThrow('供应商不存在');
        });

        it('应仅更新validFields白名单中的字段', async () => {
            mockQuery.mockResolvedValueOnce([[{ id: 1, code: 'SUP001', name: '供应商A' }]]);
            mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);
            mockQuery.mockResolvedValueOnce([[{ id: 1, code: 'SUP001', name: '供应商A' }]]);

            await supplierService.updateSupplier(1, {
                name: '供应商A',
                maliciousField: 'injection'
            });

            const updateCallSql = mockQuery.mock.calls[1][0];
            expect(updateCallSql).not.toContain('maliciousField');
        });

        it('无有效更新字段时不应执行UPDATE', async () => {
            mockQuery.mockResolvedValueOnce([[{ id: 1, code: 'SUP001', name: '供应商A' }]]);

            const result = await supplierService.updateSupplier(1, {
                unknownField: 'value'
            });

            // 只有 SELECT 查询，没有 UPDATE 查询
            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(result).toBeDefined();
        });
    });

    // ==================== deleteSupplier ====================
    describe('deleteSupplier', () => {
        it('应成功删除无关联的供应商', async () => {
            // Mock: 检查关联采购订单
            mockQuery.mockResolvedValueOnce([[{ count: 0 }]]);
            // Mock: 检查关联采购收货单
            mockQuery.mockResolvedValueOnce([[{ count: 0 }]]);
            // Mock: 检查关联应付账款
            mockQuery.mockResolvedValueOnce([[{ count: 0 }]]);
            // Mock: DELETE
            mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const result = await supplierService.deleteSupplier(1);

            expect(result).toBe(true);
            expect(mockQuery).toHaveBeenCalledTimes(4);
        });

        it('有关联采购订单时应拒绝删除', async () => {
            mockQuery.mockResolvedValueOnce([[{ count: 3 }]]);

            await expect(supplierService.deleteSupplier(1))
                .rejects.toThrow('无法删除供应商');
        });

        it('有关联应付账款时应拒绝删除', async () => {
            // 采购订单无关联
            mockQuery.mockResolvedValueOnce([[{ count: 0 }]]);
            // 收货单无关联
            mockQuery.mockResolvedValueOnce([[{ count: 0 }]]);
            // 应付账款有关联
            mockQuery.mockResolvedValueOnce([[{ count: 2 }]]);

            await expect(supplierService.deleteSupplier(1))
                .rejects.toThrow('无法删除供应商');
        });
    });
});
