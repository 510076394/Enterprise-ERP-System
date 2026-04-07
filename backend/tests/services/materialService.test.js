/**
 * materialService.test.js
 * @description 物料服务层单元测试
 * @date 2026-03-03
 * 
 * 测试覆盖：
 * - getAllMaterials: 分页查询、多字段过滤
 * - getMaterialById: 单条查询、不存在
 * - createMaterial: 正常创建
 * - updateMaterial: 正常更新、物料不存在
 * - deleteMaterial: 正常删除、关联检查(BOM+库存)
 */

// Mock 数据库连接池
const mockQuery = jest.fn();
const mockExecute = jest.fn();
jest.mock('../../src/config/db', () => ({
    pool: {
        query: mockQuery,
        execute: mockExecute
    }
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

const materialService = require('../../src/services/materialService');

describe('materialService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ==================== getAllMaterials ====================
    describe('getAllMaterials', () => {
        it('应返回分页数据（无过滤条件）', async () => {
            // Mock: COUNT
            mockQuery.mockResolvedValueOnce([[{ total: 50 }]]);
            // Mock: 数据查询
            mockQuery.mockResolvedValueOnce([[
                { id: 1, code: 'M001', name: '铜线', status: 1 },
                { id: 2, code: 'M002', name: '钢板', status: 1 }
            ]]);

            const result = await materialService.getAllMaterials(1, 10);

            expect(result.pagination.total).toBe(50);
            expect(result.data).toHaveLength(2);
            expect(result.pagination.page).toBe(1);
            expect(result.pagination.pageSize).toBe(10);
        });

        it('应支持按名称过滤', async () => {
            mockQuery.mockResolvedValueOnce([[{ total: 3 }]]);
            mockQuery.mockResolvedValueOnce([[
                { id: 1, code: 'M001', name: '铜线A', status: 1 }
            ]]);

            await materialService.getAllMaterials(1, 10, { name: '铜线' });

            const countSql = mockQuery.mock.calls[0][0];
            expect(countSql).toContain('name LIKE');
        });

        it('应支持按分类ID过滤', async () => {
            mockQuery.mockResolvedValueOnce([[{ total: 10 }]]);
            mockQuery.mockResolvedValueOnce([[
                { id: 1, code: 'M001', name: '铜线', category_id: 5 }
            ]]);

            await materialService.getAllMaterials(1, 10, { category_id: 5 });

            const countSql = mockQuery.mock.calls[0][0];
            expect(countSql).toContain('category_id');
        });

        it('应支持按状态过滤', async () => {
            mockQuery.mockResolvedValueOnce([[{ total: 20 }]]);
            mockQuery.mockResolvedValueOnce([[]]);

            await materialService.getAllMaterials(1, 10, { status: 1 });

            const countSql = mockQuery.mock.calls[0][0];
            expect(countSql).toContain('status');
        });

        it('应支持通用搜索关键词', async () => {
            mockQuery.mockResolvedValueOnce([[{ total: 5 }]]);
            mockQuery.mockResolvedValueOnce([[
                { id: 1, code: 'M001', name: '铜线', status: 1 }
            ]]);

            await materialService.getAllMaterials(1, 10, { search: '铜' });

            const countSql = mockQuery.mock.calls[0][0];
            // search应同时搜name/code/specs
            expect(countSql).toContain('name LIKE');
            expect(countSql).toContain('code LIKE');
        });

        it('数据库错误时应抛出异常', async () => {
            mockQuery.mockRejectedValueOnce(new Error('连接超时'));

            await expect(materialService.getAllMaterials(1, 10))
                .rejects.toThrow('连接超时');
        });

        it('应正确计算分页总页数', async () => {
            mockQuery.mockResolvedValueOnce([[{ total: 55 }]]);
            mockQuery.mockResolvedValueOnce([[]]);

            const result = await materialService.getAllMaterials(1, 10);

            expect(result.pagination.totalPages).toBe(6);
        });
    });

    // ==================== getMaterialById ====================
    describe('getMaterialById', () => {
        it('应返回指定物料', async () => {
            // getMaterialById使用pool.execute
            mockExecute.mockResolvedValueOnce([[
                { id: 1, code: 'M001', name: '铜线', unit_id: 3, category_id: 5 }
            ]]);

            const result = await materialService.getMaterialById(1);

            expect(result).toBeDefined();
            expect(result.id).toBe(1);
            expect(result.code).toBe('M001');
        });

        it('物料不存在时应返回null', async () => {
            mockExecute.mockResolvedValueOnce([[]]);

            const result = await materialService.getMaterialById(999);

            expect(result).toBeNull();
        });
    });

    // ==================== createMaterial ====================
    describe('createMaterial', () => {
        it('应成功创建物料（使用execute）', async () => {
            const newMaterial = {
                code: 'M100',
                name: '新物料',
                category_id: 1,
                unit_id: 2,
                status: 1
            };

            // Mock: pool.execute (INSERT)
            mockExecute.mockResolvedValueOnce([{ insertId: 100, affectedRows: 1 }]);

            const result = await materialService.createMaterial(newMaterial);

            expect(result).toBeDefined();
            expect(result.id).toBe(100);
            expect(result.name).toBe('新物料');
            // 验证使用了execute
            expect(mockExecute).toHaveBeenCalledTimes(1);
        });

        it('应自动过滤id/created_at/updated_at字段', async () => {
            const newMaterial = {
                id: 999,
                code: 'M100',
                name: '测试',
                created_at: '2020-01-01',
                updated_at: '2020-01-01'
            };

            mockExecute.mockResolvedValueOnce([{ insertId: 1 }]);

            await materialService.createMaterial(newMaterial);

            const sql = mockExecute.mock.calls[0][0];
            expect(sql).not.toContain('created_at');
            expect(sql).not.toContain('updated_at');
        });
    });

    // ==================== updateMaterial ====================
    describe('updateMaterial', () => {
        it('应成功更新物料', async () => {
            // Mock: 查询是否存在 (updateMaterial使用pool.query检查存在)
            mockQuery.mockResolvedValueOnce([[{ id: 1, code: 'M001', name: '旧名称' }]]);
            // Mock: pool.execute (UPDATE)
            mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const result = await materialService.updateMaterial(1, { name: '新名称' });

            expect(result).toBeDefined();
            expect(result.name).toBe('新名称');
        });

        it('物料不存在时应抛出异常', async () => {
            mockQuery.mockResolvedValueOnce([[]]);  // empty result

            await expect(materialService.updateMaterial(999, { name: '测试' }))
                .rejects.toThrow('物料不存在');
        });

        it('应过滤created_at/updated_at字段', async () => {
            mockQuery.mockResolvedValueOnce([[{ id: 1, code: 'M001' }]]);
            mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);

            await materialService.updateMaterial(1, {
                name: '物料',
                created_at: '2020-01-01',
                updated_at: '2020-01-01'
            });

            const updateSql = mockExecute.mock.calls[0][0];
            expect(updateSql).not.toContain('created_at');
            expect(updateSql).not.toContain('updated_at');
        });
    });

    // ==================== deleteMaterial ====================
    describe('deleteMaterial', () => {
        it('应成功删除无关联的物料', async () => {
            // Mock: 检查BOM详情引用
            mockQuery.mockResolvedValueOnce([[{ count: 0 }]]);
            // Mock: 检查BOM主表引用
            mockQuery.mockResolvedValueOnce([[{ count: 0 }]]);
            // Mock: 检查库存引用
            mockQuery.mockResolvedValueOnce([[{ count: 0 }]]);
            // Mock: DELETE
            mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const result = await materialService.deleteMaterial(1);
            expect(result).toBe(true);
        });

        it('有BOM详情关联时应拒绝删除', async () => {
            // Mock: BOM详情引用
            mockQuery.mockResolvedValueOnce([[{ count: 3 }]]);

            await expect(materialService.deleteMaterial(1))
                .rejects.toThrow('BOM');
        });

        it('有BOM主表关联时应拒绝删除', async () => {
            // BOM详情无引用
            mockQuery.mockResolvedValueOnce([[{ count: 0 }]]);
            // BOM主表有引用
            mockQuery.mockResolvedValueOnce([[{ count: 1 }]]);

            await expect(materialService.deleteMaterial(1))
                .rejects.toThrow('BOM');
        });

        it('有库存记录时应拒绝删除', async () => {
            mockQuery.mockResolvedValueOnce([[{ count: 0 }]]);
            mockQuery.mockResolvedValueOnce([[{ count: 0 }]]);
            mockQuery.mockResolvedValueOnce([[{ count: 5 }]]);

            await expect(materialService.deleteMaterial(1))
                .rejects.toThrow('库存');
        });
    });
});
