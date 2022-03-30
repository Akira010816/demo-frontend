export type CreateStudyContentInput = {
  text?: StudyContent['text']
}

export const generateCreateStudyContentInputFromEntity = (
  entity: StudyContent
): CreateStudyContentInput => ({
  text: entity.text,
})
