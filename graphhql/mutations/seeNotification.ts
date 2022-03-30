import { gql } from 'apollo-boost'

export type SeeNotificationInput = {
  id: number
}

export const SEE_NOTIFICATION = gql`
  mutation($seeNotificationInput: SeeNotificationInput!) {
    seeNotification(seeNotificationInput: $seeNotificationInput) {
      id
    }
  }
`
