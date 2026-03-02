// 定时提醒配置
// 时间格式: "HH:MM" (24小时制)
// 支持多种类型: daily(每天), weekday(工作日), weekend(周末), specific(特定星期)

const timeSchedule = {
  // 每日提醒
  daily: [
    {
      time: "09:00",
      message: "早上好呀！新的一天开始啦，加油！💪"
    },
    {
      time: "12:00",
      message: "该吃午饭了，记得按时吃饭哦~"
    },
    {
      time: "14:30",
      message: "下午容易犯困，起来走走，活动一下吧！"
    },
    {
      time: "18:00",
      message: "下班时间到啦！今天也辛苦了~"
    },
    {
      time: "19:45",
      message: "夜深了，早点休息吧，晚安😴"
    }
  ],

  // 工作日提醒 (周一到周五)
  weekday: [
    {
      time: "10:30",
      message: "工作一段时间了，喝杯水休息一下吧~"
    },
    {
      time: "16:00",
      message: "下午茶时间！来点小零食补充能量~"
    }
  ],

  // 周末提醒
  weekend: [
    {
      time: "10:00",
      message: "周末愉快！今天想做什么呢？"
    },
    {
      time: "20:00",
      message: "周末的夜晚，放松一下吧~"
    }
  ],

  // 特定星期几的提醒 (0=周日, 1=周一, ..., 6=周六)
  specific: [
    {
      day: 7, // 周一
      time: "20:30",
      message: "写一些东西吧，和这一周说再见！📝"
    },
    {
      day: 5, // 周五
      time: "17:00",
      message: "Friday! 周末就要来啦！🎉"
    }
  ]
};

module.exports = timeSchedule;
