export type UpdateMeasureImplementationTaskInput = {
  id?: MeasureImplementationTask['id']
  name?: MeasureImplementationTask['name']
  type?: MeasureImplementationTask['type']
  overview?: MeasureImplementationTask['overview']
  newSystemName?: MeasureImplementationTask['newSystemName']
  systemOverview?: MeasureImplementationTask['systemOverview']
  targetSystem?: System['id']
  affectedSystems?: Array<System['id']>
  purchaseTargets?: Array<ItAssetType['id']>
  abandonmentTargets?: Array<ItAssetType['id']>
  participants?: MeasureImplementationTask['participants']
  scopes?: MeasureImplementationTask['scopes']
  participantScopeRoles?: MeasureImplementationTask['participantScopeRoles']
  modificationDescription?: MeasureImplementationTask['modificationDescription']
  procurementScope?: MeasureImplementationTask['procurementScope']
  implementationDetail?: MeasureImplementationTask['implementationDetail']
  investigationDescription?: MeasureImplementationTask['investigationDescription']
  procurementDescription?: MeasureImplementationTask['procurementDescription']
  implementTarget?: MeasureImplementationTask['implementTarget']
  startAt?: MeasureImplementationTask['startAt']
  endAt?: MeasureImplementationTask['endAt']
  ganttId: MeasureImplementationTask['ganttId']
}

export const generateUpdateMeasureImplementationTaskInputFromEntity = (
  entity: MeasureImplementationTask
): UpdateMeasureImplementationTaskInput => ({
  id: entity.id,
  ganttId: entity.ganttId,
  name: entity.name,
  type: entity.type,
  overview: entity.overview,
  newSystemName: entity.newSystemName,
  systemOverview: entity.systemOverview,
  targetSystem: entity.targetSystem?.id,
  affectedSystems: entity.affectedSystems?.map((system) => system.id),
  purchaseTargets: entity.purchaseTargets?.map((itAssetType) => itAssetType.id),
  abandonmentTargets: entity.abandonmentTargets?.map((itAssetType) => itAssetType.id),
  modificationDescription: entity.modificationDescription,
  procurementScope: entity.procurementScope,
  implementationDetail: entity.implementationDetail,
  investigationDescription: entity.investigationDescription,
  procurementDescription: entity.procurementDescription,
  implementTarget: entity.implementTarget,
  participants: entity.participants,
  scopes: entity.scopes,
  participantScopeRoles: entity.participantScopeRoles,
  startAt: entity.startAt,
  endAt: entity.endAt,
})
