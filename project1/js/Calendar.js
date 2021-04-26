class Calendar {
  constructor(type, lang, server) {
    this.type = type;
    this.monthName = lang.monthName;
    this.weekName = lang.weekName;
    this.weekNameFull = lang.weekNameFull;
    this.getAllEvent = server.getAllEvent;
    this.getEvent = server.getAllEvent;
    this.createEvent = server.getAllEvent;
    this.token = server.token;
  }

  init() {
    /*
     * calendar result
     */

    this.resultDate = {};

    /*
     * element
     */

    this.el = {};
    this.el.period = document.querySelector('[data-calendar-period]');
    this.el.periodLeft = document.querySelector('[data-calendar-period-left]');
    this.el.periodRight = document.querySelector('[data-calendar-period-right]');
    this.el.typeButton = document.querySelector('[data-calendar-type]');
    this.el.body = document.querySelector('[data-calendar-body]');

    this.run();
  }

  run() {
    this.render();
    this.eventGlobal();

  }

  eventGlobal() {
    this.el.periodLeft.addEventListener('click', () => this.render('left'));
    this.el.periodRight.addEventListener('click', () => this.render('right'));
    this.el.typeButton.addEventListener('click', this.eventType.bind(this));
  }

  render(event) {
    if (!event) {
      this.date = new Date(new Date().getTime());
      this.daySize = 24 * 60 * 60 * 1000;
    }

    if (this.type === 'month') {
      if (event === 'left') {
        this.date.setMonth(this.date.getMonth() - 1);
      }

      if (event === 'right') {
        this.date.setMonth(this.date.getMonth() + 1);
      }

      this.renderMonth();
    } else {
      if (event === 'left') {
        this.date = new Date(this.week.mondey - (this.daySize * 6));
      }

      if (event === 'right') {
        this.date = new Date(this.week.sunday + (this.daySize * 6));
      }

      this.renderWeek();
    }
  }

  renderMonth() {
    this.swichClass(true);

    this.month = {};
    this.month.days = new Date(this.date.getFullYear(), this.date.getMonth() + 1, 0).getDate();
    this.month.prefix = new Date(this.date.getFullYear(), this.date.getMonth(), 0).getDay();
    this.month.prefixDay = new Date(this.date.getFullYear(), this.date.getMonth(), 0).getDate();
    this.month.sufix = new Date(this.date.getFullYear(), this.date.getMonth() + 1, 0).getDay();

    this.resultDate.start = this.date.getTime() - ((this.date.getDate() + this.month.prefix - 1) * this.daySize);
    this.resultDate.end = this.date.getTime() + (((this.month.days - this.date.getDate()) + ((6 - this.month.sufix) + 1)) * this.daySize);

    let days = '';

    for (let i = 1; i <= this.month.prefix; i++) {
      days += `
        <div class="month__day" data-calendar-event-body="${this.resultDate.start + (this.daySize * (i - 1))}">
          <div class="month__day--day">${this.weekName[i - 1] ? this.weekName[i - 1]: ''}<span>${this.month.prefixDay - (this.month.prefix - i)}</span></div>
        </div>
      `;
    }

    for (let i = 1; i <= this.month.days; i++) {
      let today;
      if (i === new Date().getDate() && this.date.getMonth() === new Date().getMonth()) {
        today = 'class="today"';
      }

      days += `
        <div class="month__day" data-calendar-event-body="${this.resultDate.start + (this.daySize * (i + this.month.prefix - 1))}">
          <div class="month__day--day">${this.weekName[(i + this.month.prefix) - 1] ? this.weekName[(i + this.month.prefix) - 1]: ''}<span ${today} >${i}</span></div>
        </div>
      `;
    }

    let sufix = 1;
    for (let i = this.month.sufix; i < 7; i++) {
      days += `
        <div class="month__day" data-calendar-event-body="${this.resultDate.start + (this.daySize * (sufix + this.month.prefix + this.month.days - 1))}">
          <div class="month__day--day"><span>${sufix}</span></div>
        </div>
      `;

      sufix += 1;
    }

    this.el.body.innerHTML = '';
    this.el.body.insertAdjacentHTML('beforeend', days);

    this.el.period.innerHTML = `${this.monthName[this.date.getMonth()]}, ${this.date.getFullYear()}`;

    this.getEventServer();
  }

  renderWeek() {
    this.swichClass();

    this.week = {};

    this.week.today = this.date.getTime();
    this.week.todayIndex = this.date.getDay() === 0 ? 7 : this.date.getDay();

    this.week.mondey = new Date(this.week.today + this.daySize - (this.daySize * this.week.todayIndex)).getTime();
    this.week.sunday = this.week.mondey + (this.daySize * 6);

    this.resultDate.start = this.week.mondey;
    this.resultDate.end = this.week.sunday;


    let html = `
      <div class="week__header">
        <svg class="week__header--back" viewBox="0 0 5 9" data-calendar-week-period-left >
          <path d="M0.419,9.000 L0.003,8.606 L4.164,4.500 L0.003,0.394 L0.419,0.000 L4.997,4.500 L0.419,9.000 Z" />
        </svg>
        `;

    let checkToday = '';
    for (let i = 0; i < 7; i++) {
      let today = '';
      let getDate = new Date(this.week.mondey + (this.daySize * i)).getDate();

      if (
        getDate === new Date().getDate() &&
        this.date.getMonth() === new Date().getMonth()
      ) {
        today = 'today active';
        checkToday = true;
      }

      html += `
        <div data-calendar-week-day class="week__header--day ${today}">${this.weekNameFull[i]}<span>${getDate}</span></div>
      `;
    }

    html += `
      <svg class="week__header--next" viewBox="0 0 5 9" data-calendar-week-period-right>
        <path d="M0.419,9.000 L0.003,8.606 L4.164,4.500 L0.003,0.394 L0.419,0.000 L4.997,4.500 L0.419,9.000 Z" />
      </svg>
    </div>
    `;

    this.el.body.innerHTML = "";
    this.el.body.insertAdjacentHTML('beforeend', html);

    this.el.weekPeriodLeft = document.querySelector('[data-calendar-week-period-left]');
    this.el.weekPeriodRight = document.querySelector('[data-calendar-week-period-right]');

    this.el.weekPeriodLeft.addEventListener('click', this.eventWeekPeriod);
    this.el.weekPeriodRight.addEventListener('click', this.eventWeekPeriod);

    this.el.period.innerHTML = `
        ${new Date(this.week.mondey).getDate()}.${('0' + (new Date(this.week.mondey).getMonth() + 1)).slice(-2)}.${new Date(this.week.mondey).getFullYear()} -
        ${new Date(this.week.sunday).getDate()}.${('0' + (new Date(this.week.sunday).getMonth() + 1)).slice(-2)}.${new Date(this.week.sunday).getFullYear()}
      `;

    if (checkToday === '') {
      document.querySelector('[data-calendar-week-day]').classList.add('active');
    }

    this.getEventServer();
  }

  swichClass(load) {
    this.el.body.classList.remove('week', 'month', 'load');
    this.el.body.classList.add(this.type);
    if (load) {
      this.el.body.classList.add('load');
    }
  }

  eventWeekPeriod(event) {
    const allInfo = document.querySelectorAll('[data-calendar-week-day]');
    const allTime = document.querySelectorAll('[data-calendar-week-time]');
    let allDays = [];

    if (allTime) {
      allTime.forEach((el) => {
        allDays.push(el.querySelectorAll('[data-calendar-week-time-day]'));
      })
    };

    allInfo.forEach((el, i) => {
      if (el.classList.contains('active') && el.classList.contains('today')) {
        allDays.forEach((time) => {
          console.log(time[i])
          time[i].classList.add('active');
        })
      }
    });


    let active;

    const clear = () => {
      allInfo.forEach((el, i) => {
        if (el.classList.contains('active')) {
          active = i;
        }

        el.classList.remove('active');

        allDays.forEach((time) => {
          time[i].classList.remove('active');
        });
      });
    };

    const swap = () => {
      allInfo[active].classList.add('active');

      allDays.forEach((time) => {
        time[active].classList.add('active');
      });
    }

    if (event) {
      clear();

      if (event.target.dataset.calendarWeekPeriodRight !== undefined) {
        clear();

        if (active + 1 === allInfo.length) {
          active = -1;
        }

        active += 1;
        swap();
      }

      if (event.target.dataset.calendarWeekPeriodLeft !== undefined) {
        if (active === 0) {
          active = all.length;
        }

        active -= 1;
        swap();
      }
    }
  }

  eventType(event) {
    const all = this.el.typeButton.querySelectorAll('[data-calendar-type-param]');

    all.forEach((item) => {
      item.classList.remove('active');
    });

    event.target.classList.add('active');

    this.type = event.target.dataset.calendarTypeParam;

    if (this.el.weekPeriodLeft !== undefined && this.el.weekPeriodRight !== undefined) {
      this.el.weekPeriodLeft.removeEventListener('click', this.eventWeekPeriod);
      this.el.weekPeriodRight.removeEventListener('click', this.eventWeekPeriod);
    }

    this.render();
  }

  timeZone(utc, inv = false) {
    const my = new Date().getTimezoneOffset();

    if (Math.sign(my) === -1) {
      if (inv) return new Date(utc - (Math.abs(my) * 60 * 1000)).getTime();
      return new Date(utc + (Math.abs(my) * 60 * 1000)).getTime();
    } else {
      if (inv) return new Date(utc + (Math.abs(my) * 60 * 1000)).getTime();
      return new Date(utc - (Math.abs(my) * 60 * 1000)).getTime();
    }
  }

  async server(url, type, formData) {
    let response;

    if (type === "GET") {
      if (formData) {
        url += '?' + new URLSearchParams(formData.entries()).toString();
      }

      response = await fetch(url, {
        headers: {
          'X-CSRF-TOKEN': this.token
        }
      })
    } else {
      response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRF-TOKEN': this.token
        }
      })
    }

    if (response.ok) {
      return await response.json();
    } else {
      console.error(`Error HTTP: ${response.status} ${response.url}`);
    }
  }

  getEventServer() {
    const formData = new FormData();
    formData.append('start', this.resultDate.start);
    formData.append('end', this.resultDate.end);

    const response = this.server(this.getAllEvent, 'GET', formData);
    response.then((result) => {
      if (result.status === true) {
        if (this.type === "month") {
          this.renderEventMonth(result.data)
        } else {
          this.renderEventWeek(result.data)
        }
      }
    })
  }

  renderEventMonth(data) {
    if (data.length === 0) {
      this.swichClass(true);
      return
    }

    const all = document.querySelectorAll('[data-calendar-event-body]');

    all.forEach((item) => {
      const itemDate = new Date(Number(item.dataset.calendarEventBody));

      let search = this.renderEventSearch(data, itemDate.getDate(), itemDate.getMonth());

      if (search.length === 0) return

      search.forEach((event) => {
        item.innerHTML += `
          <div class="month__day--event" data-week-status="${event.type}">
            <span>${event.title}</span>
            </div>
        `;
      })
    })
    console.log(data)
  }

  renderEventWeek(data) {
    if (data.length === 0) {
      this.swichClass(true);
      return
    }

    let time = data.map(el => el.time_start);
    time = [...new Set(time)];

    let timeLine = time.map((el) => {
      return `${('0' + new Date(el).getHours()).slice(-2)}:${('0' + new Date(el).getMinutes()).slice(-2)}`;
    }).sort();
    timeLine = [...new Set(timeLine)];

    timeLine.forEach((el) => {
      let html = `
          <div class="week__time" data-calendar-week-time="${el}">
          <div class="week__time--time">${el}</div>
      `;

      for (let i = 1; i <= 7; i++) {
        html += `<div class="week__day" data-calendar-week-time-day="${i}" ></div>`;
      }

      html += "</div>";
      this.el.body.insertAdjacentHTML('beforeend', html);
    });


    data.forEach((el) => {
      let myCheckTimeLine = `${('0' + new Date(el.time_start).getHours()).slice(-2)}:${('0' + new Date(el.time_start).getMinutes()).slice(-2)}`;
      let weekIndex = new Date(el.time_start).getDay();
      const elTime = document.querySelector('[data-calendar-week-time="' + myCheckTimeLine + '"]');
      const elTimeIndex = elTime.querySelector('[data-calendar-week-time-day="' + (weekIndex === 0 ? 7 : weekIndex) + '"]');

      let html = `
          <div class="week__item" data-week-status="${el.type}">
            <div class="week__item--title">${el.title}</div>
            <div class="week__item--time">
              <span>${myCheckTimeLine}</span> - <span>${('0' + new Date(el.time_end).getHours()).slice(-2)}:${('0' + new Date(el.time_end).getMinutes()).slice(-2)}</span>
            </div>
            <div class="week__item--location">
              <span class="week__item--location--icon"></span>
              <span>${el.location}</span>
            </div>
            <div class="week__item--users">
              <span class="week__item--users--icon"></span>
              <div class="week__item--users--count">+${el.users.length}</div>
              </div>
          </div>
          `;
      elTimeIndex.insertAdjacentHTML('beforeend', html);
    })

    this.eventWeekPeriod();
    this.swichClass(true);
  }

  renderEventSearch(data, day, month) {
    const result = data.filter((item) => {
      const date = new Date(item.time_start);
      if (date.getDate() === day && date.getMonth() === month) {
        return true
      }
    })

    return result
  }

}


/*
 *  new Calendar
 */

const lang = {};
lang.monthName = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
lang.weekName = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
lang.weekNameFull = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресение'];

const server = {};
server.getAllEvent = 'event.html';
server.getEvent = 'event.html';
server.createEvent = 'event.html';
server.token = document.querySelector('[name="csrf-token"]').content;

const calendar = new Calendar('week', lang, server);
calendar.init();

console.log(calendar)
