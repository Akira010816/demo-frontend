import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { gantt } from 'dhtmlx-gantt'
import debounce from 'lodash.debounce'
import './gantt.css'
import { priorityLabels } from '~/lib/displaySetting'
import dayjs from 'dayjs'

/**
 * 日付表示単位
 */
export type DateUnitType =
  | 'year' // 年
  | 'halfPeriod' // 半期
  | 'quarter' // 四半期
  | 'month' // 月
  | 'week' // 週
  | 'day' // 日

/**
 * ガントタスク種類
 */
export type GanttTaskType =
  | 'longterm' // 中長期計画
  | 'yearly' // 年度計画
  | 'plan' // 企画
  | 'planTask' // 課題
  | 'measure' // 施策
  | 'measureTask' // タスク
  | 'milestone' // マイルストーン

/**
 * ガントタスク
 */
export type GanttTask = {
  /**
   * ID
   */
  id?: string

  /**
   * 表示名
   */
  text?: string

  /**
   * 開始日
   */
  start_date?: Date

  /**
   * 終了日
   */
  end_date?: Date

  /**
   * 変更前の開始日
   */
  originStartDate?: string

  /**
   * 変更前の終了日
   */
  originEndDate?: string

  /**
   * 日数
   */
  duration?: number

  /**
   * 親ID
   */
  parent?: number

  /**
   * 進捗率
   */
  progress?: number

  /**
   * 優先度
   */
  priority?: Priority

  /**
   * 部署名
   */
  departmentName?: string

  /**
   * ガントタスク種類
   */
  type?: GanttTaskType

  /**
   * 非表示
   */
  hide?: boolean

  /**
   * 企画ID
   */
  projectId?: number

  /**
   * 企画マイルストーンID
   */
  projectMilestoneId?: number

  /**
   * 課題ID
   */
  taskId?: number

  /**
   * 施策ID
   */
  measureId?: number

  /**
   * 実施タスクID
   */
  measureImplementationTaskId?: number
}

/**
 * ガントリンク
 */
export type GanttLink = {
  id: number
  source: number
  target: number
  type: string
}

export type GanttColumn = {
  name: string
  label: string
  tree: boolean
  width: number
  resize?: boolean
  min_width?: number
  template?: () => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editor?: any
}

export type GanttInlineEditState = {
  id: number
  columnName: string
  oldValue: string
  newValue: string
}

/**
 * ガントデータ
 */
export type GanttData = {
  /**
   * タスク一覧
   */
  tasks: GanttTask[]

  /**
   * リンク一覧
   */
  links: GanttLink[]
}

/**
 * ガントプロパティ
 */
export type GanttProps = {
  data: GanttData

  /**
   * 開始日
   */
  startDate?: Date

  /**
   * 日付表示単位
   */
  dateUnitType?: DateUnitType

  /**
   * 日付表示期間(月)
   */
  dateTermMonth?: number

  /**
   *期初めの開始月
   */
  firstMonth?: number

  /**
   * タスクを開いて表示
   */
  taskOpen?: boolean

  /**
   * コラム
   */
  columns?: Array<GanttColumn>

  /**
   * インライン編集可否
   */
  inlineEditing?: boolean

  /**
   * タスクアップデート時
   */
  onAfterTaskUpdate?: (id: string, task: GanttTask, links: GanttLink[]) => void

  /**
   * リンクアップデート時
   */
  onAfterLinkUpdate?: (links: GanttLink[]) => void

  /**
   * スケジュールの編集
   */
  editSchedule?: boolean

  /**
   * グリッド幅
   */
  gridWidth?: number

  /**
   * linkを表示可否
   */
  showLinks?: boolean

  /**
   * tooltipの表示可否
   */
  showTooltip?: boolean

  autoScaleY?: boolean
  eventDblClick?: GanttCallback
}

/*
const iconInfo =
  '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="_x32_" x="0" y="0" xml:space="preserve" width="18" height="18" opacity="1"><style type="text/css" id="style2">.st0{fill:#4b4b4b}</style><g id="g10" transform="scale(.03516)"><path class="st0" d="M437.015 74.978C390.768 28.686 326.619-.014 256 0 185.381-.014 121.231 28.686 74.978 74.978 28.694 121.224-.015 185.381 0 256c-.015 70.612 28.694 134.762 74.978 181.015C121.231 483.314 185.381 512.008 256 512c70.619.008 134.768-28.686 181.015-74.985 46.299-46.253 75-110.403 74.985-181.015.014-70.619-28.686-134.776-74.985-181.022zM403.56 403.552c-37.851 37.798-89.866 61.112-147.56 61.12-57.694-.008-109.709-23.321-147.56-61.12C70.649 365.716 47.336 313.702 47.321 256c.014-57.702 23.328-109.716 61.119-147.552C146.291 70.649 198.306 47.343 256 47.329c57.694.014 109.709 23.32 147.56 61.119 37.791 37.836 61.104 89.851 61.119 147.552-.015 57.702-23.328 109.716-61.119 147.552z" id="path4" fill="#4b4b4b"/><path class="st0" d="M251.694 194.328c21.381 0 38.732-17.343 38.732-38.724 0-21.396-17.351-38.724-38.732-38.724-21.38 0-38.724 17.328-38.724 38.724 0 21.382 17.344 38.724 38.724 38.724z" id="path6" fill="#4b4b4b"/><path class="st0" d="M299.164 362.806h-5.262c-5.387 0-9.761-4.358-9.761-9.746V216.731c0-1.79-.94-3.462-2.47-4.38a5.09 5.09 0 00-5.023-.142l-66.544 36.986c-19.358 9.679-10.068 21.239-2.858 20.94 7.202-.284 28.679-2.41 28.679-2.41v85.336c0 5.388-4.373 9.746-9.761 9.746h-10.336a4.892 4.892 0 00-4.88 4.88v21.284a4.892 4.892 0 004.88 4.881h83.336a4.888 4.888 0 004.881-4.881v-21.284a4.888 4.888 0 00-4.881-4.881z" id="path8" fill="#4b4b4b"/></g></svg>'
*/

export default function Gantt(props: GanttProps): JSX.Element {
  const defaultColumn = [
    {
      name: 'text',
      label: '計画・企画・施策',
      tree: true,
      width: 150,
      min_width: 10,
    },
  ]
  const router = useRouter()
  useEffect(() => {
    let mouseOnGrid = false
    if (typeof window !== 'undefined') {
      const { data, dateUnitType, firstMonth } = props

      gantt.i18n.setLocale('jp')
      gantt.config.xml_date = '%Y/%m/%d %H:%i'
      gantt.plugins({
        tooltip: props.showTooltip === undefined ? true : props.showTooltip,
        marker: true,
      })
      gantt.config.order_branch = true
      gantt.config.bar_height = 18

      gantt.config.show_links = props.showLinks === undefined ? true : props.showLinks

      // 進捗の非表示
      gantt.config.show_progress = false

      // 日曜日から週を始める
      gantt.config.start_on_monday = false

      // ガントチャートを編集不可に変更
      gantt.config.readonly = !props.editSchedule

      if (props.inlineEditing) {
        gantt.templates.grid_folder = (): string => ''
        gantt.templates.grid_file = (): string => ''

        gantt.attachEvent(
          'onAfterTaskUpdate',
          debounce(function (id, task: GanttTask) {
            props.onAfterTaskUpdate?.(id, task, gantt.getLinks())
            return true
          }, 1000),
          { id: 'onAfterTaskUpdate' }
        )

        gantt.attachEvent(
          'onAfterLinkAdd',
          debounce(function () {
            props.onAfterLinkUpdate?.(gantt.getLinks())
            return true
          }, 1000),
          { id: 'onAfterLinkAdd' }
        )
        gantt.attachEvent(
          'onAfterLinkDelete',
          debounce(function () {
            props.onAfterLinkUpdate?.(gantt.getLinks())
            return true
          }, 1000),
          { id: 'onAfterLinkDelete' }
        )
        gantt.attachEvent(
          'onAfterLinkUpdate',
          debounce(function () {
            props.onAfterLinkUpdate?.(gantt.getLinks())
            return true
          }, 1000),
          { id: 'onAfterLinkUpdate' }
        )
      } else {
        // アイコンの色を変更
        const grid_template = function (task: GanttTask): string {
          let color
          if (task.type == 'longterm') {
            // 中長期計画
            color = '65c16f'
          } else if (task.type == 'yearly') {
            // 年度計画
            color = 'f2f67e'
          } else if (task.type == 'plan') {
            // 企画
            color = 'bef67e'
          } else if (task.type == 'planTask') {
            // 課題
            color = '3db9d3'
          } else if (task.type == 'measure') {
            // 施策
            color = 'b0c4de'
          } else if (task.type == 'measureTask') {
            // タスク
            color = 'ffa07a'
          } else if (task.type == 'milestone') {
            // マイルストーン
            color = 'd33daf'
          } else {
            color = '000000'
          }
          // 任意の色でアイコン画像を表示
          return (
            "<div class='gantt_tree_icon' " +
            'style="background-image: url(\'data:image/svg+xml;charset=utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%2264%2064%20896%20896%22%20focusable%3D%22false%22%20data-icon%3D%22file%22%20width%3D%221em%22%20height%3D%221em%22%20fill%3D%22%23' +
            color +
            '%22%20aria-hidden%3D%22true%22%3E%3Cpath%20d%3D%22M854.6%20288.7c6%206%209.4%2014.1%209.4%2022.6V928c0%2017.7-14.3%2032-32%2032H192c-17.7%200-32-14.3-32-32V96c0-17.7%2014.3-32%2032-32h424.7c8.5%200%2016.7%203.4%2022.7%209.4l215.2%20215.3zM790.2%20326L602%20137.8V326h188.2z%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E\');"' +
            '></div>'
          )
        }
        gantt.templates.grid_folder = grid_template
        gantt.templates.grid_file = grid_template
      }

      gantt.init('gantt_here')
      gantt.clearAll()

      if (props.autoScaleY != undefined && props.autoScaleY) {
        gantt.config.autosize = 'y'
      }

      gantt.config.gridWidth = props.gridWidth || 400
      gantt.config.min_column_width = 10
      gantt.config.task_height = 24

      gantt.config.types['longterm'] = 'longterm' // 中長期計画
      gantt.config.types['yearly'] = 'yearly' // 年度計画
      gantt.config.types['plan'] = 'plan' // 企画
      gantt.config.types['planTask'] = 'planTask' // 課題
      gantt.config.types['measure'] = 'measure' // 施策
      gantt.config.types['measureTask'] = 'measureTask' // タスク
      gantt.config.types['milestone'] = 'milestone' // マイルストーン

      // 現在の日付に赤線を表示
      const markerId = gantt.addMarker({
        start_date: new Date(),
        css: 'today',
      })
      gantt.getMarker(markerId)

      gantt.config.columns = props.columns ? props.columns : defaultColumn
      gantt.attachEvent(
        'onMouseMove',
        (id, e) => {
          if (e.clientX >= gantt.config.gridWidth) mouseOnGrid = true
          else mouseOnGrid = false
        },
        { id: 'onMouseMove' }
      )

      if (props.eventDblClick != undefined) {
        gantt.attachEvent('onTaskDblClick', props.eventDblClick, { id: 'onTaskDblClick' })
      } else {
        gantt.attachEvent(
          'onTaskDblClick',
          function (id) {
            gantt.ext.tooltips.tooltip.hide()
            const task: GanttTask = gantt.getTask(id)
            switch (task.type) {
              case 'longterm':
                // 中長期計画
                // TODO 未実装
                break
              case 'yearly':
                // 年度計画
                // TODO 未実装
                break
              case 'plan':
                // 企画
                router.push('/projects/' + task.projectId)
                break
              case 'milestone':
                // マイルストーン
                router.push('/projects/' + task.projectId + '/editSchedule')
                break
              case 'planTask':
                // 課題
                router.push('/projects/' + task.projectId + '/tasks/' + task.taskId + '/edit')
                break
              case 'measure':
              case 'measureTask':
                // 施策
                // タスク
                router.push('/projects/' + task.projectId + '/tasks/' + task.taskId + '/counter')
                break
            }
            return true
          },
          { id: 'onTaskDblClick' }
        )
      }
      gantt.attachEvent(
        'onLinkDblClick',
        function (id) {
          const editLinkId = id
          const taskObj = gantt.getLink(id)
          gantt.confirm({
            text: `${gantt.getTask(taskObj.source).text} → ${
              gantt.getTask(taskObj.target).text
            } のクリティカルパスを削除しますか？`,
            ok: 'はい',
            cancel: 'いいえ',
            callback: function (result: any) {
              console.log(result)
              if (result == true) {
                gantt.deleteLink(editLinkId)
              }
            },
          })
        },
        { id: 'onLinkDblClick' }
      )

      gantt.showLightbox = () => {
        return true
      }

      /*
      if (props.columns != undefined) {
        gantt.config.columns = props.columns
      }
      console.log('gantt.config.columns', gantt.config.columns)
      console.log('props.columns', props.columns)
      */

      gantt.templates.task_text = function () {
        return ''
      }

      if (props.showTooltip) {
        gantt.templates.tooltip_text = function (start, end, task: GanttTask) {
          if (!mouseOnGrid || !start || !end || !task) return ''
          let label = '<b>' + task.text + '</b>'
          const dateToStr = gantt.date.date_to_str('%Y/%m/%d')
          if (task.type == 'milestone') {
            label += '<br/><b>日付: </b>' + dateToStr(start)
          } else {
            label += '<br/><b>期間: </b>' + dateToStr(start) + '〜' + dateToStr(end)
          }
          if (task.progress) {
            label += '<br/><b>進捗率: </b>' + Math.floor(task.progress * 100) + '%'
          }
          if (task.priority) {
            const priority = priorityLabels[task.priority]
            label += '<br/><b>優先度: </b>' + priority
          }
          if (task.departmentName) {
            label = label + '</br><b>オーナー部署: </b>' + ' ' + task.departmentName
          }
          return label
        }
      }

      /*
      if (props.hide_chart != undefined) {
        gantt.config.show_chart = false
        gantt.templates.tooltip_text = function () {
          return ''
        }
      }
      */

      // タスクの非表示を行う
      gantt.attachEvent(
        'onBeforeTaskDisplay',
        function (id, task: GanttTask) {
          if (task.hide) {
            return false
          }
          return true
        },
        { id: 'onBeforeTaskDisplay' }
      )

      gantt.config.scale_height = 24 * 2

      if (dateUnitType != undefined && firstMonth != undefined) {
        // 会計年度の開始日を返します
        gantt.date.fiscal_year_start = function (date: Date) {
          let next = new Date(date)
          if (next.getMonth() < firstMonth - 1) {
            next = gantt.date.add(next, -1, 'year')
          }
          next = gantt.date.year_start(next)
          next.setMonth(firstMonth - 1)
          return next
        }

        // 会計年度用の加算した日付を返します
        gantt.date.add_fiscal_year = function (date: Date, inc: number) {
          return gantt.date.add(date, inc, 'year')
        }

        const fiscalYearLabel = function (date: Date): string {
          let year = date.getFullYear()
          if (date.getMonth() + 1 < firstMonth) {
            year--
          }
          return year + '年度'
        }

        // 表示単位
        if (dateUnitType == 'year') {
          // 年
          gantt.config.min_column_width = 80
          gantt.config.scales = [
            {
              unit: 'fiscal_year',
              step: 1,
              format: fiscalYearLabel,
            },
          ]
        } else if (dateUnitType == 'halfPeriod') {
          // 半期
          gantt.config.min_column_width = 80

          // 半期の開始日を返します
          gantt.date.half_period_start = function (date: Date) {
            gantt.date.month_start(date)
            const y = date.getFullYear()
            const m = date.getMonth() + 1
            let year = y
            let month = m

            // 半期の始まりの月を計算
            const baseFirstMonth = 7 <= firstMonth ? firstMonth - 6 : firstMonth

            if (m <= baseFirstMonth - 1) {
              year--
              month = 6 + baseFirstMonth
            } else if (m <= 6 + baseFirstMonth - 1) {
              month = baseFirstMonth
            } else {
              month = 6 + baseFirstMonth
            }

            date.setFullYear(year)
            date.setMonth(month - 1)
            return date
          }

          // 半期用の加算した日付を返します
          gantt.date.add_half_period = function (date: Date, inc: number) {
            return gantt.date.add(date, inc * 6, 'month')
          }

          gantt.config.scales = [
            {
              unit: 'fiscal_year',
              step: 1,
              format: fiscalYearLabel,
            },
            {
              unit: 'half_period',
              step: 1,
              format: function (date: Date) {
                let h = Math.floor(date.getMonth() / 6) + 1 == 1
                if (7 <= firstMonth) {
                  h = !h
                }
                return h ? '上期' : '下期'
              },
            },
          ]
        } else if (dateUnitType == 'quarter') {
          // 四半期
          gantt.config.min_column_width = 80

          // 四半期用の開始日を返します
          gantt.date.quarter_start = function (date: Date) {
            gantt.date.month_start(date)
            const y = date.getFullYear()
            const m = date.getMonth() + 1
            let year = y
            let month = m

            // 指定した期初めの月で四半期を分ける
            if (firstMonth == 3 || firstMonth == 6 || firstMonth == 9 || firstMonth == 12) {
              // 3月始まりで四半期を分ける
              if (m <= 2) {
                month = 12
                year = y - 1
              } else if (3 <= m && m <= 5) {
                month = 3
              } else if (6 <= m && m <= 8) {
                month = 6
              } else if (9 <= m && m <= 11) {
                month = 9
              } else {
                month = 12
              }
            } else if (firstMonth == 2 || firstMonth == 5 || firstMonth == 8 || firstMonth == 11) {
              // 2月始まりで四半期を分ける
              if (m <= 1) {
                month = 11
                year = y - 1
              } else if (2 <= m && m <= 4) {
                month = 2
              } else if (5 <= m && m <= 7) {
                month = 5
              } else if (8 <= m && m <= 10) {
                month = 8
              } else {
                month = 11
              }
            } else {
              // 1月始まりで四半期を分ける
              if (1 <= m && m <= 3) {
                month = 1
              } else if (4 <= m && m <= 6) {
                month = 4
              } else if (7 <= m && m <= 9) {
                month = 7
              } else {
                month = 10
              }
            }
            date.setFullYear(year)
            date.setMonth(month - 1)
            return date
          }

          // 四半期用の加算した日付を返します
          gantt.date.add_quarter = function (date: Date, inc: number) {
            return gantt.date.add(date, inc * 3, 'month')
          }

          gantt.config.scales = [
            {
              unit: 'fiscal_year',
              step: 1,
              format: fiscalYearLabel,
            },
            {
              unit: 'quarter',
              step: 1,
              format: function (date: Date) {
                // 第一四半期
                let q = Math.floor(date.getMonth() / 3) + 1
                if (10 <= firstMonth) {
                  // 期初めが10月～12月の場合
                  if (q == 1) {
                    q = 2
                  } else if (q == 2) {
                    q = 3
                  } else if (q == 3) {
                    q = 4
                  } else {
                    q = 1
                  }
                } else if (7 <= firstMonth) {
                  // 期初めが7月～9月の場合
                  if (q == 1) {
                    q = 3
                  } else if (q == 2) {
                    q = 4
                  } else if (q == 3) {
                    q = 1
                  } else {
                    q = 2
                  }
                } else if (4 <= firstMonth) {
                  // 期初めが4月～6月の場合
                  if (q == 1) {
                    q = 4
                  } else if (q == 2) {
                    q = 1
                  } else if (q == 3) {
                    q = 2
                  } else {
                    q = 3
                  }
                }
                return q + 'Q'
              },
            },
          ]
        } else if (dateUnitType == 'month') {
          // 月
          gantt.config.min_column_width = 35
          gantt.config.scales = [
            { unit: 'year', step: 1, format: '%Y年' },
            { unit: 'month', step: 1, format: '%F' },
          ]
        } else if (dateUnitType == 'week') {
          // 週
          gantt.config.min_column_width = 80
          gantt.config.scales = [
            { unit: 'year', step: 1, format: '%Y年' },
            {
              unit: 'week',
              step: 1,
              format: function (date: Date) {
                const adjustedDate = date.getDate() + date.getDay()
                const prefixes = ['0', '1', '2', '3', '4', '5']
                const weekNumber = parseInt(prefixes[0 | (adjustedDate / 7)]) + 1
                const dateToStr = gantt.date.date_to_str('%F')
                const month = dateToStr(date)
                return month + weekNumber + '週'
              },
            },
          ]
        } else if (dateUnitType == 'day') {
          // 日
          gantt.config.min_column_width = 35
          gantt.config.scales = [
            { unit: 'month', step: 1, format: '%Y年%F' },
            {
              unit: 'day',
              step: 1,
              format: '%j日',
            },
          ]
        }
      }

      gantt.parse(data)

      /**
       * タスクを開いて表示
       */
      gantt.eachTask(function (task) {
        task.$open = props.taskOpen
      })

      // 開始日を設定
      if (props.startDate) {
        gantt.config.start_date = props.startDate

        // 終了日を設定
        if (props.dateTermMonth) {
          gantt.config.end_date = dayjs(props.startDate)
            .date(1)
            .add(props.dateTermMonth, 'M')
            .subtract(1, 'd')
            .hour(23)
            .minute(59)
            .second(59)
            .toDate()
        }
      }

      gantt.config.show_tasks_outside_timescale = true

      gantt.parse(data)

      // スクロールを左上に移動
      gantt.scrollTo(0, 0)

      return () => gantt.clearAll()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    props.data,
    props.dateUnitType,
    props.dateTermMonth,
    props.startDate,
    props.taskOpen,
    props.editSchedule,
  ])
  return <div id={'gantt_here'} style={{ height: '65vh' }}></div>
}
