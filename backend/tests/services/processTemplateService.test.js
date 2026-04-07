/**
 * processTemplateService.test.js
 * @description 工序模板服务层单元测试
 * @date 2026-03-03
 * 
 * 测试覆盖：
 * - getAll: 分页查询、过滤
 * - getById: 单条查询+详情
 * - create: 事务创建+详情
 * - update: 事务更新+先删后插
 * - delete: 事务删除
 * - updateStatus: 状态更新
 */

// Mock 连接对象（事务）
const mockRelease = jest.fn();
const mockBeginTransaction = jest.fn();
const mockCommit = jest.fn();
const mockRollback = jest.fn();
const mockConnectionQuery = jest.fn();

const mockConnection = {
    beginTransaction: mockBeginTransaction,
    commit: mockCommit,
    rollback: mockRollback,
    query: mockConnectionQuery,
    release: mockRelease
};

// Mock 数据库连接池
const mockQuery = jest.fn();
const mockGetConnection = jest.fn().mockResolvedValue(mockConnection);

jest.mock('../../src/config/db', () => ({
    pool: {
        query: mockQuery,
        getConnection: mockGetConnection
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

const processTemplateService = require('../../src/services/processTemplateService');

describe('processTemplateService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ==================== getAll ====================
    describe('getAll', () => {
        it('应返回分页数据（无过滤）', async () => {
            // Mock: COUNT
            mockQuery.mockResolvedValueOnce([[{ total: 15 }]]);
            // Mock: 列表
            mockQuery.mockResolvedValueOnce([[
                { id: 1, name: '模板A', code: 'PT001' },
                { id: 2, name: '模板B', code: 'PT002' }
            ]]);
            // Mock: 批量详情
            mockQuery.mockResolvedValueOnce([[
                { template_id: 1, name: '工序1', order_num: 1 },
                { template_id: 1, name: '工序2', order_num: 2 },
                { template_id: 2, name: '工序1', order_num: 1 }
            ]]);

            const result = await processTemplateService.getAll(1, 10);

            expect(result.total).toBe(15);
            expect(result.list).toHaveLength(2);
            expect(result.list[0].details).toHaveLength(2);
            expect(result.list[1].details).toHaveLength(1);
        });

        it('应支持按名称过滤', async () => {
            mockQuery.mockResolvedValueOnce([[{ total: 3 }]]);
            mockQuery.mockResolvedValueOnce([[
                { id: 1, name: '焊接模板', code: 'PT001' }
            ]]);
            mockQuery.mockResolvedValueOnce([[
                { template_id: 1, name: '预热', order_num: 1 }
            ]]);

            await processTemplateService.getAll(1, 10, { name: '焊接' });

            const countSql = mockQuery.mock.calls[0][0];
            expect(countSql).toContain('name LIKE');
        });

        it('空列表时不应查询详情', async () => {
            mockQuery.mockResolvedValueOnce([[{ total: 0 }]]);
            mockQuery.mockResolvedValueOnce([[]]);

            const result = await processTemplateService.getAll(1, 10);

            expect(result.list).toHaveLength(0);
            // 只调用2次（count+list），不调用详情查询
            expect(mockQuery).toHaveBeenCalledTimes(2);
        });
    });

    // ==================== getById ====================
    describe('getById', () => {
        it('应返回模板及其详情', async () => {
            mockQuery.mockResolvedValueOnce([[{ id: 1, name: '模板A', code: 'PT001' }]]);
            mockQuery.mockResolvedValueOnce([[
                { template_id: 1, name: '工序1', order_num: 1 },
                { template_id: 1, name: '工序2', order_num: 2 }
            ]]);

            const result = await processTemplateService.getById(1);

            expect(result).toBeDefined();
            expect(result.id).toBe(1);
            expect(result.details).toHaveLength(2);
        });

        it('模板不存在时应返回null', async () => {
            mockQuery.mockResolvedValueOnce([[]]);

            const result = await processTemplateService.getById(999);

            expect(result).toBeNull();
        });
    });

    // ==================== create ====================
    describe('create', () => {
        it('应在事务中创建模板及详情', async () => {
            const templateData = {
                name: '新模板',
                code: 'PT100',
                description: '测试',
                product_id: 1,
                details: [
                    { name: '工序1', order_num: 1, standard_hours: 2 },
                    { name: '工序2', order_num: 2, standard_hours: 1.5 }
                ]
            };

            mockConnectionQuery.mockResolvedValueOnce([{ insertId: 100 }]);
            mockConnectionQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);
            mockConnectionQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const result = await processTemplateService.create(templateData);

            expect(mockBeginTransaction).toHaveBeenCalled();
            expect(mockCommit).toHaveBeenCalled();
            expect(mockRelease).toHaveBeenCalled();
            expect(result.id).toBe(100);
            // INSERT模板 + 2x INSERT详情
            expect(mockConnectionQuery).toHaveBeenCalledTimes(3);
        });

        it('失败时应回滚事务', async () => {
            mockConnectionQuery.mockRejectedValueOnce(new Error('插入失败'));

            await expect(processTemplateService.create({ name: '测试' }))
                .rejects.toThrow('插入失败');

            expect(mockRollback).toHaveBeenCalled();
            expect(mockRelease).toHaveBeenCalled();
        });
    });

    // ==================== update ====================
    describe('update', () => {
        it('应先删后插更新详情', async () => {
            const updateData = {
                name: '更新模板',
                description: '更新描述',
                details: [{ name: '新工序1', order_num: 1 }]
            };

            // UPDATE模板
            mockConnectionQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);
            // DELETE旧详情
            mockConnectionQuery.mockResolvedValueOnce([{ affectedRows: 3 }]);
            // INSERT新详情
            mockConnectionQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const result = await processTemplateService.update(1, updateData);

            expect(result).toBe(true);
            expect(mockBeginTransaction).toHaveBeenCalled();
            expect(mockCommit).toHaveBeenCalled();
            // UPDATE + DELETE + INSERT
            expect(mockConnectionQuery).toHaveBeenCalledTimes(3);
        });
    });

    // ==================== delete ====================
    describe('delete', () => {
        it('应在事务中删除模板和详情', async () => {
            // DELETE详情
            mockConnectionQuery.mockResolvedValueOnce([{ affectedRows: 5 }]);
            // DELETE模板
            mockConnectionQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const result = await processTemplateService.delete(1);

            expect(result).toBe(true);
            expect(mockBeginTransaction).toHaveBeenCalled();
            expect(mockCommit).toHaveBeenCalled();
        });

        it('失败时应回滚', async () => {
            mockConnectionQuery.mockRejectedValueOnce(new Error('外键约束'));

            await expect(processTemplateService.delete(1))
                .rejects.toThrow('外键约束');

            expect(mockRollback).toHaveBeenCalled();
        });
    });

    // ==================== updateStatus ====================
    describe('updateStatus', () => {
        it('应成功更新状态', async () => {
            mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const result = await processTemplateService.updateStatus(1, 0);

            expect(result).toBe(true);
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE'),
                [0, 1]
            );
        });
    });
});
