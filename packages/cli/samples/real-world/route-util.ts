import { Route } from '@tanstack/react-router'
import {
  actionsRoute,
  eventDefineRoute,
  eventTriggerRoute,
  folderRoute,
  modelRoute,
  sceneRoute,
  serviceFlowRoute,
  approvalGroupEditRoute,
  serviceConfigRoute,
  OverviewProcessEditRoute,
  noticeSceneRoute,
  printSceneRoute,
  modelNewRoute,
  serviceConfigNewRoute,
  sceneNewRoute,
  serviceFlowCreateRoute,
  actionsNewRoute,
  eventDefineNewRoute,
  eventTriggerNewRoute,
  OverviewProcessCreateRoute,
  approvalGroupCreateRoute,
  permissionFunctionItemRoute,
  dataControlDimensionRoute,
  eventServiceFlowRoute,
  flowCenterRoute,
  statisticModelNewRoute,
  importExportRoute,
  importExportCreateRoute,
  dataConditionRoute,
  sysServicePermissionSettingRoute,
  permissionFunctionItemNewRoute,
  dataControlDimensionNewRoute,
  usageStatisticsRoute,
  dataConditionNewRoute,
  agentAIEditRoute,
  agentAICreateRoute,
  knowledgeBaseEditRoute,
  knowledgeBaseNewRoute,
  noticeSceneNewRoute,
} from '../route'

export function getIconNameByType(type?: string, subType?: string) {
  // fix vite import error
  const iconMap: Record<string, string> = {
    Module: 'wenjianjiaguanbi',
    Folder: 'wenjianjiaguanbi',
    FolderExpanded: 'wenjianjiadakai',
    Model: 'shujumoxing',
    Scene: 'yemianchangjing',
    Event: 'caozuoshijian-pink',
    Action: 'zhixingdongzuo',
    ServiceDefinition: 'bianpaifuwu-green',
    Flow: 'yewuliu-orange',
    Trigger: 'shijianjianting',
    EventDefinition: 'shijiandingyi',
    Process: 'yewuliu-orange',
    OverviewProcess: 'ywlc',
    WorkflowGroup: 'shenpiliuzu',
    ServiceConfig: 'yewupeizhi',
    NoticeScene: 'tongzhichangjing',
    PrintScene: 'dayinchangjing',
    ImportExportTemplate: 'drdc',
    Permission: 'gongnengquanxianxiang',
    DataCondition: 'shujuquanxianguize',
    DataControlDimension: 'kongquanweidu',
    AIAgent: 'zhinengzhushou',
    KnowledgeBase: 'AIzhishiku',
  }
  if (subType === 'EVENT') {
    subType = 'Event'
  }
  return iconMap[subType ?? type!]
}

/**
 * 资源详情的页面路由
 */
const resourceRouteMap = {
  Model: modelRoute,
  Scene: sceneRoute,
  Event: eventServiceFlowRoute,
  Action: actionsRoute,
  ServiceDefinition: serviceFlowRoute,
  Trigger: eventTriggerRoute,
  EventDefinition: eventDefineRoute,
  Module: folderRoute,
  Folder: folderRoute,
  Process: OverviewProcessEditRoute,
  OverviewProcess: OverviewProcessEditRoute,
  WorkflowGroup: approvalGroupEditRoute,
  ServiceConfig: serviceConfigRoute,
  NoticeScene: noticeSceneRoute,
  PrintScene: printSceneRoute,
  ImportExportTemplate: importExportRoute,
  // fake type
  Permission: permissionFunctionItemRoute,
  DataControlDimension: dataControlDimensionRoute,
  FlowCenter: flowCenterRoute,
  DataCondition: dataConditionRoute,
  SysServiceDefinition: sysServicePermissionSettingRoute,
  UsageStatistics: usageStatisticsRoute,
  AIAgent: agentAIEditRoute,
  KnowledgeBase: knowledgeBaseEditRoute,
}

export const routeIdResourceTypeMap = Object.entries(resourceRouteMap).reduce(
  (acc, [type, route]) => {
    acc[route.id] = type
    return acc
  },
  {} as Record<string, string>,
)

export function getNavigateRouteByType(type?: string): Route | undefined {
  // @ts-ignore
  const route = resourceRouteMap[type!]

  if (route) {
    return route
  }
  return undefined
}

/**
 * 资源在路由上所使用的资源key对应的paramName, 最好直接写Key, 这样就不用定义
 */
export const resourceTypeParamNameMap: Record<string, string> = {
  Model: 'modelKey',
  Scene: 'sceneId',
  Event: 'eventKey',
  Action: 'actionKey',
  Module: 'folderKey',
  ServiceDefinition: 'serviceKey',
  Flow: 'flowKey',
  Folder: 'folderKey',
  Trigger: 'eventTriggerKey',
  EventDefinition: 'eventDefineKey',
  WorkflowGroup: 'approvalGroupKey',
  ServiceConfig: 'configKey',
  Process: 'BPMKey', // 业务流
  OverviewProcess: 'BPMKey', // 溢出流程
  NoticeScene: 'noticeSceneKey', // 通知场景
  PrintScene: 'printSceneKey', // 打印场景
  ImportExportTemplate: 'importExportKey', // 导入导出模板
  Permission: 'permissionKey',
  DataCondition: 'dataConditionKey',
  DataControlDimension: 'permissionKey',
  // fake type
  FlowCenter: 'flowCenterKey',
  SysServiceDefinition: 'serviceKey',
  KnowledgeBase: 'key',
}

function isSystemServiceKey(serviceKey: string) {
  return serviceKey.startsWith('SYS_') || serviceKey.includes('$SYS_')
}
/**
 * 获取资源路由
 * @param baseParams
 * @param type
 * @param key
 * @param onlyProcess
 */
export function getNavigateInfoByType({
  baseParams,
  type,
  key,
  onlyProcess,
}: {
  key: string
  type?: string
  baseParams: Record<string, any>
  onlyProcess?: boolean
}) {
  type = onlyProcess && type === 'Folder' ? 'FlowCenter' : type
  if (type === 'ServiceDefinition' && isSystemServiceKey(key)) {
    type = 'SysServiceDefinition'
  }
  const paramsName = resourceTypeParamNameMap[type!]
  const to = getNavigateRouteByType(type)?.to
  if (!to) return { to: undefined, params: undefined }
  return {
    params: {
      ...baseParams,
      [paramsName ?? 'key']: key,
    },
    to,
  }
}

/**
 * 新建资源时使用的路由
 */
const newResourceRouteMap = {
  Model: modelNewRoute,
  ModelView: modelNewRoute,
  ServiceConfig: serviceConfigNewRoute,
  Statistic: statisticModelNewRoute,
  Scene: sceneNewRoute,
  ServiceDefinition: serviceFlowCreateRoute,
  Event: serviceFlowCreateRoute,
  Action: actionsNewRoute,
  EventDefinition: eventDefineNewRoute,
  Trigger: eventTriggerNewRoute,
  Process: OverviewProcessCreateRoute,
  OverviewProcess: OverviewProcessCreateRoute,
  WorkflowGroup: approvalGroupCreateRoute,
  NoticeScene: noticeSceneNewRoute,
  ImportExportTemplate: importExportCreateRoute,
  Permission: permissionFunctionItemNewRoute,
  DataControlDimension: dataControlDimensionNewRoute,
  DataCondition: dataConditionNewRoute,
  AIAgent: agentAICreateRoute,
  KnowledgeBase: knowledgeBaseNewRoute,

  // fake type
}

export function getNavigateNewRouteByType(type?: string): Route | undefined {
  // @ts-ignore
  const route = newResourceRouteMap[type!]
  if (route) {
    return route
  }
  return undefined
}

/**
 * 获取新建资源路由
 * @param baseParams
 * @param type
 */
export function getNavigateNewInfoByType({
  baseParams,
  type,
}: {
  type?: string
  baseParams: Record<string, any>
}) {
  const isModel = type === 'Model' || type === 'ModelView'
  const serviceType =
    type === 'ServiceDefinition'
      ? 'PROGRAMMABLE'
      : type === 'Event'
        ? 'EVENT'
        : undefined
  return {
    params: {
      ...baseParams,
      modelType: isModel ? (type === 'Model' ? 'PERSIST' : 'VIEW') : undefined,
      serviceType,
    },
    to: getNavigateNewRouteByType(type)?.to,
  }
}

export const typeColorMap: Record<string, string> = {
  Folder: '#CDD0D6',
  FolderExpanded: '#CDD0D6',
  Model: '#1EBFF9',
  Scene: '#31E4CC',
  Event: '#9984F6',
  Action: '#F78576',
  ServiceDefinition: '#7FEA89',
  Flow: '#F79B68',
  Trigger: '#9984F6',
  EventDefinition: '#9984F6',
  Process: '#F79B68',
  WorkflowGroup: '#F79B68',
  NoticeScene: '#7FEA89',
  PrintScene: '#31E4CC',
  Permission: '#31E4CC',
  DataCondition: '#31E4CC',
  DataControlDimension: '#31E4CC',
  AIAgent: '#31E4CC',
  KnowledgeBase: '#31E4CC',
}

export function getColorByType(type?: string) {
  return typeColorMap[type || 'Folder']
}

const typeNameMap: Record<string, string> = {
  Folder: '文件夹',
  FolderExpanded: '文件夹',
  Model: '持久模型',
  ModelView: '普通模型',
  Statistic: '统计模型',
  Event: '业务事件',
  Action: '扩展服务',
  ServiceConfig: '业务配置',
  Scene: '页面场景',
  ServiceDefinition: '编排服务',
  Flow: '业务流',
  Trigger: '触发器监听',
  EventDefinition: '触发器定义',
  Process: '业务流',
  OverviewProcess: '业务流程',
  WorkflowGroup: '审批流场景',
  NoticeScene: '通知场景',
  PrintScene: '打印场景',
  View: '视图',
  MenuTree: '菜单树',
  TakeCode: '取号中心',
  Connector: '连接器',
  Menu: '菜单',
  Module: '模块',
  StateConfig: '状态配置',
  Validation: '校验规则',
  ImportExportTemplate: '导入导出场景',
  Permission: '功能权限项',
  DataCondition: '数据权限规则',
  DataControlDimension: '数据控权维度',
  AIAgent: '智能体',
  KnowledgeBase: '知识库',
}

export function getNameByType(type?: string) {
  return typeNameMap[type!]
}
