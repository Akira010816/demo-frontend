import gql from 'graphql-tag'
import { NotificationTypes } from '~/lib/displaySetting'

export type NotificationTemplate = { type?: NotificationTypes; body?: string; link: string }
export type Notification = {
  id: number
  notifyDate?: string
  isSeen?: boolean
  raisedBy?: UserDepartment
  template?: NotificationTemplate
  link?: string
  message?: string
}

export type FindNotificationToMeResponse = {
  findNotificationsToMe: Array<Notification>
}

export const FIND_NOTIFICATIONS_TO_ME = gql`
  query findNotificationsToMe {
    findNotificationsToMe {
      id
      isSeen
      notifyDate
      createdAt
      updatedAt
      link
      message
      raisedBy {
        id
        user {
          name
        }
      }
      template {
        type
        body
        link
      }
    }
  }
`
