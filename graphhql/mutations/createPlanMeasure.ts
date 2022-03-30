import { gql } from 'apollo-boost'
import { PlanMeasureTaskInput } from './updatePlanMeasureTask'
import { PlanMeasureSaleInput } from './updatePlanMeasureEffectSale'
import { PlanMeasureCostInput } from './updatePlanMeasureCost'
import { PlanMeasureRiskInput } from './updatePlanMeasureRisk'
import { Profile } from '../queries/findProfile'
import { PlanMeasureClassificationTypes } from '~/lib/displaySetting'

export type CreatePlanMeasureInput = {
  measureName?: string
  overview?: string
  classification?: string
  businessYear: BusinessYearInput
  department: DepartmentInput
  registeredBy: UserDepartmentInput
  risks?: Array<PlanMeasureRiskInput>
  sales?: Array<PlanMeasureSaleInput>
  costs?: Array<PlanMeasureCostInput>
  tasks?: Array<PlanMeasureTaskInput>
}

export type CreatePlanMeasureRequestVars = {
  createPlanMeasureInput: CreatePlanMeasureInput
}

export type CreatePlanMeasureResponse = {
  createPlanMeasure: PlanMeasure
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

//Mock department, businessYear
const mockRegisteredBy = {
  id: 1,
  departmentId: 5,
  userId: 1,
}

export const generateCreatePlanMeasureInputFromEntity = (
  entity: PlanMeasure,
  profile?: Profile
): CreatePlanMeasureInput => {
  const departmentBusinessYear = { ...mockDepartmentBusinessYear }
  const businessYear = { ...mockBusinessYear }
  const registeredBy = { ...mockRegisteredBy }
  const businessYearId = entity.businessYear?.id
  if (businessYearId != undefined) {
    departmentBusinessYear.businessYear.id = businessYearId
    businessYear.businessYear.id = businessYearId
  }
  if (
    profile &&
    profile.currentUserDepartmentId != undefined &&
    profile.currentDepartmentId != undefined
  ) {
    departmentBusinessYear.department.id = profile.currentDepartmentId
    registeredBy.id = profile.currentUserDepartmentId
    registeredBy.userId = Number(profile.id)
    registeredBy.departmentId = profile.currentDepartmentId
  }
  return {
    measureName: entity.measureName,
    overview: entity.overview,
    classification: entity.classification,
    ...departmentBusinessYear,
    registeredBy: registeredBy,
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
                  riskInput.assigns.map(
                    (assign): PlanMeasureAssignInput => {
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
                    }
                  ),
                prices: riskInput.prices.map((price) => {
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
                      costTI: null,
                      costTD: null,
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
                prices: saleInput.prices.map(
                  (price): PlanMeasurePriceInput => {
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
                  }
                ),
              }
            }
            return {
              id,
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
                prices:
                  costInput.prices.map(
                    (price): PlanMeasurePriceInput => {
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
                    }
                  ) || [],
              }
            }
            return {
              id,
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
                      costTI: null,
                      costTD: null,
                    }
                  }
                }),
              prices:
                costInput.prices.map((price) => {
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
                }) || [],
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
            if (!taskInput.kpiPeriod) delete taskInput.kpiPeriod
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
                allocations: taskInput.allocations.map((allocation) => {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  const { tempId, id, ...allocationInput } = allocation
                  if (id) {
                    return {
                      id,
                      ...allocationInput,
                      ...departmentBusinessYear,
                    }
                  }
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
              allocations: taskInput.allocations.map((allocation) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { tempId, id, ...allocationInput } = allocation
                if (id) {
                  return {
                    id,
                    ...allocationInput,
                    ...departmentBusinessYear,
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

export const CREATE_PLAN_MEASURE = gql`
  mutation($createPlanMeasureInput: CreatePlanMeasureInput!) {
    createPlanMeasure(createPlanMeasureInput: $createPlanMeasureInput) {
      id
      code
      overview
      measureName
      classification
    }
  }
`
