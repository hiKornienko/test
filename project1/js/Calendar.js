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

    this.el.info = document.querySelector('[data-calendar-info]');
    this.el.infoTitle = document.querySelector('[data-calendar-info-title]');
    this.el.infoType = document.querySelector('[data-calendar-info-type]');
    this.el.infoDate = document.querySelector('[data-calendar-info-date]');
    this.el.infoLocation = document.querySelector('[data-calendar-info-location]');
    this.el.infoDesc = document.querySelector('[data-calendar-info-desc]');
    this.el.infoUsers = document.querySelector('[data-calendar-info-users]');

    this.el.edit = document.querySelector('[data-calendar-edit]');
    this.el.editId = document.querySelector('[data-calendar-edit-id]');
    this.el.editTitle = document.querySelector('[data-calendar-edit-title]');
    this.el.editSelect = document.querySelector('[data-calendar-edit-select]');
    this.el.editLocation = document.querySelector('[data-calendar-edit-lcation]');
    this.el.editDesc = document.querySelector('[data-calendar-edit-desc]');
    this.el.editUser = document.querySelector('[data-calendar-edit-user]');
    this.el.editUserList = document.querySelector('[data-calendar-edit-user-list]');
    this.el.editSend = document.querySelector('[data-calendar-edit-user-send]');
    this.el.editDelete = document.querySelector('[data-calendar-edit-user-delete]');

    this.el.editPicker = document.querySelector('[data-calendar-edit-picker]');
    this.el.editPickerStart = document.querySelector('[data-calendar-edit-picker-start]');
    this.el.editPickerEnd = document.querySelector('[data-calendar-edit-picker-end]');


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
    this.el.info.addEventListener('click', this.eventModal.bind(this));
    this.el.edit.addEventListener('click', this.eventModal.bind(this));
  }

  render(event) {
    this.swichClass();

    if (!event) {
      this.date = new Date(new Date().getTime());
      this.daySize = 24 * 60 * 60 * 1000;
    }

    const allId = document.querySelectorAll('[data-calendar-event-id]');
    if (allId.length > 0) {
      allId.forEach((el) => {
        el.removeEventListener('click', this.eventId);
      })
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
        ${('0' + (new Date(this.week.mondey).getDate())).slice(-2)}.${('0' + (new Date(this.week.mondey).getMonth() + 1)).slice(-2)}.${new Date(this.week.mondey).getFullYear()} -
        ${('0' + (new Date(this.week.sunday).getDate())).slice(-2)}.${('0' + (new Date(this.week.sunday).getMonth() + 1)).slice(-2)}.${new Date(this.week.sunday).getFullYear()}
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
    if (this.el.weekPeriodLeft !== undefined && this.el.weekPeriodRight !== undefined) {
      this.el.weekPeriodLeft.removeEventListener('click', this.eventWeekPeriod);
      this.el.weekPeriodRight.removeEventListener('click', this.eventWeekPeriod);
    };

    if (event.target.dataset.calendarTypeParam === "week" || event.target.dataset.calendarTypeParam === "month") {
      const all = this.el.typeButton.querySelectorAll('[data-calendar-type-param]');

      all.forEach((item) => {
        item.classList.remove('active');
      });

      event.target.classList.add('active');
      this.type = event.target.dataset.calendarTypeParam;

      this.render();
    } else {
      this.eventCreate();
    };
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
          this.data = result.data;
          this.renderEventMonth(result.data)
        } else {
          this.data = result.data;
          this.renderEventWeek(result.data)
        }
      }
    })
  }

  renderEventMonth() {
    if (this.data.length === 0) {
      this.swichClass(true);
      return
    }

    const all = document.querySelectorAll('[data-calendar-event-body]');

    all.forEach((item) => {
      const itemDate = new Date(Number(item.dataset.calendarEventBody));

      let search = this.renderEventSearch(this.data, itemDate.getDate(), itemDate.getMonth());

      if (search.length === 0) return

      search.forEach((event) => {
        item.innerHTML += `
          <div class="month__day--event" data-week-status="${event.type}" data-calendar-event-id="${event.id}">
            <span>${event.title}</span>
            </div>
        `;
      })
    })

    const allId = document.querySelectorAll('[data-calendar-event-id]');
    allId.forEach((el) => {
      el.addEventListener('click', this.eventId.bind(this));
    })

    this.swichClass(true);
  }

  renderEventWeek() {
    if (this.data.length === 0) {
      this.swichClass(true);
      return
    }

    let time = this.data.map(el => el.time_start);
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


    this.data.forEach((el) => {
      let myCheckTimeLine = `${('0' + new Date(el.time_start).getHours()).slice(-2)}:${('0' + new Date(el.time_start).getMinutes()).slice(-2)}`;
      let weekIndex = new Date(el.time_start).getDay();
      const elTime = document.querySelector('[data-calendar-week-time="' + myCheckTimeLine + '"]');
      const elTimeIndex = elTime.querySelector('[data-calendar-week-time-day="' + (weekIndex === 0 ? 7 : weekIndex) + '"]');

      let html = `
          <div class="week__item" data-week-status="${el.type}" data-calendar-event-id="${el.id}">
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

    const allId = document.querySelectorAll('[data-calendar-event-id]');
    allId.forEach((el) => {
      el.addEventListener('click', this.eventId.bind(this));
    })

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

  eventModal(e) {
    if (e.target.dataset.calendarInfo !== undefined) {
      e.target.classList.remove('active');
    }

    if (e.target.dataset.calendarEdit !== undefined) {
      e.target.classList.remove('active');
    }
  }

  eventId(e) {
    this.data.forEach((el) => {
      if (Number(e.target.dataset.calendarEventId) === el.id) {
        if (el.autor === false) {
          this.eventInfo(el)
          this.el.info.classList.add('active');
        } else {
          this.eventEdit(el);
          this.el.edit.classList.add('active');
        }
      }
    })
  }

  eventInfo(data) {
    const time = new Date(data.time_start);
    const timeEnd = new Date(data.time_end);
    this.el.infoTitle.innerHTML = data.title;
    this.el.infoType.innerHTML = data.type;
    this.el.infoDate.innerHTML = `${('0' + time.getDate()).slice(-2)}.${('0' + time.getMonth()).slice(-2)}.${time.getFullYear()} ${('0' + time.getHours()).slice(-2)}:${('0' + time.getMinutes()).slice(-2)} - ${('0' + timeEnd.getHours()).slice(-2)}:${('0' + timeEnd.getMinutes()).slice(-2)} `;
    this.el.infoLocation.innerHTML = data.location;
    this.el.infoDesc.innerHTML = data.description;

    this.el.infoUsers.innerHTML = '';
    data.users.forEach((user) => {
      this.el.infoUsers.innerHTML += `${user.name} `;
    })
  }

  eventEdit(data) {
    this.el.editId.value = data.id;
    this.el.editTitle.value = data.title;
    this.el.editLocation.value = data.location;
    this.el.editDesc.value = data.description;

    for (const option of this.el.editSelect.options) {
      if (option.value === data.type) {
        option.selected = true;
      }
    }

    this.pickerPlugin(data.time_start, data.time_end, this.el.editPicker, this.el.editPickerStart, this.el.editPickerEnd);


    // this.el.edit = document.querySelector('[data-calendar-edit]');
    // this.el.editId = document.querySelector('[data-calendar-edit-id]');
    // this.el.editTitle = document.querySelector('[data-calendar-edit-title]');
    // this.el.editSelect = document.querySelector('[data-calendar-edit-select]');
    // this.el.editDate = document.querySelector('[data-calendar-edit-date]');
    // this.el.editDateStart = document.querySelector('[data-calendar-edit-date-start]');
    // this.el.editDateEnd = document.querySelector('[data-calendar-edit-date-end]');
    // this.el.editLocation = document.querySelector('[data-calendar-edit-lcation]');
    // this.el.editDesc = document.querySelector('[data-calendar-edit-desc]');
    // this.el.editUser = document.querySelector('[data-calendar-edit-user]');
    // this.el.editUserList = document.querySelector('[data-calendar-edit-user-list]');
    // this.el.editSend = document.querySelector('[data-calendar-edit-user-send]');
    // this.el.editDelete = document.querySelector('[data-calendar-edit-user-delete]');
  }

  eventCreate(e) {
    this.el.create.classList.add('active');
  }

  pickerPlugin(start, end, el, elStart, elEnd) {
    console.log(start, end, el, elStart, elEnd)
    if (this.picker && this.pickerStart && this.pickerEnd) {
      this.picker.destroy();
      this.pickerStart.destroy();
      this.pickerEnd.destroy();
    }

    this.picker = new Picker(el, {
      format: 'DD.MM.YYYY',
      headers: 'Date',
    });

    this.pickerStart = new Picker(elStart, {
      format: 'HH:mm',
      headers: 'Start',
    });

    this.pickerEnd = new Picker(elEnd, {
      format: 'HH:mm',
      headers: 'End',
    });

    if (start && end) {
      this.picker.setDate(new Date(start));
      this.pickerStart.setDate(new Date(start));
      this.pickerEnd.setDate(new Date(end));

      el.value = `${('0' + (new Date(start).getDate())).slice(-2)}.${('0' + (new Date(start).getMonth() + 1)).slice(-2)}.${new Date(start).getFullYear()}`;
      elStart.value = `${('0' + new Date(start).getHours()).slice(-2)}:${('0' + new Date(start).getMinutes()).slice(-2)}`;
      elEnd.value = `${('0' + new Date(end).getHours()).slice(-2)}:${('0' + new Date(end).getMinutes()).slice(-2)}`;
    }
  }

  userList(){
    
  }

}


const lang = {};
lang.monthName = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
lang.weekName = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
lang.weekNameFull = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресение'];

const server = {};
server.getAllEvent = 'event.html';
server.getEvent = 'event.html';
server.createEvent = 'event.html';
server.token = document.querySelector('[name="csrf-token"]').content;

const calendar = new Calendar('month', lang, server);
calendar.init();


// new Picker(document.querySelector('#timeDate'), {
//   format: 'DD.MM.YYYY',
//   headers: true,
// });
//
// new Picker(document.querySelector('#timeStart'), {
//   format: 'HH:mm',
//   headers: true,
// });
//
// new Picker(document.querySelector('#timeEnd'), {
//   format: 'HH:mm',
//   headers: true,
// });



console.log(calendar)
