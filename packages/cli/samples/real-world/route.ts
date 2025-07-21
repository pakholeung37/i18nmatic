import {
  createRootRoute,
  createRoute,
  createRouter,
  NotFoundRoute,
} from "@tanstack/react-router"
import { getIconNameByType } from "./utils/route"

export const rootRoute = createRootRoute()
export const notFoundRoute = new NotFoundRoute({
  getParentRoute: () => rootRoute,
  staticData: {
    routerType: "raw",
    title: "404",
  },
})
export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  staticData: {
    routerType: "raw",
  },
})

export const teamRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "team/$teamId",
  staticData: {
    routerType: "raw",
  },
})

/**
 * legacy route
 * @deprecated
 */
export const branchRoute = createRoute({
  getParentRoute: () => teamRoute,
  path: "branch/*",
  staticData: {
    routerType: "raw",
  },
})

export const appRoute = createRoute({
  getParentRoute: () => teamRoute,
  path: "app/$appId",
  staticData: {
    routerType: "raw",
  },
})

export const portalRoute = createRoute({
  getParentRoute: () => teamRoute,
  path: "portal/$portalId",
  staticData: {
    routerType: "raw",
  },
})

export const teamConfigMangeRoute = createRoute({
  getParentRoute: () => teamRoute,
  path: "config",
  staticData: {
    routerType: "memory",
    title: "项目配置",
    initialEntries: [`/project/project-team`],
  },
})

export const envDatasourceRoute = createRoute({
  getParentRoute: () => teamRoute,
  path: "env/datasource",
  staticData: {
    routerType: "raw",
    title: "数据源",
  },
})

export const envLinkRoute = createRoute({
  getParentRoute: () => teamRoute,
  path: "env/link",
  staticData: {
    routerType: "raw",
    title: "模块关联数据源",
  },
})

export const envConnectorRoute = createRoute({
  getParentRoute: () => teamRoute,
  path: "env/connector",
  staticData: {
    routerType: "raw",
    title: "连接器参数配置",
  },
})

export const envShardRoute = createRoute({
  getParentRoute: () => teamRoute,
  path: "env/shard",
  staticData: {
    routerType: "raw",
    title: "模型分表配置",
  },
})

export const envModuleRoute = createRoute({
  getParentRoute: () => teamRoute,
  path: "env/module",
  staticData: {
    routerType: "raw",
    title: "模型分表配置",
  },
})

export const envGlobalRoute = createRoute({
  getParentRoute: () => teamRoute,
  path: "env/global",
  staticData: {
    routerType: "raw",
    title: "全局视角",
  },
})

export const envPortalRoute = createRoute({
  getParentRoute: () => teamRoute,
  path: "env/portal/$portalId",
  staticData: {
    routerType: "memory",
    title: "门户配置",
  },
})

export const envMcpServerRoute = createRoute({
  getParentRoute: () => teamRoute,
  path: "env/mcp-server",
  staticData: {
    routerType: "raw",
    title: "MCP server 源设置",
  },
})

export const knowledgeGraphRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "knowledgeGraph",
  staticData: {
    routerType: "raw",
    title: "知识图谱",
  },
})

export const flowCenterRoute = createRoute({
  getParentRoute: () => teamRoute,
  path: "folder/$folderKey/flowCenter",
  staticData: {
    routerType: "raw",
    title: "流程中心",
  },
})

export const folderRoute = createRoute({
  path: "folder/$folderKey",
  getParentRoute: () => appRoute,
  staticData: {
    // 这个组件因为需要使用react router dom lazy 能力，需要自建 data router
    routerType: "raw",
    title: "文件夹",
    icon: getIconNameByType("FolderExpanded"),
    initialEntries: ["/Model"],
  },
})

export const modelNewRoute = createRoute({
  path: "model/$modelType",
  getParentRoute: () => folderRoute,
  staticData: {
    routerType: "raw",
    title: "模型",
    icon: getIconNameByType("Model"),
  },
})

export const modelImportRoute = createRoute({
  path: "model/import",
  getParentRoute: () => folderRoute,
  staticData: {
    routerType: "raw",
    title: "导入模型",
    icon: getIconNameByType("Model"),
  },
})

// 业务配置 新增页面
export const serviceConfigNewRoute = createRoute({
  path: "serviceConfig/new",
  getParentRoute: () => folderRoute,
  staticData: {
    routerType: "raw",
    title: "业务配置",
    icon: getIconNameByType("ServiceConfig"),
  },
})

// 报表模型新增页面
export const statisticModelNewRoute = createRoute({
  path: "statistic/new",
  getParentRoute: () => folderRoute,
  staticData: {
    routerType: "raw",
    title: "新建统计模型",
    icon: getIconNameByType("Model"),
  },
})

export const eventDefineNewRoute = createRoute({
  path: "eventDefine/new",
  getParentRoute: () => folderRoute,
  staticData: {
    routerType: "raw",
    title: "触发器定义",
    icon: getIconNameByType("EventDefinition"),
  },
})

export const eventDefineRoute = createRoute({
  path: "eventDefine/$eventDefineKey",
  getParentRoute: () => appRoute,
  staticData: {
    routerType: "raw",
    title: "触发器定义",
    icon: getIconNameByType("EventDefinition"),
  },
})

export const eventTriggerNewRoute = createRoute({
  path: "eventTrigger/new",
  getParentRoute: () => folderRoute,
  staticData: {
    routerType: "raw",
    title: "触发器监听",
    icon: getIconNameByType("Trigger"),
  },
})

export const eventTriggerRoute = createRoute({
  path: "eventTrigger/$eventTriggerKey",
  getParentRoute: () => appRoute,
  staticData: {
    routerType: "raw",
    title: "触发器监听",
    icon: getIconNameByType("Trigger"),
  },
})

export const noticeSceneNewRoute = createRoute({
  path: "noticeScene/new",
  getParentRoute: () => folderRoute,
  staticData: {
    routerType: "raw",
    title: "通知场景",
    icon: getIconNameByType("NoticeScene"),
  },
})

export const noticeSceneRoute = createRoute({
  path: "noticeScene/$noticeSceneKey",
  getParentRoute: () => appRoute,
  staticData: {
    routerType: "raw",
    title: "通知场景",
    icon: getIconNameByType("NoticeScene"),
  },
})

export const printSceneNewRoute = createRoute({
  path: "printScene/new",
  getParentRoute: () => folderRoute,
  staticData: {
    routerType: "raw",
    title: "打印场景",
    icon: getIconNameByType("PrintScene"),
  },
})

export const printSceneRoute = createRoute({
  path: "printScene/$printSceneKey",
  getParentRoute: () => appRoute,
  staticData: {
    routerType: "raw",
    title: "打印场景",
    icon: getIconNameByType("PrintScene"),
  },
})

export const importExportCreateRoute = createRoute({
  path: "importExport/create",
  getParentRoute: () => folderRoute,
  staticData: {
    routerType: "raw",
    title: "新建导入导出",
    icon: getIconNameByType("ImportExportTemplate"),
  },
})

export const importExportRoute = createRoute({
  path: "importExport/$importExportKey",
  getParentRoute: () => appRoute,
  staticData: {
    routerType: "raw",
    title: "导入导出",
    icon: getIconNameByType("ImportExportTemplate"),
  },
})

export const sceneRoute = createRoute({
  path: "scene/$sceneId",
  getParentRoute: () => appRoute,
  staticData: {
    routerType: "memory",
    title: "场景",
    icon: getIconNameByType("Scene"),
  },
})

export const sceneDevtoolsRoute = createRoute({
  path: "devtools",
  getParentRoute: () => sceneRoute,
  staticData: {
    routerType: "raw",
    title: "设计器开发工具",
  },
})
export const sceneNewRoute = createRoute({
  path: "scene/new",
  getParentRoute: () => folderRoute,
  staticData: {
    routerType: "memory",
    title: "新建页面场景",
    icon: getIconNameByType("Scene"),
  },
})

export const modelRoute = createRoute({
  path: "model/$modelKey",
  getParentRoute: () => appRoute,
  staticData: {
    routerType: "raw",
    title: "模型",
    icon: getIconNameByType("Model"),
  },
})

export const erRoute = createRoute({
  path: "/er",
  getParentRoute: () => appRoute,
  staticData: {
    routerType: "raw",
    title: "er图",
    icon: getIconNameByType("Model"),
  },
})

// 业务配置
export const serviceConfigRoute = createRoute({
  path: "serviceConfig/$configKey",
  getParentRoute: () => appRoute,
  staticData: {
    routerType: "raw",
    title: "业务配置",
    icon: getIconNameByType("ServiceConfig"),
  },
})

// 统计模型详情
export const statisticModelRoute = createRoute({
  // TODO 统一换成 resourceKey
  path: "statistic/$modelKey",
  getParentRoute: () => appRoute,
  staticData: {
    routerType: "raw",
    title: "统计模型",
    icon: getIconNameByType("Model"),
  },
})

export const serviceFlowRoute = createRoute({
  path: "serviceflow/$serviceKey",
  getParentRoute: () => appRoute,
  staticData: {
    routerType: "raw",
    title: "编排服务",
    icon: getIconNameByType("ServiceDefinition"),
  },
})

export const eventServiceFlowRoute = createRoute({
  path: "eventflow/$eventKey",
  getParentRoute: () => appRoute,
  staticData: {
    routerType: "raw",
    title: "业务事件编排",
    icon: getIconNameByType("Event"),
  },
})

export const serviceFlowCreateRoute = createRoute({
  path: "serviceflow/create/$serviceType",
  getParentRoute: () => folderRoute,
  staticData: {
    routerType: "raw",
    title: "新建服务",
    icon: getIconNameByType("ServiceDefinition"),
  },
})

export const sysServicePermissionSettingRoute = createRoute({
  path: "serviceflow/sysServicePermissionSetting/$serviceKey",
  getParentRoute: () => appRoute,
  staticData: {
    routerType: "raw",
    title: "权限配置",
    icon: getIconNameByType("ServiceDefinition"),
  },
})

export const eventsNewRoute = createRoute({
  path: "events/new",
  getParentRoute: () => folderRoute,
  staticData: {
    routerType: "raw",
    title: "操作事件-新增",
    icon: getIconNameByType("Event"),
  },
})

export const eventsCopyRoute = createRoute({
  path: "events/$copyCode",
  getParentRoute: () => folderRoute,
  staticData: {
    routerType: "raw",
    title: "复制操作事件",
    icon: getIconNameByType("Event"),
  },
})

export const approvalGroupCreateRoute = createRoute({
  path: "approval/create",
  getParentRoute: () => folderRoute,
  staticData: {
    routerType: "raw",
    title: "新建审批场景",
    icon: getIconNameByType("WorkflowGroup"),
  },
})

export const actionsNewRoute = createRoute({
  path: "actions/new",
  getParentRoute: () => folderRoute,
  staticData: {
    routerType: "raw",
    title: "扩展服务",
    icon: getIconNameByType("Action"),
  },
})

export const actionsRoute = createRoute({
  // TODO 统一换成 resourceKey
  path: "actions/$actionKey",
  getParentRoute: () => appRoute,
  staticData: {
    routerType: "raw",
    title: "扩展服务",
    icon: getIconNameByType("Action"),
  },
})

export const approvalGroupEditRoute = createRoute({
  path: "approval/$approvalGroupKey",
  getParentRoute: () => appRoute,
  staticData: {
    routerType: "raw",
    title: "审批流组",
    icon: getIconNameByType("WorkflowGroup"),
  },
})

export const appConfigRoute = createRoute({
  path: "config",
  getParentRoute: () => appRoute,
  staticData: {
    routerType: "memory",
    title: "模块配置",
    initialEntries: ["/info"],
  },
})

export const dataConditionRoute = createRoute({
  path: "dataCondition/$dataConditionKey",
  getParentRoute: () => appRoute,
  staticData: {
    routerType: "raw",
    icon: getIconNameByType("DataCondition"),
    title: "权限规则",
  },
})

export const dataConditionNewRoute = createRoute({
  path: "dataCondition/new",
  getParentRoute: () => folderRoute,
  staticData: {
    routerType: "raw",
    icon: getIconNameByType("DataCondition"),
    title: "权限规则",
  },
})

// 应用市场
export const applicationMarketRoute = createRoute({
  getParentRoute: () => teamRoute,
  path: "market/$marketType",
  staticData: {
    routerType: "memory",
    title: "应用市场",
    initialEntries: [`/scene`],
  },
})
// 应用市场-连接器模板-连接器详情
// export const connectorTemplateDetailRoute = createRoute({
//   getParentRoute: () => applicationMarketRoute,
//   path: 'connector/$ckey/version/$version',
//   staticData: {
//     routerType: 'memory',
//     title: '连接器模板详情',
//   },
// })

// 应用市场-连接器模板-连接器模板创建
export const connectorTemplateCreateRoute = createRoute({
  getParentRoute: () => applicationMarketRoute,
  path: "connector/create",
  staticData: {
    routerType: "memory",
    title: "连接器模板创建",
  },
})

// 应用市场-连接器模板-连接器模板编辑
export const connectorTemplateEditRoute = createRoute({
  getParentRoute: () => applicationMarketRoute,
  path: "connector/$skey/version/$version",
  staticData: {
    routerType: "raw",
    title: "连接器模板编辑",
  },
})

// 应用市场-服务模板-服务模板创建
export const flowServiceTemplateCreateRoute = createRoute({
  getParentRoute: () => applicationMarketRoute,
  path: "service/create",
  staticData: {
    routerType: "raw",
    title: "服务模板创建",
  },
})

// 应用市场-服务模板-服务模板编辑
export const flowServiceTemplateEditRoute = createRoute({
  getParentRoute: () => applicationMarketRoute,
  path: "service/$skey/version/$version",
  staticData: {
    routerType: "raw",
    title: "服务模板编辑",
  },
})

export const sceneTemplateCreateRoute = createRoute({
  getParentRoute: () => applicationMarketRoute,
  path: "scene/create",
  staticData: {
    routerType: "raw",
    title: "场景模板创建",
  },
})
// 应用市场-场景模板-场景模板编辑
export const sceneTemplateEditRoute = createRoute({
  getParentRoute: () => applicationMarketRoute,
  path: "scene/$skey/version/$version",
  staticData: {
    routerType: "memory",
    title: "场景模板编辑",
  },
})

// 应用市场-场景模板-场景模板只读
export const sceneTemplateReadRoute = createRoute({
  getParentRoute: () => applicationMarketRoute,
  path: "scene/readonly/$skey/version/$version",
  staticData: {
    routerType: "memory",
    title: "场景模板阅读",
  },
})

// 连接器实例
export const connectorInsRoute = createRoute({
  getParentRoute: () => teamRoute,
  path: "connector/ins",
  staticData: {
    routerType: "raw",
    title: "连接器实例",
  },
})

// 连接器实例详情
export const connectorInsDelRoute = createRoute({
  getParentRoute: () => connectorInsRoute,
  path: "$cInsKey",
  staticData: {
    routerType: "raw",
    title: "连接器实例详情",
  },
})

// 连接器参数配置详情
export const connectorParamConfigDetailRoute = createRoute({
  getParentRoute: () => envConnectorRoute,
  path: "$cInsKey",
  staticData: {
    routerType: "raw",
    title: "连接器参数配置详情",
  },
})

// 异步任务中心
export const asyncTaskCenterRoute = createRoute({
  getParentRoute: () => teamRoute,
  path: "task/async",
  staticData: {
    routerType: "raw",
    title: "异步任务中心",
  },
})

// 异步任务中心
export const permissionAuthorizationTaskRoute = createRoute({
  getParentRoute: () => teamRoute,
  path: "task/permissionAuthorization/$taskId",
  staticData: {
    routerType: "raw",
    title: "角色授权检查",
  },
})

// 门户管理
export const portalManageRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: "portalManage",
  staticData: {
    routerType: "memory",
    title: "门户管理",
    initialEntries: [`/sysBase`],
  },
})

// 新建门户
export const addPortalRoute = createRoute({
  getParentRoute: () => teamRoute,
  path: "addPortal",
  staticData: {
    routerType: "raw",
    title: "新建门户",
  },
})

export const OverviewProcessCreateRoute = createRoute({
  path: "create",
  getParentRoute: () => flowCenterRoute,
  staticData: {
    routerType: "raw",
    title: "新建业务流程",
    icon: getIconNameByType("OverviewProcess"),
  },
})

export const OverviewProcessEditRoute = createRoute({
  path: "process/$BPMKey",
  getParentRoute: () => appRoute,
  staticData: {
    routerType: "raw",
    title: "编辑业务流",
    icon: getIconNameByType("OverviewProcess"),
  },
})

export const BPMProcessRoute = createRoute({
  path: "bpm/$BPMKey/process",
  getParentRoute: () => teamRoute,
  staticData: {
    routerType: "raw",
    title: "业务流编排",
    icon: getIconNameByType("WorkflowGroup"),
  },
})

// 权限包
// 导出
export const authExportRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: "authExport",
  staticData: {
    routerType: "raw",
    title: "权限包导出",
  },
})

// 导入
export const authImportRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: "authImport",
  staticData: {
    routerType: "raw",
    title: "权限包导入",
  },
})

// iam webhook
// 调试
export const iamWebHookDebugRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: "iamWebhookDebug/$webhookId",
  staticData: {
    routerType: "raw",
    title: "webhook调试",
  },
})

// 调试记录
export const iamWebHookDebugRecordsRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: "iamWebhookDebugRecords/$webhookId",
  staticData: {
    routerType: "raw",
    title: "webhook调试记录",
  },
})

// 权限项
export const permissionFunctionItemRoute = createRoute({
  getParentRoute: () => teamRoute,
  path: "functionPermissionItem/$permissionKey",
  staticData: {
    routerType: "raw",
    title: "权限项",
    icon: getIconNameByType("Permission"),
  },
})

export const permissionFunctionItemNewRoute = createRoute({
  getParentRoute: () => folderRoute,
  path: "functionPermissionItem/new",
  staticData: {
    routerType: "raw",
    title: "权限项",
    icon: getIconNameByType("Permission"),
  },
})

// 权限项数据维度
export const dataControlDimensionRoute = createRoute({
  getParentRoute: () => teamRoute,
  path: "dataControlDimension/$permissionKey",
  staticData: {
    routerType: "raw",
    title: "权限数据维度",
    icon: getIconNameByType("dataControlDimension"),
  },
})

export const dataControlDimensionNewRoute = createRoute({
  getParentRoute: () => folderRoute,
  path: "dataControlDimension/new",
  staticData: {
    routerType: "raw",
    title: "权限数据维度",
    icon: getIconNameByType("dataControlDimension"),
  },
})

// 使用统计 Usage statistics
export const usageStatisticsRoute = createRoute({
  getParentRoute: () => teamRoute,
  path: "usage/stat",
  staticData: {
    routerType: "raw",
    title: "使用统计",
  },
})

export const agentAICreateRoute = createRoute({
  path: "agentAI/create",
  getParentRoute: () => folderRoute,
  staticData: {
    routerType: "raw",
    title: "新建智能体",
    icon: getIconNameByType("AIAgent"),
  },
})

export const agentAIEditRoute = createRoute({
  path: "agentAI/edit/$key",
  getParentRoute: () => appRoute,
  staticData: {
    routerType: "raw",
    title: "编辑智能体",
    icon: getIconNameByType("AIAgent"),
  },
})

export const knowledgeBaseNewRoute = createRoute({
  path: "knowledgeBase/new",
  getParentRoute: () => folderRoute,
  staticData: {
    routerType: "raw",
    title: "新建知识库",
    icon: getIconNameByType("KnowledgeBase"),
  },
})
export const knowledgeBaseEditRoute = createRoute({
  path: "knowledgeBase/$key",
  getParentRoute: () => folderRoute,
  staticData: {
    routerType: "raw",
    title: "编辑知识库",
    icon: getIconNameByType("KnowledgeBase"),
  },
})

// Agent 运维
export const agentOpsRoute = createRoute({
  getParentRoute: () => teamRoute,
  path: "agentOps",
  staticData: {
    routerType: "raw",
    title: "Agent 运维",
  },
})

// Agent 运维详情
export const agentOpsDetailRoute = createRoute({
  getParentRoute: () => agentOpsRoute,
  path: "$agentKey",
  staticData: {
    routerType: "raw",
    title: "Agent 运维详情",
  },
})

// Agent 数据集详情
export const agentDatasetDetailRoute = createRoute({
  getParentRoute: () => agentOpsDetailRoute,
  path: "datasets/$datasetId",
  staticData: {
    routerType: "raw",
    title: "数据集详情",
  },
})

// Agent 评测任务详情
export const agentEvaluationDetailRoute = createRoute({
  getParentRoute: () => agentOpsDetailRoute,
  path: "eval/$evalId",
  staticData: {
    routerType: "raw",
    title: "评测任务详情",
  },
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  teamRoute.addChildren([
    branchRoute,
    teamConfigMangeRoute,
    permissionFunctionItemRoute,
    dataControlDimensionRoute,
    flowCenterRoute.addChildren([OverviewProcessCreateRoute]),
    applicationMarketRoute.addChildren([
      connectorTemplateEditRoute,
      connectorTemplateCreateRoute,
      sceneTemplateCreateRoute,
      sceneTemplateEditRoute,
      sceneTemplateReadRoute,
      flowServiceTemplateCreateRoute,
      flowServiceTemplateEditRoute,
    ]),
    appRoute.addChildren([
      folderRoute.addChildren([
        modelNewRoute,
        statisticModelNewRoute,
        serviceConfigNewRoute,
        serviceFlowCreateRoute,
        sceneNewRoute,
        eventsNewRoute,
        eventsCopyRoute,
        actionsNewRoute,
        eventTriggerNewRoute,
        eventDefineNewRoute,
        noticeSceneNewRoute,
        printSceneNewRoute,
        importExportCreateRoute,
        modelImportRoute,
        permissionFunctionItemNewRoute,
        dataControlDimensionNewRoute,
        dataConditionNewRoute,
        agentAICreateRoute,
        knowledgeBaseNewRoute,
      ]),
      knowledgeGraphRoute,
      sysServicePermissionSettingRoute,
      sceneRoute.addChildren([sceneDevtoolsRoute]),
      serviceFlowRoute,
      eventServiceFlowRoute,
      OverviewProcessEditRoute,
      BPMProcessRoute,
      approvalGroupCreateRoute,
      approvalGroupEditRoute,
      appConfigRoute,
      dataConditionRoute,
      modelRoute,
      statisticModelRoute,
      serviceConfigRoute,
      actionsRoute,
      eventTriggerRoute,
      eventDefineRoute,
      noticeSceneRoute,
      printSceneRoute,
      importExportRoute,
      erRoute,
      agentAIEditRoute,
      knowledgeBaseEditRoute,
    ]),
    portalRoute.addChildren([
      portalManageRoute,
      authExportRoute,
      authImportRoute,
      iamWebHookDebugRoute,
      iamWebHookDebugRecordsRoute,
    ]),
    asyncTaskCenterRoute,
    permissionAuthorizationTaskRoute,
    agentOpsRoute.addChildren([
      agentOpsDetailRoute.addChildren([
        agentDatasetDetailRoute,
        agentEvaluationDetailRoute,
      ]),
    ]),
    connectorInsRoute.addChildren([connectorInsDelRoute]),
    addPortalRoute,
    envDatasourceRoute,
    envLinkRoute,
    envConnectorRoute.addChildren([connectorParamConfigDetailRoute]),
    envShardRoute,
    envModuleRoute,
    envGlobalRoute,
    envPortalRoute,
    envMcpServerRoute,
    usageStatisticsRoute,
  ]),
])

export const router = createRouter({
  routeTree,
  notFoundRoute,
  defaultPendingMs: 0,
  defaultPendingMinMs: 1,
})
