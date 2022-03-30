import { Layout, Col, Row, Typography } from 'antd'
import React, { FC, useEffect, useState } from 'react'
import Heading from '~/components/Heading'
import MainLayout, { PageTitleContext } from '~/layouts/main'
import { useLazyQuery, useMutation } from '@apollo/react-hooks'
import {
  FIND_NOTIFICATIONS_TO_ME,
  FindNotificationToMeResponse,
  Notification,
} from '~/graphhql/queries/findAllNotifications'
import moment from 'moment'
import { japaneseDateTimeFormat, notificationTypes } from '~/lib/displaySetting'
import Table from '~/components/table'
import { Color } from '~/lib/styles'
import { SEE_NOTIFICATION } from '~/graphhql/mutations/seeNotification'
import { FIND_UNREAD_NOTIFICATION_NUMBER } from '~/graphhql/queries/findUnreadNotificationNumber'
import { useAuth } from '~/hooks/useAuth'

type NotificationColumn = {
  key: number
  isSeen: string
  notifyDate: string | undefined
  type: string | undefined
  body: string | undefined
  link: string | undefined
}

const Notifications: FC = () => {
  const { currentUserDepartmentId } = useAuth()

  const [notifications, setNotifications] = useState<Notification[] | undefined>(undefined)

  const [findNotificationsToMe] = useLazyQuery<FindNotificationToMeResponse>(
    FIND_NOTIFICATIONS_TO_ME,
    { fetchPolicy: 'no-cache', onCompleted: (data) => setNotifications(data.findNotificationsToMe) }
  )

  useEffect(() => {
    findNotificationsToMe()
  }, [currentUserDepartmentId, findNotificationsToMe])

  const [seeNotification] = useMutation(SEE_NOTIFICATION, {
    refetchQueries: [
      { query: FIND_NOTIFICATIONS_TO_ME },
      { query: FIND_UNREAD_NOTIFICATION_NUMBER },
    ],
  })

  const [dataSource, setDataSource] = useState<Array<NotificationColumn>>()
  useEffect(() => {
    setDataSource(
      notifications
        ?.map((notification: Notification) => ({
          key: notification.id,
          isSeen: notification.isSeen ? '確認済' : '未確認',
          notifyDate: notification.notifyDate,
          type: notification.template?.type,
          body: notification.message ?? notification.template?.body,
          link: notification.link || notification.template?.link,
        }))
        .sort((a, b) => moment(b.notifyDate).diff(moment(a.notifyDate))) ?? []
    )
  }, [notifications])

  const columns = [
    {
      title: '通知日',
      dataIndex: 'notifyDate',
      key: 'notifyDate',
      width: 130,
      // eslint-disable-next-line react/display-name
      render: (text: string) => (
        <Typography>{moment(text).format(japaneseDateTimeFormat)}</Typography>
      ),
    },
    {
      title: 'isSeen',
      dataIndex: 'isSeen',
      key: 'isSeen',
      width: 100,
      // eslint-disable-next-line react/display-name
      render: (text: string, record: NotificationColumn) => (
        <Typography
          style={{
            color: record.isSeen === '未確認' ? Color.font.red : 'inherit',
            textAlign: 'center',
          }}
        >
          {text}
        </Typography>
      ),
    },
    {
      title: 'type',
      dataIndex: 'type',
      key: 'type',
      width: 130,
      // eslint-disable-next-line react/display-name
      render: (text: string, record: NotificationColumn) => (
        <div
          style={{
            borderColor: Color.neutral.grey,
            borderWidth: 1,
            borderStyle: 'solid',
            textAlign: 'center',
            backgroundColor: notificationTypes[text]['bgColor'],
          }}
        >
          <Typography
            style={{
              color: ['other', 'system'].includes(record.type ?? '')
                ? Color.font.black
                : Color.font.white,
            }}
          >
            {notificationTypes[text].label}
          </Typography>
        </div>
      ),
    },
    {
      title: 'body',
      dataIndex: 'body',
      key: 'body',
      // eslint-disable-next-line react/display-name
      render: (text: string, record: NotificationColumn) => {
        return (
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
          <div
            onClick={() =>
              seeNotification({ variables: { seeNotificationInput: { id: record.key } } })
            }
          >
            <Typography>
              {record.link ? (
                <a href={record.link} style={{ textDecoration: 'underline' }}>
                  {text}
                </a>
              ) : (
                text
              )}
            </Typography>
          </div>
        )
      },
    },
  ]

  return (
    <PageTitleContext.Provider value={'お知らせ'}>
      <MainLayout>
        <Layout style={{ marginLeft: '2rem' }}>
          <Col>
            <Heading.H1 title={'お知らせ'} />
          </Col>
          <Row>
            <Col span={20}>
              <Table
                size={'middle'}
                bordered={false}
                columns={columns}
                dataSource={dataSource}
                showHeader={false}
              ></Table>
            </Col>
          </Row>
        </Layout>
      </MainLayout>
    </PageTitleContext.Provider>
  )
}

export default Notifications
