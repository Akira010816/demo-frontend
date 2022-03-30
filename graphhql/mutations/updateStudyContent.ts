export type UpdateStudyContentInput = {
  text?: StudyContent['text']
}

export type UpdateStudyContentRequestTypes = {
  targetInput: UpdateStudyContentInput
}

export type UpdateStudyContentResponse = {
  updateStudyContent: StudyContent
}

export const generateUpdateStudyContentInputFromEntity = (
  entity: StudyContent
): UpdateStudyContentInput => ({
  text: entity.text,
})
