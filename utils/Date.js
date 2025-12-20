import { DateTime } from "luxon";

class Date {
  constructor(value) {
    this.date = value ? DateTime.fromISO(value) : DateTime.local();
  }

  setLocale(locale) {
    this.date.setLocale(locale);
    return this;
  }

  toString = () => {
    return this.date.toString();
  };

  toJSON() {
    return this.date.toJSON();
  }

  setMillis(long) {
    this.date = DateTime.fromISO(convertLongToString(long));
    return this;
  }

  getMillis() {
    return this.date.toMillis();
  }

  format(form) {
    return this.date.toFormat(form);
  }

  addDays(value) {
    if (value < 0) this.date = this.date.minus({ days: Math.abs(value) });
    else this.date = this.date.plus({ days: Math.abs(value) });
    return this;
  }

  addYears(value) {
    if (value < 0) this.date = this.date.minus({ years: Math.abs(value) });
    else this.date = this.date.plus({ years: Math.abs(value) });
    return this;
  }

  addMonths(value) {
    if (value < 0) this.date = this.date.minus({ months: Math.abs(value) });
    else this.date = this.date.plus({ months: Math.abs(value) });
    return this;
  }

  addHours(value) {
    if (value < 0) this.date = this.date.minus({ hours: Math.abs(value) });
    else this.date = this.date.plus({ hours: Math.abs(value) });
    return this;
  }

  addMinutes(value) {
    if (value < 0) this.date = this.date.minus({ minutes: Math.abs(value) });
    else this.date = this.date.plus({ minutes: Math.abs(value) });
    return this;
  }

  addSeconds(value) {
    if (value < 0) this.date = this.date.minus({ seconds: Math.abs(value) });
    else this.date = this.date.plus({ seconds: Math.abs(value) });
    return this;
  }

  addMilliSeconds(value) {
    if (value < 0)
      this.date = this.date.minus({ milliseconds: Math.abs(value) });
    else this.date = this.date.plus({ milliseconds: Math.abs(value) });
    return this;
  }

  setYear(value) {
    this.date = this.date.set({ year: value });
    return this;
  }

  setMonth(value) {
    if (value >= 1 && value < 12) {
      this.date = this.date.set({ month: value });
    }
    return this;
  }

  setDay(value) {
    if (value >= 1 && value < 31) {
      this.date = this.date.set({ day: value });
    }
    return this;
  }

  setHour(value) {
    if (value >= 0 && value < 24) {
      this.date = this.date.set({ hour: value });
    }
    return this;
  }

  setMinute(value) {
    if (value >= 0 && value < 59) {
      this.date = this.date.set({ minute: value });
    }
    return this;
  }

  setSecond(value) {
    if (value >= 0 && value < 59) {
      this.date = this.date.set({ second: value });
    }
    return this;
  }

  setMilliSecond(value) {
    if (value >= 0 && value < 999) {
      this.date = this.date.set({ millisecond: value });
    }
    return this;
  }

  compareTo(value) {
    return value.getMillis() === this.getMillis()
      ? 0
      : value.getMillis() > this.getMillis()
      ? -1
      : 1;
  }

  diffSeconds(value) {
    return this.date.diff(value.date, ["seconds"]).toObject().seconds;
  }

  diffMinutes(value) {
    return this.date.diff(value.date, ["minutes"]).toObject().minutes;
  }

  diffHours(value) {
    return this.date.diff(value.date, ["hours"]).toObject().hours;
  }

  diffDays(value) {
    return this.date.diff(value.date, ["days"]).toObject().days;
  }

  diffMonths(value) {
    return this.date.diff(value.date, ["months"]).toObject().months;
  }

  diffYears(value) {
    return this.date.diff(value.date, ["years"]).toObject().years;
  }

  /**
   * Get the value of unit.
   *
   * @param unit - a unit such as 'minute' or 'day'
   *
   * @example
   * DateTime.local(2017, 7, 4).get('month'); //=> 7
   * @example
   * DateTime.local(2017, 7, 4).get('day'); //=> 4
   */
  get(unit) {
    return this.date.get(unit);
  }

  convertLongToString(long) {
    let newDate = new Date();
    newDate.setTime(long);
    let year = newDate.getFullYear();
    let month = newDate.getMonth() + 1;
    let date = newDate.getDate();
    if (month < 10) month = `0${month}`;
    if (date < 10) date = `0${date}`;
    return `${year}-${month}-${date}`;
  }
}

export default Date;
