import gql from 'graphql-tag'

export const FIND_UNREAD_NOTIFICATION_NUMBER = gql`
  query findUnreadNotificationNumber {
    findUnreadNotificationNumber {
      unreadCount
    }
  }
`
