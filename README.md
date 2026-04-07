<div align="center">
  <h1>🏭 极道工业：企业级核心制造 ERP / MES 系统</h1>
  <p><strong>🔥 Forever Free & Open Source | 永远免费开源的现代制造业中枢</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js&logoColor=white" alt="Node.js">
    <img src="https://img.shields.io/badge/Vue.js-3.x-4FC08D?logo=vuedotjs&logoColor=white" alt="Vue">
    <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white" alt="MySQL">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License">
    <br>
    <em>一个拒绝前端花拳绣腿，通过第一性原理（数据库锁、死信队列、物理防线）构建坚固业务闭环的骨灰级开源架构。</em>
  </p>
</div>

---

## 🌟 项目宣言：为什么要选我们？

市面上的大多数轻量开源 ERP，为了图快，将系统的防灾与防错机制寄托于“前端屏蔽按钮”或“防抖动请求”之上。但在高并发、高负载的真实生产车间（如：五金冲压件连击报工、扫码枪极速入库并发）极其容易造成**超额发料、双胞胎单据与财务断档**。

**极道工业 ERP** 奉行 **“第一性原理”**：绝不在界面加不必要的虚假防线，而是将所有的“业务约束、防乱账、资金防漏”深深扎进系统后端的深水区与关系型数据库（MySQL 8.0）排他锁特性中。这是一套真正敢拿去支撑百人大厂跨厂区同时在线协作的“工业级防爆骨架”。

无论是二次开发接单，还是自建工厂信息化起步，本系统**永久免费开源**，绝无商业版暗锁！

---

## 💎 核心架构亮点

- 🛡️ **纯血悲观锁物理隔离 (Pessimistic Row Locks)**
  在采购入库与生产打卡流转时，原生启用 `SELECT ... FOR UPDATE`。面对并发高压抢库，系统靠数据库底层的物理占位坚强阻击，防超售水滴不漏。
- 🔄 **账实完全解耦与异步死信救灾 (EventBus + DLQ)**
  产线工人报工作业极速 50 毫秒内出具结论！而复杂的“费用分摊、期初库存重算”通过内部消息总线异步运算。哪怕中间断电宕机，所有任务通过死信队列中心 (`sys_failed_jobs`) 封存保留，保证财务记账 100% 颗粒级可找回！
- 🖲️ **数据生命宪兵队 (Audit Trail & Soft Deletes)**
  全面取缔暴力的 `DELETE FROM`，主业务全线启用 `deleted_at` 无感软删除。并在中间件层挂接全局“操作黑匣子”，所有写操作（新增/修改/软删）都被强制记录进 `sys_audit_logs` 溯源日志表，是谁随意改了单价，一目了然！
- 🏦 **绝对财务关账防线 (Period Validations)**
  集成跨月凭证防御拦截门。月结关账后的历史凭证犹如焊死，严禁任何形式的补写或时间倒拨。

---

## 📦 全息业务模块一览表

系统采用 8 大模块全覆盖，完全解耦：

| 模块类别 | 涵盖核心功能及痛点突破 |
| :--- | :--- |
| **⚙️ 生产制造 (MES)** | 工单派发、车间条码打卡定额、在线 WIP 制程快照、缺料反算退补料流转。 |
| **🛒 采购协同 (P2P)** | 供应商门户管理、采购询价比价流、基于容差范围的防超收采购入库、自动对账期打款。 |
| **📦 销售流转 (O2C)** | 客户信用额度预警、销售发运红线检查、退换货红字追踪。 |
| **🏦 财务核算 (Finance)** | 制造费用分摊归集模型、月末自动跨期结算、应收/应付账龄分析板。 |
| **📊 纯粹仓储 (WMS)** | 多级子库位细化、物料批次（LOT）生命周期追溯、先进先出(FIFO)成本滚动核算、盘空盘盈单。 |
| **🔬 质量防线 (QMS)** | IQC（来料）、IPQC（制程）、FQC（成品）三道防线。支持 AQL 定级拦截判定。 |
| **🗄️ 柔性基础库 (MDM)** | N 阶树状 BOM 配方爆裂分析、多计量单位（包/件/吨）底层折算系数、工艺操作树。 |
| **🔐 系统底盘 (System)** | 纯正 RBAC 的角色动态权限隔离、云端全局日志穿透。 |

---

## 🚀 一键云端部署 (Dead-Simple Cloud Deploy)

如果你不想在本地安装这套复杂的架构，支持各大云服务一键部署展示！无需修改代码！

### 🥇 方案一：部署到 Zeabur (推荐，原生支持且全自动)
Zeabur 能够**零修改、原生运行**这套带有复杂逻辑的 Node 服务，并且会自动送您一台云 MySQL 数据库用于存储！
1. 打开 [Zeabur](https://zeabur.com/)，连接 Github 并授权。
2. 点击新建项目，选择从 GitHub 导入 `Enterprise-ERP-System`，选中 `backend`（后端） 目录进行部署。
3. 在项目中“添加服务 -> 选择预建数据库 MySQL”。
4. 在您部署的代码服务环境变量中设置桥接代码（将 `DB_HOST` 设为 `${MYSQL_HOST}` 依此类推）即可！
*(前端同理，直接在 Zeabur 里再导入一次此仓库并选中 `frontend` 即可一站式访问！)*

### 🥈 方案二：部署到 Vercel (纯前端托管)
由于 Vercel 是无底座的 Serverless 节点，它**只能跑前端 Vue 页面**，后端必须要挂到别的容器（如阿里云/Zeabur/Render）。
[![Deploy on Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2F510076394%2FEnterprise-ERP-System&project-name=enterprise-erp-system)

*(Railway 官方因为关停了模板服务，我们建议大家转向 Render 或 Zeabur 原生挂载部署。)*

---

## 🛠️ 本地开发者环境 (Local Development)

想参与系统的研究和二开？请确保你装有 **Node.js 18+** 和 **MySQL 8.0+**。

### 1. 启动大心脏 (Backend & MySQL Initialization)
```bash
git clone https://github.com/510076394/Enterprise-ERP-System.git
cd Enterprise-ERP-System/backend

# 安装依赖
npm install

# 配置 .env 文件 (请填写自己的数据库账号密码)
echo "DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=mes
PORT=8080
JWT_SECRET=super_secret" > .env

# 一键刷入表结构和系统预制数据
npm run migrate

# 点火执行后台服务
npm run dev
```

### 2. 启动控制台 (Frontend SPA)
```bash
cd ../frontend
npm install

# 点火执行前端界面
npm run dev
```
打开浏览器访问即可！
- **超管账号**: `admin`
- **防爆密码**: `123456`

---

## 🤝 参与开源建设

本项目由一线制造业痛苦的真实踩坑经验凝结而成。无论是开 Issue 吐槽发现的 Bug，还是直接提 PR 提交更牛的工业控制解法，这里非常欢迎大家一起来共建这套中国开源界的基石 ERP。

*Copyright © 2026. Made with ⚙️ and ❤️ for the Open Source Manufacturing Industry.*
