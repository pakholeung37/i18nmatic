import type { IBehavior } from '@terminus/t-console-designer-runtime'
import { nanoid } from 'nanoid'
import { merge } from 'lodash-es'
import { FormStepDesigner } from './form-step-designer/form-step'
import FormStepJson from './form-step.behavior.json'

export type FormStepProps = {
  // 默认状态
  items?: { key: string; name: string }[]
  showStepTime?: boolean
  showStep?: boolean
  modelAlias?: string
  nodeFinishTimeKey?: string
}

/**
 * 页签-字段联动配置,目前不需要传 fieldType 和 options
 */
export const FormStepBehavior: IBehavior<FormStepProps> = merge({}, FormStepJson, {
  designerProps: {
    component: FormStepDesigner,
  },
  createNodeTiming(workspaceService, { timing, origin }) {
    if (timing === 'dragOver') {
      return {
        ...origin,
        props: {
          ...origin.props,
          items: [
            { name: '步骤1', key: nanoid() },
            { name: '步骤2', key: nanoid() },
            { name: '步骤3', key: nanoid() },
          ],
        },
        children: [
          workspaceService.createNode('FormStepFooter', undefined, [
            workspaceService.createNode('ActionsGroup', undefined, [
              workspaceService.createNode('ActionsGroupItem', undefined, [
                workspaceService.createNode('Button', {
                  eventActions: [
                    {
                      actions: [
                        {
                          type: 'OpenView',
                          actionId: nanoid(8),
                          config: {
                            openViewConfig: {
                              refresh: true,
                              type: 'Previous',
                            },
                          },
                        },
                      ],
                    },
                  ],
                  label: '取消',
                }),
                workspaceService.createNode('Button', {
                  eventActions: [
                    {
                      actions: [
                        {
                          type: 'CustomAction',
                          actionId: nanoid(8),
                          config: {
                            executeAction: {
                              key: 'prev',
                              target: origin.key,
                            },
                          },
                        },
                      ],
                    },
                  ],
                  showCondition: {
                    conditions: [
                      {
                        conditions: [
                          {
                            id: nanoid(),
                            leftValue: {
                              fieldType: 'Text',
                              options: [],
                              scope: 'page',
                              target: `${origin.key}`,
                              title: '步骤表单当前步骤',
                              type: 'VarValue',
                              val: `${origin.key}.current`,
                              value: `${origin.key}.current`,
                              varVal: `${origin.key}.current`,
                            },
                            operator: 'NEQ',
                            rightValue: {
                              constValue: '1',
                              fieldType: 'Text',
                              type: 'ConstValue',
                              valueType: 'CONST',
                            },
                            type: 'ConditionLeaf',
                          },
                        ],
                        id: nanoid(),
                        logicOperator: 'AND',
                        type: 'ConditionGroup',
                      },
                    ],
                    id: nanoid(),
                    logicOperator: 'OR',
                    type: 'ConditionGroup',
                  },
                  label: '上一步',
                }),
                workspaceService.createNode('Button', {
                  eventActions: [
                    {
                      actions: [
                        {
                          type: 'CustomAction',
                          actionId: nanoid(8),
                          config: {
                            executeAction: {
                              key: 'validate',
                              target: origin.key,
                            },
                          },
                        },
                        {
                          type: 'CustomAction',
                          actionId: nanoid(8),
                          config: {
                            executeAction: {
                              key: 'next',
                              target: origin.key,
                            },
                          },
                        },
                      ],
                    },
                  ],
                  showCondition: {
                    conditions: [
                      {
                        conditions: [
                          {
                            id: nanoid(),
                            leftValue: {
                              fieldType: 'Text',
                              options: [],
                              scope: 'page',
                              target: `${origin.key}`,
                              title: '步骤表单当前步骤',
                              type: 'VarValue',
                              val: `${origin.key}.current`,
                              value: `${origin.key}.current`,
                              varVal: `${origin.key}.current`,
                            },
                            operator: 'NEQ',
                            rightValue: {
                              constValue: '3',
                              fieldType: 'Text',
                              type: 'ConstValue',
                              valueType: 'CONST',
                            },
                            type: 'ConditionLeaf',
                          },
                        ],
                        id: nanoid(),
                        logicOperator: 'AND',
                        type: 'ConditionGroup',
                      },
                    ],
                    id: nanoid(),
                    logicOperator: 'OR',
                    type: 'ConditionGroup',
                  },
                  type: 'primary',
                  label: '下一步',
                }),
                workspaceService.createNode('Button', {
                  type: 'primary',
                  label: '提交',
                }),
              ]),
              workspaceService.createNode('ActionsGroupItem', undefined),
              workspaceService.createNode('ActionsGroupItem', undefined),
            ])!,
          ])!,
          workspaceService.createNode(
            'FormStepItem',
            {
              label: '步骤1',
            },
            [
              workspaceService.createNode('FormGroup', {
                label: '步骤1表单',
              })!,
            ],
          )!,
          workspaceService.createNode(
            'FormStepItem',
            {
              label: '步骤2',
            },
            [
              workspaceService.createNode('FormGroup', {
                label: '步骤2表单',
              })!,
            ],
          )!,
          workspaceService.createNode(
            'FormStepItem',
            {
              label: '步骤3',
            },
            [
              workspaceService.createNode('FormGroup', {
                label: '步骤3表单',
              })!,
            ],
          )!,
        ],
      }
    }
    return origin
  },
} as Partial<IBehavior<FormStepProps>>)
