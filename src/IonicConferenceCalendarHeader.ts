import * as moment from 'moment';
import { Component, ViewChildren, QueryList, ElementRef, ViewChild, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { PickerController, PickerColumn, Picker } from 'ionic-angular';

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
                    'August', 'September', 'October', 'November', 'December']

interface IEventYear {
  year: number;
  months: IEventMonth[];
  dates: Date[];
}

interface IEventMonth {
  month: number;
  monthName: string;
  days: number[];
  dates: Date[];
}

@Component({
  selector: 'ionic-conference-calendar-header',
  template: `
<div class="header-calendar-wrapper">

  <div (click)="openDatePicker()">
    <div class="month">{{getMonthName()}}</div>
    <div class="year">{{activeYear}}</div>
  </div>

  <div #dayWrapper class="day-wrapper">

    <div #daySlider
         *ngIf="years.length"
         [style.width]="getSliderWidth() + 'px'"
         class="day-slider">

      <div class="day-slider-padding"></div>

      <div #day 
           *ngFor="let d of getDaysInMonth()"
           [ngClass]="{active: d == activeDay}"
           (click)="setActiveDay(d)"
           class="day">
           {{d}}
      </div>

      <div class="day-slider-padding"></div>
            
    </div>

  </div>

</div>
`
})
export class IonicConferenceCalendarHeader {

  private margin: number = 0.5;

  private dayWidth: number = 64;

  private years: IEventYear[] = [];

  private pickerYearColumn: PickerColumn;

  private pickerMonthColumn: PickerColumn;

  public sliderWidth: number;

  public activeYear: number;

  public activeMonth: number;

  public activeDay: number;

  @Output('change') change = new EventEmitter<string | Date>();

  @Input('dates') dates: Array<string | Date> = [];

  @Input('date') date: string | Date;

  @ViewChild('dayWrapper') dayWrapper: ElementRef;

  @ViewChild('daySlider') daySlider: ElementRef;

  @ViewChildren('day') days: QueryList<ElementRef>;

  constructor(private pickerController: PickerController) {}

  public ngOnChanges(changes: SimpleChanges) {
    var activeDateChanged = false;
    var datesChanged = false;

    if(!this.pickerMonthColumn) {
      this.pickerMonthColumn = {
        name: 'Month',
        align: 'center',
        options: []
      };

      this.pickerYearColumn = {
        name: 'Year',
        align: 'center',
        options: []
      };
    }

    if(changes.dates) {
      this.expandEvents();

      if(!changes.date) {
        this.setActiveYear(this.years[0].year, false);
      }
    }

    if(changes.date) {
      var dt = moment(this.date);
      this.setActiveDay(dt.utc().date(), dt.utc().month(), dt.utc().year(), false);
    }
  }

  public getSliderWidth(): number {
    var dayWrapperWidth = (<HTMLDivElement>this.dayWrapper.nativeElement).offsetWidth;

    var numDays = this.getDaysInMonth(this.activeMonth).length;

    return Math.max((dayWrapperWidth + this.dayWidth+(this.dayWidth*this.margin)) * numDays);
  }

  /**
   * Takes all this.dates and expands into years array
   */
  private expandEvents() {
    this.years = [];

    this.dates.forEach((dt) => {
      var date = moment(dt);

      var nDay = date.utc().date();
      var nYear = date.utc().year();
      var nMonth = date.utc().month();
      var monthName = monthNames[nMonth];

      var year = this.years.filter((yr) => {
        return yr.year === nYear;
      })[0];

      if(!year) {
        year = {
          year: nYear,
          dates: [],
          months: []
        };

        this.years.push(year);
      }

      year.dates.push(date.toDate());

      var month = year.months.filter(m => {
        return m.month === nMonth;
      })[0];

      if(!month) {
        month = {
          month: nMonth,
          monthName: monthName,
          dates: [],
          days: []
        };

        year.months.push(month);
      }

      month.dates.push(date.toDate());

      if(month.days.indexOf(nDay) == -1) {
        month.days.push(nDay);
      }

      month.days = month.days.sort();

      year.months = year.months.sort((a, b) => {
        if(a.month > b.month) {
          return 1;
        } else if (b.month > a.month) {
          return -1;
        }

        return 0;
      });

    });

    this.years = this.years.sort((a, b) => {
      if(a.year > b.year) {
          return 1;
      } else if (b.year > a.year) {
        return -1;
      }

      return 0;
    });

    this.years.forEach(yr => {
      this.pickerYearColumn.options.push({
        value: yr.year,
        text: yr.year.toString()
      });
    });
  }

  public getDaysInMonth(m: number = this.activeMonth, y: number = this.activeYear) : number[] {
    return this.getMonth(m, y).days;
  }

  private getYear(y: number = this.activeYear) {
    return this.years.filter((yr) => {
      return yr.year === y;
    })[0];
  }

  private getMonth(m: number = this.activeMonth, y: number = this.activeYear) {
    var year = this.getYear(y);

    return year.months.filter((mn) => {
      return mn.month === m;
    })[0];
  }

  public setActiveMonth(m: number, y: number = this.activeYear, emitEvent: boolean = true) {
    this.activeYear = y;
    this.activeMonth = m;
    this.setActiveDay(this.getMonth(m, y).days[0], m, y, emitEvent);
  }

  public setActiveYear(y: number, emitEvent: boolean = true) {
    this.activeYear = y;
    var year = this.getYear(y);
    this.setActiveMonth(this.getYear(y).months[0].month, y, emitEvent);
  }

  public setActiveDay(d: number, m: number = this.activeMonth, y: number = this.activeYear, emitEvent: boolean = true) {
    this.activeYear = y;
    this.activeMonth = m;
    this.activeDay = d;

    this.updateDayScrollPosition();

    if(emitEvent) {
      this.change.emit(this.getDateString());
    }
  }

  public updateDayScrollPosition() {
    if(this.days) {
      var idx = this.getMonth().days.indexOf(this.activeDay);
      var day = this.days.toArray()[idx];
      let offset = (<HTMLDivElement>day.nativeElement).offsetLeft - this.dayWrapper.nativeElement.offsetWidth/2 + this.dayWidth/2;

      this.scrollTo(offset);
    }
  }

  public getMonthName(m: number = this.activeMonth) {
    return monthNames[m];
  }

  public openDatePicker() {

    this.updatePickerMonthOptions(this.years[0].year);

    let columns: PickerColumn[] = [];

    if(this.years.length > 1) {
      columns.push(this.pickerYearColumn);
    }

    columns.push(this.pickerMonthColumn);

    var picker = this.pickerController.create({
      columns: columns,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Done',
          handler: (data: any) => {
            this.setActiveMonth(data.Month.value, data.Year ? data.Year.value : this.years[0].year);
          }
        }
      ]
    });

    let yr = this.years[0].year;

    /**
     * July, 15 2017
     * 
     * Hacked the shit out of this. As of this date, current ControlPicker does not support dynamic column items.
     * If they update this, this should be unhacked.
     * 
     * Didn't mean to introduce lavaflow this early.
     */

    picker.ionChange.subscribe((change) => {
      if(change.Year.value !== yr) {

        yr = change.Year.value;

        this.updatePickerMonthOptions(yr);

        setTimeout(() => {
          (<any>picker)._cmp._component._cols._results.forEach(r => {
            r.col.prevSelected = null
          });

          picker.refresh();
        });
      }
    });

    picker.present();
    

    setTimeout(() => {
      (<any>picker)._cmp._component._cols._results.forEach(r => {
        r.lastIndex = 0;
        r.col.selectedIndex = 0;
        r.col.prevSelected = null
      });
      
      picker.refresh();
    });
  }

  private updatePickerMonthOptions(year: number) {
    this.pickerMonthColumn.options.length = 0;
    
    this.getYear(year).months.forEach((mn) => {
      this.pickerMonthColumn.options.push({
        value: mn.month,
        text: mn.monthName
      });
    });
  }

  private getDateString(date: string | Date = null) {
    if(!date) {
      return `${this.activeYear}-${this.padLeft(this.activeMonth+1)}-${this.padLeft(this.activeDay) }`;
    }

    var dt = moment(date);

    var day = dt.utc().date();
    var month = dt.utc().month();
    var year = dt.utc().year();

    return `${year}-${this.padLeft(month+1)}-${this.padLeft(day)}`;
  }

  private scrollTo(to) {
    var ele = <HTMLDivElement>this.dayWrapper.nativeElement;

    ele.scrollLeft = to;
  }

  private padLeft(n: number) {
    let str = n.toString();
    let pad = '00';
    return pad.substr(0, pad.length - str.length) + str;
  }
}