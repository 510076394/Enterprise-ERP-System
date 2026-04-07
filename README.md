<div align="center">
  <h1>🏭 极道工业：企业级核心制造 ERP 系统</h1>
  <p><strong>Professional-Grade Manufacturing Enterprise Resource Planning System</strong></p>
  <p>
    一个拒绝前端花拳绣腿，通过第一性原理（数据库锁、死信队列、物理防线）构建坚固业务闭环的骨灰级 MES/ERP 开源架构。
  </p>
</div>

---

## 🌟 为什么选择重构一套新的 ERP？

市面上的大多数开源 ERP，将系统的防灾与防错机制寄托于“前端屏蔽按钮”或“防抖动配置”之上。这种脆弱掩耳盗铃的代码设计极其容易在高并发高负载的生产车间（如采购连击入库、工控机快速条码报工）造成超售、双胞胎单据与财务断档。

本项目打破陈规，奉行 **“第一性原理”**：绝不在界面加不必要的锁，而是将所有的“业务约束、防乱账、防重塑”深深扎进系统后端的深水区与关系型数据库引擎的特性中。这是一套真正敢拿去支撑百位打工人跨厂区同时在线协作的“工业级骨架”。

## 💎 核心架构亮点 (Enterprise Grade Foundations)

本项目不仅具备常规的表单增删改查，更搭载了顶级的底层容错与防灾机制：

- 🛡️ **纯血悲观锁隔离 (Pessimistic Row Locks)**
  在采购入库与生产打卡流转时，摒弃 UI 网络阻断，原生启用 `SELECT ... FOR UPDATE`。即使脚本强压或是并发恶作剧，系统也只用数据物理空置状态冷漠拦截，防溢出、防超售水滴不漏。
- 🔄 **账实完全解耦与异步死信救灾 (EventBus + DLQ)**
  产线工人报工作业决不能因为算成本慢而卡住。因此生产动作同步极速返回，而资金流与库存台账通过内部消息总线异步运算。哪怕中间遭遇崩溃，通过死信队列中心 (`sys_failed_jobs`) 将原版 Payload 装盘封存，保证财务数据的绝对 100% 可找回！
- 🖲️ **数据生命宪兵队 (Audit Trail & Soft Deletes)**
  全面取缔 `DELETE FROM`，八大主业务模块采用 `deleted_at` 物理留痕。并在架构的最外层（中间件）挂接全局“操作黑匣子”，所有对于数据的篡改都将被捕获旧态与新态，记录进 `sys_audit_logs` 供日后极速审计回溯。
- 🏦 **绝对财务关账防线 (Period Validations)**
  财务结账不可逆。全量集成了跨月凭证防御拦截门，结账后的历史凭证犹如焊死，严禁任何补写或时间倒拨。

## 📦 核心功能模块

- **生管 MES 闭环**：工单派发、车间打卡定额、在制品 WIP 快照、首检与巡检卡点
- **采销流 O2C / P2P**：采购需求、询报价记录、收货入库严控、销售发运及财务记账
- **全息物料与库存**：BOM 配方树爆裂、质量检验单集成、出入库台账对账
- **财务成本核算库**：定额成本核算、实际制造费用分摊归集、凭证网格

---

## 🚀 快速启动与部署

为了让系统表现最优，请准备以下运行环境：
- **Node.js** >= 18.x （用于前端和后端服务）
- **MySQL** >= 8.0.x （必须，以支持完善的窗口函数及排他锁特性）

### 1️⃣ 环境及数据库初始化
1. 克隆代码：
   ```bash
   git clone https://github.com/510076394/Enterprise-ERP-System.git
   cd Enterprise-ERP-System
   ```
2. 安装后端环境：
   ```bash
   cd backend
   npm install
   ```
3. 配置配置文件：
   在 `backend` 目录下创建 `.env` 文件，并根据您的本地 MySQL 的设置填入：
   ```env
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=mes
   PORT=8080
   JWT_SECRET=your_jwt_super_secret_key
   ```
4. 数据库刷入：
   运行框架自带的神器，自动升降级生成包含审计表、软删除的全量架构：
   ```bash
   npm run migrate
   ```

### 2️⃣ 启动后台服务 (Backend)

保持在 `backend` 目录，执行以下命令热启动应用：
```bash
npm run dev
```
或在生产环境使用：
```bash
npm start
```
*看见 “✅ 数据库系统初始化完成” 即代表核心成功点燃。*

### 3️⃣ 启动控制域大盘 (Frontend)

新开一个终端终端，进入前端目录：
```bash
cd frontend
npm install
npm run dev
```
打开浏览器访问控制台中提示的网址（默认 `http://localhost:3000`）。
- **默认超级管理员**: `admin`
- **默认防爆密码**: `123456`

---

## 🤝 贡献与开源声明

本项目致力于为工业企业数字化提供最具韧性的下沉技术支持。非常欢迎各大工厂的 IT 同仁、对纯血高并发架构感兴趣的码农提交 Pull Requests！

*Copyright © 2026. Made with ❤️ by Wang.*
