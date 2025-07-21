
const ERROR_MESSAGE = "请稍后再试"
const review = {
  id: 1,
  name: "测试",
}
const reviews = [
  {
    id: 1,
    name: "张先生",
  },
  {
    id: 2,
    name: "李女士",
  },
]

const typeNameMap: Record<string, string> = {
  Folder: "文件夹",
  FolderExpanded: "文件夹",
  Model: "持久模型",
  ModelView: "普通模型",
  Statistic: "统计模型",
  Event: "业务事件",
  Action: "扩展服务",
  ServiceConfig: "业务配置",
  Scene: "页面场景",
  ServiceDefinition: "编排服务",
  Flow: "业务流",
  Trigger: "触发器监听",
  EventDefinition: "触发器定义",
  Process: "业务流",
  OverviewProcess: "业务流程",
  WorkflowGroup: "审批流场景",
  NoticeScene: "通知场景",
  PrintScene: "打印场景",
  View: "视图",
  MenuTree: "菜单树",
  TakeCode: "取号中心",
  Connector: "连接器",
  Menu: "菜单",
  Module: "模块",
  StateConfig: "状态配置",
  Validation: "校验规则",
  ImportExportTemplate: "导入导出场景",
  Permission: "功能权限项",
  DataCondition: "数据权限规则",
  DataControlDimension: "数据控权维度",
  AIAgent: "智能体",
  KnowledgeBase: "知识库",
}
