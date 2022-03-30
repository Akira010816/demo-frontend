import { gql } from 'apollo-boost'
import { PlanMeasureTaskInput } from './updatePlanMeasureTask'
import { PlanMeasureCostInput } from './updatePlanMeasureCost'
import { PlanMeasureSaleInput } from './updatePlanMeasureEffectSale'
import { PlanMeasureRiskInput } from './updatePlanMeasureRisk'
import { PlanMeasureClassificationTypes } from '~/lib/displaySetting'
import { Profile } from '../queries/findProfile'

export type SetMeasureInput = {
  id: number
}

export type UpdatePlanMeasureInput = {
  id: number
  code: string
  measureName: string
  overview?: string
  classification?: string
  version?: number
  businessYear?: BusinessYearInput
  department?: DepartmentInput
  registeredBy?: UserDepartmentInput
  risks?: Array<PlanMeasureRiskInput>
  sales?: Array<PlanMeasureSaleInput>
  costs?: Array<PlanMeasureCostInput>
  tasks?: Array<PlanMeasureTaskInput>
}

export type UpdatePlanMeasureRequestVars = {
  updatePlanMeasureInput: UpdatePlanMeasureInput
}

export type UpdatePlanMeasureResponse = {
  updatePlaneMeasure: PlanMeasure
}

//Mock department, businessYear
const mockDepartmentBusinessYear = {
  department: {
    id: 1,
  },
  businessYear: {
    id: 4,
  },
}

//Mock businessYear
const mockBusinessYear = {
  businessYear: {
    id: 4,
  },
}

export const generateUpdatePlanMeasureInputFromEntity = (
  entity: PlanMeasure,
  profile?: Profile
): UpdatePlanMeasureInput => {
  const departmentBusinessYear = { ...mockDepartmentBusinessYear }
  const businessYear = { ...mockBusinessYear }
  const businessYearId = entity.businessYear?.id
  if (businessYearId != undefined) {
    departmentBusinessYear.businessYear.id = businessYearId
    businessYear.businessYear.id = businessYearId
  }
  if (profile && profile.currentDepartmentId != undefined) {
    departmentBusinessYear.department.id = profile.currentDepartmentId
  }
  return {
    id: entity.id ?? 0,
    code: entity.code ?? '',
    measureName: entity.measureName ?? '',
    overview: entity.overview,
    classification: entity.classification ?? undefined,
    version: entity.version || 1,
    risks:
      (entity.classification == PlanMeasureClassificationTypes.riskAvoidance.propertyName &&
        entity.risks &&
        entity.risks.map(
          (risk): PlanMeasureRiskInput => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, isNew, ...riskInput } = risk
            if (isNew) {
              return {
                ...riskInput,
                ...departmentBusinessYear,
                assigns:
                  riskInput.assigns &&
                  riskInput.assigns.map((assign) => {
                    if (assign.costTD) {
                      return {
                        ...assign,
                        ...departmentBusinessYear,
                        costTD: {
                          department: {
                            id: assign.costTD.department?.id,
                            name: assign.costTD.department?.name,
                          },
                          ...businessYear,
                        },
                        costTI: null,
                      }
                    } else if (assign.costTI) {
                      return {
                        ...assign,
                        ...departmentBusinessYear,
                        costTI: {
                          userDpm: {
                            id: assign.costTI.userDpm?.id,
                            userId: assign.costTI.userDpm?.user.id,
                            departmentId: assign.costTI.userDpm?.department.id,
                          },
                          ...departmentBusinessYear,
                        },
                        costTD: null,
                      }
                    } else {
                      return {
                        ...assign,
                        ...departmentBusinessYear,
                        costTD: null,
                        costTI: null,
                      }
                    }
                  }),
                prices: riskInput.prices.map((price) => {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  const { tempId, id, ...priceInput } = price
                  return {
                    ...priceInput,
                    ...departmentBusinessYear,
                  }
                }),
              }
            }
            return {
              id,
              ...riskInput,
              ...departmentBusinessYear,
              version: riskInput.version || 1,
              assigns:
                riskInput.assigns &&
                riskInput.assigns.map((assign) => {
                  if (assign.costTD) {
                    const assignDepartmentInput: PlanMeasureAssignInput = {
                      ...assign,
                      ...departmentBusinessYear,
                      version: assign.version || 1,
                      costTD: {
                        id: assign.costTD.id,
                        version: assign.costTD.version || 1,
                        department: {
                          id: assign.costTD.department?.id,
                        },
                        ...businessYear,
                      },
                      costTI: null,
                    }
                    if (!assignDepartmentInput.id) {
                      delete assignDepartmentInput.id
                      delete assignDepartmentInput.costTD?.id
                    }
                    return assignDepartmentInput
                  } else if (assign.costTI) {
                    const assignUserDepartmentInput: PlanMeasureAssignInput = {
                      ...assign,
                      ...departmentBusinessYear,
                      version: assign.version || 1,
                      costTI: {
                        id: assign.costTI.id,
                        userDpm: {
                          id: assign.costTI.userDpm?.id,
                          userId: assign.costTI.userDpm?.user.id,
                          departmentId: assign.costTI.userDpm?.department.id,
                        },
                        ...departmentBusinessYear,
                      },
                      costTD: null,
                    }
                    if (!assignUserDepartmentInput.id) {
                      delete assignUserDepartmentInput.id
                      delete assignUserDepartmentInput.costTI?.id
                    }
                    return assignUserDepartmentInput
                  } else {
                    return {
                      ...assign,
                      ...departmentBusinessYear,
                      costTD: null,
                      costTI: null,
                    }
                  }
                }),
              prices: riskInput.prices.map((price) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { tempId, id, ...priceInput } = price
                if (id) {
                  return {
                    id,
                    ...priceInput,
                    ...departmentBusinessYear,
                    version: priceInput.version || 1,
                  }
                }
                return {
                  ...priceInput,
                  ...departmentBusinessYear,
                }
              }),
            }
          }
        )) ||
      [],
    sales:
      (entity.sales &&
        entity.sales.map(
          (sale): PlanMeasureSaleInput => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { isNew, id, ...saleInput } = sale
            if (isNew) {
              return {
                ...saleInput,
                ...departmentBusinessYear,
                prices: saleInput.prices.map((price) => {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  const { tempId, id, ...priceInput } = price
                  if (id) {
                    return {
                      id,
                      ...priceInput,
                      ...departmentBusinessYear,
                    }
                  }
                  return {
                    ...priceInput,
                    ...departmentBusinessYear,
                  }
                }),
              }
            }
            return {
              id,
              ...saleInput,
              ...departmentBusinessYear,
              version: saleInput.version || 1,
              prices: saleInput.prices.map((price) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { tempId, id, ...priceInput } = price
                if (id) {
                  return {
                    id,
                    ...priceInput,
                    ...departmentBusinessYear,
                    version: priceInput.version || 1,
                  }
                }
                return {
                  ...priceInput,
                  ...departmentBusinessYear,
                }
              }),
            }
          }
        )) ||
      [],
    costs:
      (entity.costs &&
        entity.costs.map(
          (cost): PlanMeasureCostInput => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, isNew, ...costInput } = cost
            if (isNew) {
              return {
                ...costInput,
                ...departmentBusinessYear,
                assigns:
                  costInput.assigns &&
                  costInput.assigns.map((assign) => {
                    if (assign.costTD) {
                      return {
                        ...assign,
                        ...departmentBusinessYear,
                        costTD: {
                          department: {
                            id: assign.costTD.department?.id,
                          },
                          ...businessYear,
                        },
                        costTI: null,
                      }
                    } else if (assign.costTI) {
                      return {
                        ...assign,
                        ...departmentBusinessYear,
                        costTI: {
                          userDpm: {
                            id: assign.costTI.userDpm?.id,
                            userId: assign.costTI.userDpm?.user.id,
                            departmentId: assign.costTI.userDpm?.department.id,
                          },
                          ...departmentBusinessYear,
                        },
                        costTD: null,
                      }
                    } else {
                      return {
                        ...assign,
                        ...departmentBusinessYear,
                        costTD: null,
                        costTI: null,
                      }
                    }
                  }),
                prices: costInput.prices.map((price) => {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  const { tempId, id, ...priceInput } = price
                  return {
                    ...priceInput,
                    ...departmentBusinessYear,
                  }
                }),
              }
            }
            return {
              id,
              ...costInput,
              ...departmentBusinessYear,
              version: costInput.version || 1,
              assigns:
                costInput.assigns &&
                costInput.assigns.map((assign) => {
                  if (assign.costTD) {
                    const assignDepartmentInput: PlanMeasureAssignInput = {
                      ...assign,
                      ...departmentBusinessYear,
                      version: assign.version || 1,
                      costTD: {
                        id: assign.costTD.id,
                        department: {
                          id: assign.costTD.department?.id,
                          name: assign.costTD.department?.name,
                        },
                        ...businessYear,
                        version: assign.costTD.version || 1,
                      },
                      costTI: null,
                    }
                    if (!assignDepartmentInput.id) {
                      delete assignDepartmentInput.id
                      delete assignDepartmentInput.costTD?.id
                    }
                    return assignDepartmentInput
                  } else if (assign.costTI) {
                    const assignUserDepartmentInput: PlanMeasureAssignInput = {
                      ...assign,
                      ...departmentBusinessYear,
                      costTI: {
                        id: assign.costTI.id,
                        userDpm: {
                          id: assign.costTI.userDpm?.id,
                          userId: assign.costTI.userDpm?.user.id,
                          departmentId: assign.costTI.userDpm?.department.id,
                        },
                        ...departmentBusinessYear,
                      },
                      costTD: null,
                    }
                    if (!assignUserDepartmentInput.id) {
                      delete assignUserDepartmentInput.id
                      delete assignUserDepartmentInput.costTI?.id
                    }
                    return assignUserDepartmentInput
                  } else {
                    return {
                      ...assign,
                      ...departmentBusinessYear,
                      costTI: null,
                      costTD: null,
                    }
                  }
                }),
              prices: costInput.prices.map((price) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { tempId, id, ...priceInput } = price
                if (id) {
                  return {
                    id,
                    ...priceInput,
                    ...departmentBusinessYear,
                    version: priceInput.version || 1,
                  }
                }
                return {
                  ...priceInput,
                  ...departmentBusinessYear,
                }
              }),
            }
          }
        )) ||
      [],
    tasks:
      (entity.tasks &&
        entity.tasks.map(
          (task): PlanMeasureTaskInput => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, isNew, ...taskInput } = task
            if (!taskInput.kpiPeriod) taskInput.kpiPeriod = undefined
            if (isNew) {
              return {
                ...taskInput,
                ...departmentBusinessYear,
                assigns:
                  taskInput.assigns &&
                  taskInput.assigns.map((assign) => {
                    if (assign.costTD) {
                      return {
                        ...assign,
                        ...departmentBusinessYear,
                        costTD: {
                          department: {
                            id: assign.costTD.department?.id,
                          },
                          ...businessYear,
                        },
                        costTI: null,
                      }
                    } else if (assign.costTI) {
                      return {
                        ...assign,
                        ...departmentBusinessYear,
                        costTI: {
                          userDpm: {
                            id: assign.costTI.userDpm?.id,
                            userId: assign.costTI.userDpm?.user.id,
                            departmentId: assign.costTI.userDpm?.department.id,
                          },
                          ...departmentBusinessYear,
                        },
                        costTD: null,
                      }
                    } else {
                      return {
                        ...assign,
                        ...departmentBusinessYear,
                        costTD: null,
                        costTI: null,
                      }
                    }
                  }),
                prices: taskInput.prices.map((price) => {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  const { tempId, id, ...priceInput } = price
                  return {
                    ...priceInput,
                    ...departmentBusinessYear,
                  }
                }),
                allocations: taskInput.allocations.map((allocation) => {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  const { tempId, id, ...allocationInput } = allocation
                  return {
                    ...allocationInput,
                    ...departmentBusinessYear,
                  }
                }),
              }
            }
            return {
              id,
              ...taskInput,
              ...departmentBusinessYear,
              version: taskInput.version || 1,
              assigns:
                taskInput.assigns &&
                taskInput.assigns.map(
                  (assign): PlanMeasureAssignInput => {
                    if (assign.costTD) {
                      const assignDepartmentInput: PlanMeasureAssignInput = {
                        ...assign,
                        ...departmentBusinessYear,
                        costTD: {
                          id: assign.costTD.id,
                          department: {
                            id: assign.costTD.department?.id,
                            name: assign.costTD.department?.name,
                          },
                          ...businessYear,
                          version: assign.costTD.version || 1,
                        },
                        costTI: null,
                      }
                      if (!assignDepartmentInput.id) {
                        delete assignDepartmentInput.id
                        delete assignDepartmentInput.costTD?.id
                      }
                      return assignDepartmentInput
                    } else if (assign.costTI) {
                      const assignUserDepartmentInput: PlanMeasureAssignInput = {
                        ...assign,
                        ...departmentBusinessYear,
                        version: assign.version || 1,
                        costTI: {
                          id: assign.costTI.id,
                          userDpm: {
                            id: assign.costTI.userDpm?.id,
                            userId: assign.costTI.userDpm?.user.id,
                            departmentId: assign.costTI.userDpm?.department.id,
                          },
                          ...departmentBusinessYear,
                        },
                        costTD: null,
                      }
                      if (!assignUserDepartmentInput.id) {
                        delete assignUserDepartmentInput.id
                        delete assignUserDepartmentInput.costTI?.id
                      }
                      return assignUserDepartmentInput
                    } else {
                      return {
                        ...assign,
                        ...departmentBusinessYear,
                        costTD: null,
                        costTI: null,
                      }
                    }
                  }
                ),
              prices: taskInput.prices.map((price) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { tempId, id, ...priceInput } = price
                if (id) {
                  return {
                    id,
                    ...priceInput,
                    ...departmentBusinessYear,
                    version: priceInput.version || 1,
                  }
                }
                return {
                  ...priceInput,
                  ...departmentBusinessYear,
                }
              }),
              allocations: taskInput.allocations.map((allocation) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { tempId, id, ...allocationInput } = allocation
                if (id) {
                  return {
                    id,
                    ...allocationInput,
                    ...departmentBusinessYear,
                    version: allocationInput.version || 1,
                  }
                }
                return {
                  ...allocationInput,
                  ...departmentBusinessYear,
                }
              }),
            }
          }
        )) ||
      [],
  }
}

export const UPDATE_PLAN_MEASURE = gql`
  mutation($updatePlanMeasureInput: UpdatePlanMeasureInput!) {
    updatePlanMeasure(updatePlanMeasureInput: $updatePlanMeasureInput) {
      id
      code
      measureName
      overview
      classification
      version
      businessYear {
        id
      }
    }
  }
`
