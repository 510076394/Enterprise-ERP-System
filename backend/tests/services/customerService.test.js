/**
 * customerService.test.js
 * @description 客户服务层单元测试
 * @date 2026-03-03
 * 
 * 测试覆盖：
 * - getAllCustomers: 分页查询、过滤条件
 * - getCustomerById: 单条查询、不存在
 * - createCustomer: 正常创建、编码生成
 * - updateCustomer: 正常更新、字段白名单
 * - deleteCustomer: 正常删除、不存在
 * - getCustomerStats: 聚合统计
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

const customerService = require('../../src/services/customerService');

describe('customerService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ==================== getAllCustomers ====================
    describe('getAllCustomers', () => {
        it('应返回分页数据（无过滤条件）', async () => {
            // 模拟 COUNT 查询
            mockQuery.mockResolvedValueOnce([[{ total: 25 }]]);
            // 模拟数据查询
            mockQuery.mockResolvedValueOnce([[
                { id: 1, code: 'KH001', name: '客户A', status: 'active' },
                { id: 2, code: 'KH002', name: '客户B', status: 'inactive' }
            ]]);

            const result = await customerService.getAllCustomers(1, 10);

            expect(result.total).toBe(25);
            expect(result.items).toHaveLength(2);
            expect(result.page).toBe(1);
            expect(result.pageSize).toBe(10);
            // 第一次调用是 COUNT 查询
            expect(mockQuery).toHaveBeenCalledTimes(2);
        });

        it('应支持按名称过滤', async () => {
            mockQuery.mockResolvedValueOnce([[{ total: 5 }]]);
            mockQuery.mockResolvedValueOnce([[
                { id: 1, code: 'KH001', name: '测试客户', status: 'active' }
            ]]);

            const result = await customerService.getAllCustomers(1, 10, { name: '测试' });

            expect(result.total).toBe(5);
            // 验证 SQL 包含名称过滤参数
            const firstCallArgs = mockQuery.mock.calls[0];
            expect(firstCallArgs[0]).toContain('name LIKE');
            expect(firstCallArgs[1]).toContain('%测试%');
        });

        it('应支持按编码过滤', async () => {
            mockQuery.mockResolvedValueOnce([[{ total: 1 }]]);
            mockQuery.mockResolvedValueOnce([[
                { id: 1, code: 'KH001', name: '客户A', status: 'active' }
            ]]);

            const result = await customerService.getAllCustomers(1, 10, { code: 'KH001' });

            expect(result.total).toBe(1);
            const firstCallArgs = mockQuery.mock.calls[0];
            expect(firstCallArgs[0]).toContain('code LIKE');
        });

        it('应支持按状态过滤', async () => {
            mockQuery.mockResolvedValueOnce([[{ total: 10 }]]);
            mockQuery.mockResolvedValueOnce([[
                { id: 1, code: 'KH001', name: '客户A', status: 'active' }
            ]]);

            await customerService.getAllCustomers(1, 10, { status: 'active' });

            const firstCallArgs = mockQuery.mock.calls[0];
            expect(firstCallArgs[0]).toContain('status =');
            expect(firstCallArgs[1]).toContain('active');
        });

        it('应正确计算分页偏移量', async () => {
            mockQuery.mockResolvedValueOnce([[{ total: 50 }]]);
            mockQuery.mockResolvedValueOnce([[]]);

            await customerService.getAllCustomers(3, 20);

            // 第二次调用是数据查询，OFFSET 应为 (3-1)*20 = 40
            const secondCallSql = mockQuery.mock.calls[1][0];
            expect(secondCallSql).toContain('OFFSET 40');
        });

        it('数据库错误时应抛出异常', async () => {
            mockQuery.mockRejectedValueOnce(new Error('数据库连接失败'));

            await expect(customerService.getAllCustomers(1, 10))
                .rejects.toThrow('数据库连接失败');
        });
    });

    // ==================== getCustomerById ====================
    describe('getCustomerById', () => {
        it('应返回指定客户', async () => {
            mockQuery.mockResolvedValueOnce([[
                { id: 1, code: 'KH001', name: '客户A', status: 'active' }
            ]]);

            const result = await customerService.getCustomerById(1);

            expect(result).toBeDefined();
            expect(result.id).toBe(1);
            expect(result.code).toBe('KH001');
        });

        it('客户不存在时应返回null或undefined', async () => {
            mockQuery.mockResolvedValueOnce([[]]);

            const result = await customerService.getCustomerById(999);

            expect(result).toBeUndefined();
        });
    });

    // ==================== createCustomer ====================
    describe('createCustomer', () => {
        it('应成功创建客户并返回完整数据', async () => {
            const newCustomer = {
                name: '新客户',
                contact_person: '张三',
                contact_phone: '13800138000',
                status: 'active'
            };

            // Mock: 查询最大编码
            mockQuery.mockResolvedValueOnce([[{ maxCode: 'KH26030005' }]]);
            // Mock: INSERT
            mockQuery.mockResolvedValueOnce([{ insertId: 10, affectedRows: 1 }]);
            // Mock: SELECT 新记录
            mockQuery.mockResolvedValueOnce([[
                { id: 10, code: 'KH2603006', ...newCustomer }
            ]]);

            const result = await customerService.createCustomer(newCustomer);

            expect(result).toBeDefined();
            expect(result.id).toBe(10);
        });
    });

    // ==================== updateCustomer ====================
    describe('updateCustomer', () => {
        it('应成功更新客户', async () => {
            // Mock: 查询是否存在
            mockQuery.mockResolvedValueOnce([[
                { id: 1, code: 'KH001', name: '旧名称', status: 'active' }
            ]]);
            // Mock: UPDATE
            mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);
            // Mock: SELECT 更新后记录
            mockQuery.mockResolvedValueOnce([[
                { id: 1, code: 'KH001', name: '新名称', status: 'active' }
            ]]);

            const result = await customerService.updateCustomer(1, { name: '新名称' });

            expect(result).toBeDefined();
            expect(result.name).toBe('新名称');
        });

        it('客户不存在时应抛出异常', async () => {
            mockQuery.mockResolvedValueOnce([[]]);

            await expect(customerService.updateCustomer(999, { name: '测试' }))
                .rejects.toThrow('客户不存在');
        });

        it('应过滤无效字段（字段白名单）', async () => {
            mockQuery.mockResolvedValueOnce([[{ id: 1, code: 'KH001', name: '客户A' }]]);
            mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);
            mockQuery.mockResolvedValueOnce([[{ id: 1, code: 'KH001', name: '客户A' }]]);

            await customerService.updateCustomer(1, {
                name: '客户A',
                hackerField: 'injection', // 非法字段
                created_at: '2020-01-01' // 时间戳字段
            });

            // 验证 UPDATE SQL 不包含非法字段
            const updateCallSql = mockQuery.mock.calls[1][0];
            expect(updateCallSql).not.toContain('hackerField');
            expect(updateCallSql).not.toContain('created_at');
        });
    });

    // ==================== deleteCustomer ====================
    describe('deleteCustomer', () => {
        it('应成功删除客户', async () => {
            // Mock: 查询是否存在
            mockQuery.mockResolvedValueOnce([[{ id: 1, code: 'KH001' }]]);
            // Mock: DELETE
            mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const result = await customerService.deleteCustomer(1);

            expect(result).toBeDefined();
        });

        it('客户不存在时应抛出异常', async () => {
            mockQuery.mockResolvedValueOnce([[]]);

            await expect(customerService.deleteCustomer(999))
                .rejects.toThrow();
        });
    });

    // ==================== getCustomerStats ====================
    describe('getCustomerStats', () => {
        it('应返回正确的统计数据', async () => {
            mockQuery.mockResolvedValueOnce([[{
                total: 100,
                active: 85,
                inactive: 15,
                totalCredit: '500000.00'
            }]]);

            const result = await customerService.getCustomerStats();

            expect(result).toBeDefined();
            expect(result.total).toBe(100);
            expect(result.active).toBe(85);
            expect(result.inactive).toBe(15);
        });

        it('数据库错误时应抛出异常', async () => {
            mockQuery.mockRejectedValueOnce(new Error('查询失败'));

            await expect(customerService.getCustomerStats())
                .rejects.toThrow('查询失败');
        });
    });
});
